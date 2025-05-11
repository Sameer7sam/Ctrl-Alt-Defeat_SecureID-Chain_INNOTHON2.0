
// Simple service for SMS verification (previously implemented in Next.js API route)
export class SmsVerificationService {
  async sendVerificationCode(phoneNumber) {
    try {
      // For demo purposes, we'll just return a success response
      // In a real implementation, this would connect to Twilio or another SMS provider
      return {
        success: true,
        message: `Verification code sent to ${phoneNumber}`,
        data: {
          phoneNumber,
          expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes from now
        }
      };
    } catch (error) {
      console.error('Error sending verification code:', error);
      return {
        success: false,
        message: 'Failed to send verification code'
      };
    }
  }

  async verifyCode(phoneNumber, code) {
    try {
      // For demo purposes, we'll accept any code as valid
      // In a real implementation, this would verify against a stored code
      const isValid = code === '123456'; // Demo code is always 123456
      
      return {
        success: isValid,
        message: isValid ? 'Phone number verified successfully' : 'Invalid verification code',
        data: isValid ? { phoneNumber, verified: true } : undefined
      };
    } catch (error) {
      console.error('Error verifying code:', error);
      return {
        success: false,
        message: 'Failed to verify code'
      };
    }
  }
}
