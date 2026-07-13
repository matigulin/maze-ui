import { apiGet, apiPatchJson } from "@/lib/api";
import type { UpdateUserProfileBody, UserProfile } from "../model/types";

export async function fetchUserProfile(accessToken: string) {
  return apiGet<UserProfile>("/me", undefined, { accessToken });
}

export async function updateUserProfile(
  accessToken: string,
  body: UpdateUserProfileBody,
) {
  return apiPatchJson<UserProfile>("/me", body, { accessToken });
}
