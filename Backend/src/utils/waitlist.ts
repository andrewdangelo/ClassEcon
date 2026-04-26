type WaitlistRankable = {
  email: string;
  signupOrder: number;
  boostPoints: number;
  createdAt?: Date;
};

export const WAITLIST_POSITION_OFFSET = 100;

export function calculateTieredBoostPoints(successfulReferrals: number): number {
  if (successfulReferrals <= 0) return 0;
  if (successfulReferrals <= 2) return successfulReferrals;
  if (successfulReferrals <= 4) return 2 + (successfulReferrals - 2) * 2;
  if (successfulReferrals === 5) return 11;
  return 11 + (successfulReferrals - 5);
}

export function sanitizeReferralCode(value: unknown): string | null {
  const code = String(value || "")
    .trim()
    .toUpperCase();
  if (!code) return null;
  if (!/^[A-Z0-9]{6,12}$/.test(code)) return null;
  return code;
}

export function canAwardReferral(params: {
  isExistingSignup: boolean;
  inviterEmail?: string | null;
  signupEmail: string;
}): boolean {
  if (params.isExistingSignup) return false;
  if (!params.inviterEmail) return false;
  return params.inviterEmail.toLowerCase() !== params.signupEmail.toLowerCase();
}

export function toEffectiveScore(entry: Pick<WaitlistRankable, "signupOrder" | "boostPoints">): number {
  return entry.signupOrder - Math.max(0, entry.boostPoints || 0);
}

export function sortWaitlistEntries(entries: WaitlistRankable[]): WaitlistRankable[] {
  return [...entries].sort((a, b) => {
    const scoreDelta = toEffectiveScore(a) - toEffectiveScore(b);
    if (scoreDelta !== 0) return scoreDelta;

    const signupDelta = a.signupOrder - b.signupOrder;
    if (signupDelta !== 0) return signupDelta;

    if (a.createdAt && b.createdAt) {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }

    return a.email.localeCompare(b.email);
  });
}

export function getDisplayPosition(params: {
  entries: WaitlistRankable[];
  email: string;
  positionOffset?: number;
}): number | null {
  const ordered = sortWaitlistEntries(params.entries);
  const index = ordered.findIndex(
    (entry) => entry.email.toLowerCase() === params.email.toLowerCase()
  );
  if (index < 0) return null;
  const offset = params.positionOffset ?? WAITLIST_POSITION_OFFSET;
  return index + 1 + offset;
}

export function generateReferralCode(length = 8): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    result += alphabet[randomIndex];
  }
  return result;
}
