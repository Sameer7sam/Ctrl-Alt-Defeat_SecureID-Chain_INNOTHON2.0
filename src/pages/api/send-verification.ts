
import { SmsVerificationService } from '@/lib/api/smsVerification';

const smsService = new SmsVerificationService();

// This is now a simple function that can be called from the frontend
export async function sendVerification(phoneNumber: string) {
  try {
    if (!phoneNumber) {
      return { success: false, message: 'Phone number is required' };
    }

    const result = await smsService.sendVerificationCode(phoneNumber);
    return result;
  } catch (error) {
    console.error('Error in sending verification:', error);
    return { success: false, message: 'Internal server error' };
  }
}
