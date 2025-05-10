import { OtpService } from '../lib/verification/otpService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testOtpSystem() {
  try {
    // Test phone number (replace with your number for actual SMS)
    const testPhoneNumber = '+1234567890';
    
    console.log('Generating OTP...');
    const otp = await OtpService.generateOtp(testPhoneNumber);
    console.log('OTP generated:', otp);
    
    // Wait for 2 seconds to simulate user input
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Verifying OTP...');
    const isValid = await OtpService.verifyOtp(testPhoneNumber, otp);
    console.log('OTP verification result:', isValid);
    
    // Test invalid OTP
    console.log('\nTesting invalid OTP...');
    const isInvalid = await OtpService.verifyOtp(testPhoneNumber, '000000');
    console.log('Invalid OTP verification result:', isInvalid);
    
    // Test resend
    console.log('\nTesting OTP resend...');
    const newOtp = await OtpService.resendOtp(testPhoneNumber);
    console.log('New OTP generated:', newOtp);
    
  } catch (error) {
    console.error('Error in OTP test:', error);
  }
}

// Run the test
testOtpSystem(); 