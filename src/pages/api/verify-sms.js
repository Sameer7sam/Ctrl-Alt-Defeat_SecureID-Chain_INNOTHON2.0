
import { SmsVerificationService } from '../../lib/api/smsVerification';

const smsService = new SmsVerificationService();

// Client-side API function to replace Next.js API route
export async function verifySms(phoneNumber, code) {
  if (!phoneNumber || !code) {
    return { success: false, message: 'Phone number and code are required' };
  }

  try {
    const result = await smsService.verifyCode(phoneNumber, code);
    return result;
  } catch (error) {
    console.error('Error in SMS verification:', error);
    return { success: false, message: 'Internal server error' };
  }
}
