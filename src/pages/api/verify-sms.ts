
import { SmsVerificationService } from '@/lib/api/smsVerification';

const smsService = new SmsVerificationService();

// This is now a simple function that can be called from the frontend
export async function verifySms(phoneNumber: string, code: string) {
  try {
    if (!phoneNumber || !code) {
      return { success: false, message: 'Phone number and code are required' };
    }

    const result = await smsService.verifyCode(phoneNumber, code);
    return result;
  } catch (error) {
    console.error('Error in SMS verification:', error);
    return { success: false, message: 'Internal server error' };
  }
}
