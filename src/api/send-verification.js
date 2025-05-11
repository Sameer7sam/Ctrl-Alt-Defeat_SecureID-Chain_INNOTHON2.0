
import { blockchainSystem } from '../lib/blockchain';

export async function sendVerification(phoneNumber) {
  try {
    if (!phoneNumber) {
      return { 
        success: false, 
        message: 'Phone number is required' 
      };
    }
    
    // For demo purposes, we'll simulate sending an OTP
    // In a real application, this would call a service to send an SMS
    console.log(`Simulating sending OTP to ${phoneNumber}`);
    
    return { 
      success: true, 
      message: 'Verification code sent successfully',
      data: {
        phoneNumber,
        sentAt: Date.now()
      }
    };
  } catch (error) {
    console.error('Error in sending verification:', error);
    return { 
      success: false, 
      message: 'Failed to send verification code' 
    };
  }
}
