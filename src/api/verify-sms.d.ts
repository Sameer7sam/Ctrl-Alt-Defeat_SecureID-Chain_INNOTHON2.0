
export interface SmsVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    phoneNumber: string;
    verifiedAt: number;
  };
}

export function verifySms(phoneNumber: string, code: string): Promise<SmsVerificationResponse>;
