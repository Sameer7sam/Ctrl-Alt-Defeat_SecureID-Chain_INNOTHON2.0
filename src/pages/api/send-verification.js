
import { SmsVerificationService } from '../../lib/api/smsVerification';

const smsService = new SmsVerificationService();

// Client-side API function to replace Next.js API route
export async function sendVerification(phoneNumber) {
  if (!phoneNumber) {
    return { success: false, message: 'Phone number is required' };
  }

  try {
    const result = await smsService.sendVerificationCode(phoneNumber);
    return result;
  } catch (error) {
    console.error('Error in sending verification:', error);
    return { success: false, message: 'Internal server error' };
  }
}
