/**
 * API client for ExpenseFlow backend.
 * Uses relative /api when served by Vite proxy in development.
 */
const API_BASE = "/api";

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    managerId?: string;
    department: string;
  };
}

export async function apiLogin(email: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail =
      typeof err.detail === "string"
        ? err.detail
        : Array.isArray(err.detail)
          ? err.detail[0]?.msg || "Login failed"
          : err.detail?.msg || "Login failed";
    throw new Error(detail);
  }
  return res.json();
}

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
  department: string;
}

export async function apiSignup(payload: SignupPayload): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail =
      typeof err.detail === "string"
        ? err.detail
        : Array.isArray(err.detail)
          ? err.detail[0]?.msg || "Signup failed"
          : err.detail?.msg || "Signup failed";
    throw new Error(detail);
  }
  return res.json();
}

export function getStoredToken(): string | null {
  return localStorage.getItem("expenseflow_token");
}

export function getStoredUser(): { id: string; email: string; name: string; role: string; managerId?: string; department: string } | null {
  const raw = localStorage.getItem("expenseflow_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeAuth(token: string, user: TokenResponse["user"]): void {
  localStorage.setItem("expenseflow_token", token);
  localStorage.setItem("expenseflow_user", JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem("expenseflow_token");
  localStorage.removeItem("expenseflow_user");
}
