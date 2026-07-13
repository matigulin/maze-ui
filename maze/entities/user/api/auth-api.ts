import { apiPostJson } from "@/lib/api";
import type {
  AuthRefreshResponse,
  SmsSendResponse,
  SmsVerifyResponse,
} from "../model/types";

export async function sendSmsCode(phone: string) {
  return apiPostJson<SmsSendResponse>("/auth/sms/send", { phone });
}

export async function verifySmsCode(phone: string, code: string) {
  return apiPostJson<SmsVerifyResponse>("/auth/sms/verify", { phone, code });
}

export async function refreshUserSession() {
  return apiPostJson<AuthRefreshResponse>("/auth/refresh", {});
}

export async function logoutUser() {
  return apiPostJson<{ ok: true }>("/auth/logout", {});
}
