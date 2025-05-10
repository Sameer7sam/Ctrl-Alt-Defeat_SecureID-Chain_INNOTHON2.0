import axios from 'axios';
import https from 'https';

// Remove this line since we're not using the API in development mode
// const PHONE_EMAIL_API_KEY = 'your_api_key_here';

interface UserData {
  user_country_code: string;
  user_phone_number: string;
  user_first_name: string;
  user_last_name: string;
}

interface OtpResponse {
  success: boolean;
  message: string;
  otp?: string;
}

// Function to fetch user data from the JSON file
export const fetchUserData = (userJsonUrl: string): Promise<UserData> => {
  return new Promise((resolve, reject) => {
    https.get(userJsonUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            user_country_code: jsonData.user_country_code,
            user_phone_number: jsonData.user_phone_number,
            user_first_name: jsonData.user_first_name,
            user_last_name: jsonData.user_last_name
          });
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

export const generateOtp = async (phoneNumber: string): Promise<OtpResponse> => {
  try {
    // For development/testing, generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In production, uncomment this code to use phone.email API
    /*
    const response = await axios.post('https://api.phone.email/send', {
      apiKey: PHONE_EMAIL_API_KEY,
      phoneNumber,
      message: `Your OTP is: ${otp}`
    });

    if (!response.data.success) {
      return {
        success: false,
        message: response.data.message || 'Failed to send OTP'
      };
    }
    */

    // Store OTP in localStorage for development (replace with secure storage in production)
    localStorage.setItem(`otp_${phoneNumber}`, otp);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      otp // Remove this in production
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: 'Failed to send OTP'
    };
  }
};

export const verifyOtp = async (phoneNumber: string, otp: string): Promise<OtpResponse> => {
  try {
    // For development/testing, verify against stored OTP
    const storedOtp = localStorage.getItem(`otp_${phoneNumber}`);
    
    if (!storedOtp || storedOtp !== otp) {
      return {
        success: false,
        message: 'Invalid OTP'
      };
    }

    // In production, uncomment this code to use phone.email API
    /*
    const response = await axios.post('https://api.phone.email/verify', {
      apiKey: PHONE_EMAIL_API_KEY,
      phoneNumber,
      otp
    });

    if (!response.data.success) {
      return {
        success: false,
        message: response.data.message || 'Invalid OTP'
      };
    }
    */

    // Clear OTP from storage after successful verification
    localStorage.removeItem(`otp_${phoneNumber}`);
    
    return {
      success: true,
      message: 'OTP verified successfully'
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'Failed to verify OTP'
    };
  }
}; 