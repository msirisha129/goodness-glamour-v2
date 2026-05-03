import { smsService } from "./sms-service";

/**
 * Send OTP via SMS
 */
export async function sendOTPSMS(phoneNumber: string, otp: string, userName: string = "User"): Promise<boolean> {
  try {
    const message = ` Goodness Glamour Salon\n\nHi ${userName}!\n\n Your verification code is:\n\n${otp}\n\nValid for 10 minutes.\n\n Contact: 9036626642`;
    
    const result = await smsService.sendSMS({
      to: phoneNumber,
      message: message
    });
    
    if (result.success) {
      console.log(`✅ OTP SMS sent successfully to ${phoneNumber} via ${result.provider}`);
      return true;
    } else {
      console.error(`❌ Failed to send OTP SMS to ${phoneNumber}: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error sending OTP SMS: ${error}`);
    return false;
  }
}

/**
 * Format phone number for international format (add +91 for India)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If already 12 digits starting with 91, it's already +91 format
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return '+' + cleaned;
  }
  
  // If 10 digits, add +91
  if (cleaned.length === 10) {
    return '+91' + cleaned;
  }
  
  // If already starts with +, keep as is
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Default: add +91
  return '+91' + cleaned;
}

/**
 * Validate phone number format (10 digits for India)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Accept 10 digits (India) or 12 digits (with country code)
  return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('91'));
}
