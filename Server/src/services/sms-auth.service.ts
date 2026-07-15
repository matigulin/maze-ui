import { randomInt } from 'node:crypto';
import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import {
  ACCESS_TOKEN_TTL_SEC,
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_TTL_SEC,
} from '../lib/constants.js';
import { ValidationError } from '../lib/errors.js';
import { maskPhone, normalizePhone } from '../lib/phone.js';
import { hashSecret, verifySecret } from '../lib/password.js';
import { consumeRateLimit } from '../lib/rate-limit.js';
import { RateLimitError } from '../lib/errors.js';
import { signAccessToken } from '../lib/jwt.js';
import { SmsVerification, User } from '../models/user.js';
import { getQueue, QUEUE_NAMES } from '../queues/index.js';
import { mergeGuestCartToUser } from './cart.service.js';
import { publishOutboxEvent } from './outbox.service.js';
import { createRefreshSession } from './token.service.js';
import { isDevOtpEnabled, loadEnv } from '../config/env.js';

const SEND_MESSAGE = 'Если номер корректен, код отправлен';
const RATE_WINDOW_SEC = 15 * 60;
const DEV_OTP_SEND_PHONE_LIMIT = 50;
const DEV_OTP_SEND_IP_LIMIT = 200;

export interface AuthUserDto {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
}

function mapUser(user: User): AuthUserDto {
  return {
    id: user.id,
    phone: user.phone,
    firstName: user.get('first_name') as string | null,
    lastName: user.get('last_name') as string | null,
  };
}

function generateOtpCode(): string {
  const max = 10 ** OTP_LENGTH;
  return String(randomInt(0, max)).padStart(OTP_LENGTH, '0');
}

async function checkRateLimitOnly(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  try {
    await consumeRateLimit(key, limit, windowSeconds);
    return false;
  } catch (error) {
    if (error instanceof RateLimitError) {
      return true;
    }
    throw error;
  }
}

export async function sendSmsCode(
  phoneRaw: string,
  ip: string,
): Promise<{ message: string; devCode?: string }> {
  const env = loadEnv();
  let phone: string;

  try {
    phone = normalizePhone(phoneRaw);
  } catch {
    return { message: SEND_MESSAGE };
  }

  const phoneLimit = env.NODE_ENV === 'development' ? DEV_OTP_SEND_PHONE_LIMIT : 3;
  const ipLimit = env.NODE_ENV === 'development' ? DEV_OTP_SEND_IP_LIMIT : 10;

  const phoneLimited = await checkRateLimitOnly(
    `rate:otp-send:phone:${phone}`,
    phoneLimit,
    RATE_WINDOW_SEC,
  );
  const ipLimited = await checkRateLimitOnly(
    `rate:otp-send:ip:${ip}`,
    ipLimit,
    RATE_WINDOW_SEC,
  );

  if (phoneLimited || ipLimited) {
    if (env.NODE_ENV === 'development') {
      console.warn(`[dev][sms] send rate-limited for ${maskPhone(phone)}`);
    }
    return { message: SEND_MESSAGE };
  }

  const code = generateOtpCode();
  const codeHash = await hashSecret(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_SEC * 1000);
  const sequelize = getSequelize();

  await sequelize.transaction(async (transaction) => {
    await SmsVerification.destroy({
      where: {
        phone,
        verified_at: null,
      },
      transaction,
    });

    await SmsVerification.create(
      {
        phone,
        code_hash: codeHash,
        expires_at: expiresAt,
        attempts: 0,
      },
      { transaction },
    );
  });

  const devOtp = isDevOtpEnabled(env);

  if (devOtp) {
    console.info(`[dev][sms] OTP for ${maskPhone(phone)}: ${code}`);
  }

  try {
    await getQueue(QUEUE_NAMES.sms).add(
      'otp',
      { phone: maskPhone(phone), code },
      { jobId: `otp:${phone}:${Date.now()}` },
    );
  } catch (error) {
    if (devOtp || env.NODE_ENV === 'development') {
      console.warn('[dev][sms] queue unavailable, OTP logged above only', error);
    } else {
      throw error;
    }
  }

  if (devOtp) {
    return { message: SEND_MESSAGE, devCode: code };
  }

  return { message: SEND_MESSAGE };
}

export async function verifySmsCode(
  phoneRaw: string,
  code: string,
  guestSessionId: string | undefined,
): Promise<{
  accessToken: string;
  expiresIn: number;
  user: AuthUserDto;
  refreshJti: string;
}> {
  const phone = normalizePhone(phoneRaw);

  await consumeRateLimit(`rate:otp-verify:phone:${phone}`, 10, RATE_WINDOW_SEC);

  const verification = await SmsVerification.findOne({
    where: {
      phone,
      verified_at: null,
      expires_at: { [Op.gt]: new Date() },
    },
    order: [['created_at', 'DESC']],
  });

  if (!verification) {
    throw new ValidationError('Неверный или просроченный код');
  }

  if (verification.attempts >= OTP_MAX_ATTEMPTS) {
    throw new ValidationError('Превышено число попыток. Запросите новый код');
  }

  const isValid = await verifySecret(code, verification.code_hash);
  if (!isValid) {
    await verification.update({ attempts: verification.attempts + 1 });
    throw new ValidationError('Неверный или просроченный код');
  }

  const sequelize = getSequelize();
  const user = await sequelize.transaction(async (transaction) => {
    await verification.update({ verified_at: new Date() }, { transaction });

    const [userRecord] = await User.findOrCreate({
      where: { phone },
      defaults: { phone },
      transaction,
    });

    await publishOutboxEvent(
      {
        event_type: 'user.sms_verified',
        aggregate_type: 'user',
        aggregate_id: userRecord.id,
        payload: { phone },
      },
      transaction,
    );

    return userRecord;
  });

  const refreshJti = await createRefreshSession({
    sub: user.id,
    type: 'user',
  });

  await mergeGuestCartToUser(guestSessionId, user.id);

  const accessToken = await signAccessToken({ sub: user.id, type: 'user' });

  return {
    accessToken,
    expiresIn: ACCESS_TOKEN_TTL_SEC,
    user: mapUser(user),
    refreshJti,
  };
}
