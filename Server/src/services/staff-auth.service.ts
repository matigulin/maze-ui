import { getSequelize } from '../config/database.js';
import {
  ACCESS_TOKEN_TTL_SEC,
} from '../lib/constants.js';
import { UnauthorizedError, ValidationError } from '../lib/errors.js';
import { verifySecret } from '../lib/password.js';
import { consumeRateLimit } from '../lib/rate-limit.js';
import { signAccessToken, type StaffRole } from '../lib/jwt.js';
import { StaffUser } from '../models/user.js';
import { createRefreshSession } from './token.service.js';

const RATE_WINDOW_SEC = 15 * 60;

export interface StaffAuthDto {
  id: string;
  email: string;
  role: StaffRole;
  firstName: string | null;
  lastName: string | null;
}

function mapStaff(staff: StaffUser): StaffAuthDto {
  return {
    id: staff.id,
    email: staff.email,
    role: staff.role as StaffRole,
    firstName: staff.get('first_name') as string | null,
    lastName: staff.get('last_name') as string | null,
  };
}

async function recordStaffLoginAttempt(input: {
  email: string;
  ip: string;
  userAgent: string | null;
  staffUserId: string | null;
  success: boolean;
}) {
  const sequelize = getSequelize();
  await sequelize.query(
    `INSERT INTO staff_login_attempts
      (id, staff_user_id, email, ip, user_agent, success, created_at, updated_at)
     VALUES (gen_random_uuid(), :staffUserId, :email, :ip, :userAgent, :success, NOW(), NOW())`,
    {
      replacements: {
        staffUserId: input.staffUserId,
        email: input.email,
        ip: input.ip,
        userAgent: input.userAgent,
        success: input.success,
      },
    },
  );
}

export async function loginStaff(input: {
  email: string;
  password: string;
  ip: string;
  userAgent: string | null;
}): Promise<{
  accessToken: string;
  expiresIn: number;
  staff: StaffAuthDto;
  refreshJti: string;
}> {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) {
    throw new ValidationError('Email и пароль обязательны');
  }

  await consumeRateLimit(`rate:staff-login:email:${email}`, 5, RATE_WINDOW_SEC);
  await consumeRateLimit(`rate:staff-login:ip:${input.ip}`, 5, RATE_WINDOW_SEC);

  const staff = await StaffUser.findOne({
    where: { email, is_active: true },
  });

  if (!staff) {
    await recordStaffLoginAttempt({
      email,
      ip: input.ip,
      userAgent: input.userAgent,
      staffUserId: null,
      success: false,
    });
    throw new UnauthorizedError('UNAUTHORIZED', 'Неверный email или пароль');
  }

  const passwordHash = staff.get('password_hash') as string;
  const valid = await verifySecret(input.password, passwordHash);

  if (!valid) {
    await recordStaffLoginAttempt({
      email,
      ip: input.ip,
      userAgent: input.userAgent,
      staffUserId: staff.id,
      success: false,
    });
    throw new UnauthorizedError('UNAUTHORIZED', 'Неверный email или пароль');
  }

  await recordStaffLoginAttempt({
    email,
    ip: input.ip,
    userAgent: input.userAgent,
    staffUserId: staff.id,
    success: true,
  });

  const role = staff.role as StaffRole;
  const refreshJti = await createRefreshSession({
    sub: staff.id,
    type: 'staff',
    role,
  });
  const accessToken = await signAccessToken({
    sub: staff.id,
    type: 'staff',
    role,
  });

  return {
    accessToken,
    expiresIn: ACCESS_TOKEN_TTL_SEC,
    staff: mapStaff(staff),
    refreshJti,
  };
}
