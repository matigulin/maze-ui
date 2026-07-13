/** Покупатель после SMS-авторизации (ответ /auth/sms/verify). */
export type AuthUser = {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
};

/** Полный профиль из GET /me. */
export type UserProfile = {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  email: string | null;
  gender: string | null;
  birthDate: string | null;
  subscribeEmail: boolean;
  subscribeSms: boolean;
};

export type SmsSendResponse = {
  message: string;
  /** Только в development без SMS-провайдера */
  devCode?: string;
};

export type SmsVerifyResponse = {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
};

export type AuthRefreshResponse = {
  accessToken: string;
  expiresIn: number;
};
