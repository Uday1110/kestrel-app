import { cookies } from "next/headers";
import { UserRole, UserSession } from "@/types/domain";

export const DEMO_USERS: Record<string, UserSession> = {
  rm: {
    id: "usr_rm_naveen",
    email: "rm.sharma@corporate.kestrel.internal",
    name: "Naveen Sharma",
    role: "RM",
    title: "Relationship Manager (RM)",
    department: "West Zone Commercial Lending",
    avatarUrl: null,
  },
  analyst: {
    id: "usr_ca_arunachalam",
    email: "analyst.williams@corporate.kestrel.internal",
    name: "Arunachalam V.",
    role: "ANALYST",
    title: "Lead Underwriting Analyst",
    department: "Credit Risk & Underwriting",
    avatarUrl: null,
  },
};

const SESSION_COOKIE_NAME = "kestrel_session";

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    // Default to RM if not logged in, but let's check
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(sessionCookie.value)) as UserSession;
    if (parsed && parsed.id && parsed.role) {
      return parsed;
    }
  } catch (err) {
    console.error("Failed to parse session cookie", err);
  }

  return null;
}

export async function getSessionUserOrDefault(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (user) return user;
  // Fallback demo user (RM) for frictionless local dev exploration
  return DEMO_USERS.rm;
}

export async function setSessionUser(user: UserSession): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, encodeURIComponent(JSON.stringify(user)), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED: Sign in required");
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<UserSession> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`FORBIDDEN: Operation requires one of roles [${allowedRoles.join(", ")}], but current user has role ${user.role}`);
  }
  return user;
}
