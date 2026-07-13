import type { AuthUser, UserProfile } from "./model/types";

export type {
  AuthUser,
  UserProfile,
  SmsSendResponse,
  SmsVerifyResponse,
  AuthRefreshResponse,
} from "./model/types";

export {
  sendSmsCode,
  verifySmsCode,
  refreshUserSession,
  logoutUser,
} from "./api/auth-api";

export { fetchUserProfile, updateUserProfile } from "./api/profile-api";

export function userDisplayName(user: AuthUser | UserProfile | null): string {
  if (!user) return "";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  if (name) return name;
  return user.phone;
}
