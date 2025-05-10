import twilio from 'twilio';

export class SmsVerificationService {
  private twilioClient: twilio.Twilio;
  private verifyServiceSid: string;

  constructor() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials are required');
    }
    if (!process.env.TWILIO_VERIFY_SERVICE_SID) {
      throw new Error('Twilio Verify Service SID is required');
    }

    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  }

  async sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; message: string; sid?: string }> {
    try {
      const verification = await this.twilioClient.verify.v2
        .services(this.verifyServiceSid)
        .verifications
        .create({ to: phoneNumber, channel: 'sms' });

      return {
        success: true,
        message: 'Verification code sent successfully',
        sid: verification.sid
      };
    } catch (error) {
      console.error('Error sending verification code:', error);
      return {
        success: false,
        message: 'Failed to send verification code'
      };
    }
  }

  async verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      const verificationCheck = await this.twilioClient.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks
        .create({ to: phoneNumber, code });

      if (verificationCheck.status === 'approved') {
        return {
          success: true,
          message: 'Phone number verified successfully'
        };
      } else {
        return {
          success: false,
          message: 'Invalid verification code'
        };
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      return {
        success: false,
        message: 'Failed to verify code'
      };
    }
  }
} 