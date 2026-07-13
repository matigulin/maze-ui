import { apiGet, apiPatchJson } from "@/lib/api";
import type { UserProfile } from "../model/types";

export async function fetchUserProfile(accessToken: string) {
  return apiGet<UserProfile>("/me", undefined, { accessToken });
}

export async function updateUserProfile(
  accessToken: string,
  body: {
    firstName?: string;
    lastName?: string;
    email?: string;
    subscribeEmail?: boolean;
    subscribeSms?: boolean;
  },
) {
  return apiPatchJson<UserProfile>("/me", body, { accessToken });
}
