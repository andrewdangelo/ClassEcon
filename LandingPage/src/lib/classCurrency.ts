/**
 * Prefix for fictional “class economy” amounts in marketing UI.
 * “CE$” reads as ClassEcon class credits—not US dollars.
 */
export const CLASS_CURRENCY = 'CE$';

/** Renders e.g. “CE$ 128.40” (space between code and number). */
export function formatClassCredits(amount: string): string {
  return `${CLASS_CURRENCY} ${amount}`;
}
