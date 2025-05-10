import { EncryptionService } from './encryption';
import { ethers } from 'ethers';
import { randomBytes } from 'crypto';
import { Redis } from 'ioredis';
import twilio from 'twilio';

export class KeyManagementService {
  private static readonly STORAGE_KEY = 'secure_keys';
  
  static async generateWallet(): Promise<{
    publicKey: string;
    privateKey: string;
    encryptedPrivateKey: string;
  }> {
    const wallet = ethers.Wallet.createRandom();
    const encryptionKey = await this.generateEncryptionKey();
    
    const encryptedPrivateKey = await EncryptionService.encrypt(
      wallet.privateKey,
      encryptionKey
    );
    
    return {
      publicKey: wallet.address,
      privateKey: wallet.privateKey,
      encryptedPrivateKey
    };
  }
  
  private static async generateEncryptionKey(): Promise<string> {
    return randomBytes(32).toString('hex');
  }
  
  static async rotateKeys(): Promise<void> {
    // Implement key rotation logic
  }
}

export class OtpService {
  private redis: Redis;
  private twilioClient: twilio.Twilio;
  
  constructor() {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is required');
    }
    this.redis = new Redis(process.env.REDIS_URL as string);
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  
  async generateOtp(phoneNumber: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in Redis with 5-minute expiration
    await this.redis.set(
      `otp:${phoneNumber}`,
      otp,
      'EX',
      300
    );
    
    // Send OTP via Twilio
    await this.twilioClient.messages.create({
      body: `Your verification code is: ${otp}`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    
    return otp;
  }
  
  async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const storedOtp = await this.redis.get(`otp:${phoneNumber}`);
    
    if (!storedOtp || storedOtp !== otp) {
      return false;
    }
    
    // Delete OTP after successful verification
    await this.redis.del(`otp:${phoneNumber}`);
    
    return true;
  }
} 