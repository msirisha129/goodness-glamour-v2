import crypto from 'crypto';

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Get OTP expiry time (10 minutes from now)
 */
export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10); // 10 minutes
  return expiry;
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(otpExpiry: Date | null): boolean {
  if (!otpExpiry) return true;
  return new Date() > otpExpiry;
}

/**
 * Validate OTP format (6 digits)
 */
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Check if too many OTP attempts (prevent brute force)
 */
export function isTooManyAttempts(attempts: number): boolean {
  return attempts >= 5; // Max 5 attempts
}

