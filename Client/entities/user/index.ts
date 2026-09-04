import type { AuthUser, UserProfile } from "./model/types";

export type {
  AuthUser,
  UserProfile,
  UserGender,
  UpdateUserProfileBody,
  SmsSendResponse,
  SmsVerifyResponse,
  AuthRefreshResponse,
} from "./model/types";

/** Единая точка входа в auth — UI/features не импортируют auth-api напрямую. */
export { authService } from "./api/auth-service";
export type { SendCodeResult } from "./api/auth-service";

export { fetchUserProfile, updateUserProfile } from "./api/profile-api";

export function userDisplayName(user: AuthUser | UserProfile | null): string {
  if (!user) return "";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  if (name) return name;
  return user.phone;
}
