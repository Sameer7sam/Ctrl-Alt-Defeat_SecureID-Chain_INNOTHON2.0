
export interface VerificationResponse {
  success: boolean;
  message: string;
  data?: {
    phoneNumber: string;
    sentAt: number;
  };
}

export function sendVerification(phoneNumber: string): Promise<VerificationResponse>;
