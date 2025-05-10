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
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const result = await smsService.sendVerificationCode(phoneNumber);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error in sending verification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 