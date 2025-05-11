
import { blockchainSystem } from '../lib/blockchain';

export async function verifySms(phoneNumber, code) {
  try {
    if (!phoneNumber || !code) {
      return { 
        success: false, 
        message: 'Phone number and verification code are required' 
      };
    }
    
    // For demo purposes, we'll accept any 6-digit code
    // In a real application, this would validate against a stored OTP
    if (code.length === 6 && /^\d+$/.test(code)) {
      // Update verification in blockchain system
      const user = blockchainSystem.getCurrentUser();
      if (user) {
        let verification = blockchainSystem.getVerification();
        if (verification) {
          verification.phoneNumber = phoneNumber;
          verification.verified = true;
          verification.verifiedAt = Date.now();
        } else {
          // If no verification exists yet, create a minimal one
          await blockchainSystem.verifyAadhaar('000000000000', 'Demo User', '1990-01-01', 'Other');
          verification = blockchainSystem.getVerification();
          if (verification) {
            verification.phoneNumber = phoneNumber;
          }
        }
      }
      
      return { 
        success: true, 
        message: 'Phone number verified successfully',
        data: {
          phoneNumber,
          verifiedAt: Date.now()
        }
      };
    }
    
    return {
      success: false,
      message: 'Invalid verification code'
    };
  } catch (error) {
    console.error('Error in verifying SMS:', error);
    return { 
      success: false, 
      message: 'Failed to verify code' 
    };
  }
}
