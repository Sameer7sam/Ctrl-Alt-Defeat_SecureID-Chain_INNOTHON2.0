import { redisClient } from '../../config/redis';
import { sendSMS } from '../../config/twilio';

export class OtpService {
  private static readonly OTP_EXPIRY = 300; // 5 minutes
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly OTP_LENGTH = 6;

  static async generateOtp(phoneNumber: string): Promise<string> {
    // Generate OTP
    const otp = Math.floor(
      Math.pow(10, this.OTP_LENGTH - 1) + 
      Math.random() * 9 * Math.pow(10, this.OTP_LENGTH - 1)
    ).toString();

    // Store OTP in Redis with expiry
    await redisClient.set(
      `otp:${phoneNumber}`,
      otp,
      'EX',
      this.OTP_EXPIRY
    );

    // Reset attempt counter
    await redisClient.set(
      `otp:${phoneNumber}:attempts`,
      '0',
      'EX',
      this.OTP_EXPIRY
    );

    // Send OTP via SMS
    await sendSMS(
      phoneNumber,
      `Your verification code is: ${otp}. Valid for 5 minutes.`
    );

    return otp;
  }

  static async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    // Get stored OTP
    const storedOtp = await redisClient.get(`otp:${phoneNumber}`);
    
    if (!storedOtp) {
      throw new Error('OTP expired or not found');
    }

    // Check attempts
    const attempts = parseInt(
      await redisClient.get(`otp:${phoneNumber}:attempts`) || '0'
    );

    if (attempts >= this.MAX_ATTEMPTS) {
      throw new Error('Maximum attempts exceeded');
    }

    // Increment attempts
    await redisClient.incr(`otp:${phoneNumber}:attempts`);

    if (storedOtp !== otp) {
      return false;
    }

    // Clear OTP and attempts on successful verification
    await redisClient.del(`otp:${phoneNumber}`);
    await redisClient.del(`otp:${phoneNumber}:attempts`);

    return true;
  }

  static async resendOtp(phoneNumber: string): Promise<string> {
    // Check if there's an existing OTP
    const existingOtp = await redisClient.get(`otp:${phoneNumber}`);
    
    if (existingOtp) {
      // Delete existing OTP and attempts
      await redisClient.del(`otp:${phoneNumber}`);
      await redisClient.del(`otp:${phoneNumber}:attempts`);
    }

    // Generate new OTP
    return this.generateOtp(phoneNumber);
  }
} 