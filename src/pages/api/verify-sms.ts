import { NextApiRequest, NextApiResponse } from 'next';
import { SmsVerificationService } from '@/lib/api/smsVerification';

const smsService = new SmsVerificationService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
      return res.status(400).json({ message: 'Phone number and code are required' });
    }

    const result = await smsService.verifyCode(phoneNumber, code);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error in SMS verification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 