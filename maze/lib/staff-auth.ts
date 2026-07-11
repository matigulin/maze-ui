import { apiPostJson } from "@/lib/api";

export type StaffRole = "manager" | "admin";

export type StaffUser = {
  id: string;
  role: StaffRole;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
};

type StaffLoginResponse = {
  accessToken: string;
  expiresIn: number;
  staff: {
    id: string;
    role: StaffRole;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
};

type StaffRefreshResponse = {
  accessToken: string;
  expiresIn: number;
  staff: {
    id: string;
    role: StaffRole;
  };
};

export async function staffLogin(email: string, password: string) {
  return apiPostJson<StaffLoginResponse>("/auth/staff/login", {
    email,
    password,
  });
}

export async function staffRefresh() {
  return apiPostJson<StaffRefreshResponse>("/auth/staff/refresh", {});
}

export async function staffLogout() {
  return apiPostJson<{ ok: true }>("/auth/staff/logout", {});
}

export function staffDisplayName(staff: StaffUser | null): string {
  if (!staff) return "";
  const name = [staff.firstName, staff.lastName].filter(Boolean).join(" ");
  if (name) return name;
  if (staff.email) return staff.email;
  return staff.role === "admin" ? "Администратор" : "Менеджер";
}
