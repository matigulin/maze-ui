/**
 * Единый слой авторизации MAZE ID.
 * UI / провайдер ходят только сюда — замена mock↔SMS без смены модалок.
 */
import {
  logoutUser,
  refreshUserSession,
  sendSmsCode,
  verifySmsCode,
} from "./auth-api";
import { fetchUserProfile } from "./profile-api";
import type {
  AuthRefreshResponse,
  AuthUser,
  SmsSendResponse,
  SmsVerifyResponse,
  UserProfile,
} from "../model/types";

export type SendCodeResult = {
  phone: string;
  /** Показывается в UI, пока SMS не подключена (AUTH_DEV_OTP на API). */
  devCode?: string;
};

export const authService = {
  async sendCode(phone: string): Promise<SendCodeResult> {
    const result: SmsSendResponse = await sendSmsCode(phone);
    return {
      phone,
      ...(result.devCode ? { devCode: result.devCode } : {}),
    };
  },

  async verifyCode(phone: string, code: string): Promise<SmsVerifyResponse> {
    return verifySmsCode(phone, code);
  },

  async logout(): Promise<void> {
    await logoutUser();
  },

  async refreshSession(): Promise<AuthRefreshResponse> {
    return refreshUserSession();
  },

  async getCurrentUser(accessToken: string): Promise<UserProfile> {
    return fetchUserProfile(accessToken);
  },
};

export type { AuthUser, SmsVerifyResponse, UserProfile };
