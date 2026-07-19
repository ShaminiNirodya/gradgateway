export const ACCOUNT_BLOCKED_MESSAGE =
  "Your account has been blocked by an administrator. Contact support if you believe this is a mistake.";

export function isAccountBlockedResponse(
  status: number,
  body?: { message?: string; code?: string } | null
): boolean {
  if (status !== 403) return false;
  if (body?.code === "ACCOUNT_BLOCKED") return true;
  const message = (body?.message ?? "").toLowerCase();
  return (
    message.includes("blocked") ||
    message.includes("suspended") ||
    message.includes("removed or suspended")
  );
}

export function isBlockedUserData(userData?: { isActive?: boolean; role?: string } | null): boolean {
  if (!userData) return false;
  if (userData.role === "Admin") return false;
  return userData.isActive === false;
}
