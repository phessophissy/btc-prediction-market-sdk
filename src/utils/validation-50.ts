/**
 * Input validation utilities — batch 50
 * Ensures contract call parameters are within acceptable ranges.
 */

export const MIN_TITLE_LENGTH = 3;
export const MAX_TITLE_LENGTH = 256;
export const MIN_DESCRIPTION_LENGTH = 5;
export const MAX_DESCRIPTION_LENGTH = 1024;
export const MIN_SETTLEMENT_OFFSET = 6;

export type ValidationResult = { valid: true } | { valid: false; error: string };

export function validateTitle(title: string): ValidationResult {
  if (!title || title.trim().length < MIN_TITLE_LENGTH) {
    return { valid: false, error: `Title must be at least ${MIN_TITLE_LENGTH} characters` };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { valid: false, error: `Title must not exceed ${MAX_TITLE_LENGTH} characters` };
  }
  return { valid: true };
}

export function validateDescription(desc: string): ValidationResult {
  if (!desc || desc.trim().length < MIN_DESCRIPTION_LENGTH) {
    return { valid: false, error: `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters` };
  }
  if (desc.length > MAX_DESCRIPTION_LENGTH) {
    return { valid: false, error: `Description exceeds ${MAX_DESCRIPTION_LENGTH} characters` };
  }
  return { valid: true };
}

export function validateSettlementHeight(
  currentHeight: number,
  targetHeight: number
): ValidationResult {
  const offset = targetHeight - currentHeight;
  if (offset < MIN_SETTLEMENT_OFFSET) {
    return { valid: false, error: `Settlement must be at least ${MIN_SETTLEMENT_OFFSET} blocks in the future (got ${offset})` };
  }
  return { valid: true };
}

export function validateMarketId(marketId: number): ValidationResult {
  if (!Number.isInteger(marketId) || marketId < 0) {
    return { valid: false, error: 'Market ID must be a non-negative integer' };
  }

  return { valid: true };
}

export function validateStandardPrincipal(address: string): ValidationResult {
  const trimmed = address.trim();

  if (!trimmed) {
    return { valid: false, error: 'Stacks address is required' };
  }

  if (trimmed.includes('.')) {
    return { valid: false, error: 'Expected a standard Stacks address without a contract suffix' };
  }

  if (!/^S[PTMN][A-Z0-9]{8,}$/u.test(trimmed)) {
    return { valid: false, error: 'Stacks address must be a valid standard principal string' };
  }

  return { valid: true };
}

export function validateMicroStxAmount(amount: number): ValidationResult {
  if (!Number.isInteger(amount) || amount <= 0) {
    return { valid: false, error: 'Amount must be a positive integer number of microSTX' };
  }

  return { valid: true };
}

export function validateBetAmount(amount: number, minBet = 10000): ValidationResult {
  if (!Number.isFinite(amount) || amount < minBet) {
    return { valid: false, error: `Bet amount must be at least ${minBet} microSTX` };
  }
  return { valid: true };
}
