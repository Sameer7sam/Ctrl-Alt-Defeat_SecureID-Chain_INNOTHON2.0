
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { blockchainSystem } from '@/lib/blockchain';
import SmsVerification from './SmsVerification';

interface OtpVerificationProps {
  onVerificationComplete?: () => void;
}

const OtpVerification = ({ onVerificationComplete }: OtpVerificationProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [userData, setUserData] = useState<{
    phoneNumber: string;
  } | null>(null);

  const handleVerificationComplete = async (phoneNumber: string) => {
    setUserData({ phoneNumber });
    setIsVerified(true);
    toast.success('Phone number verified successfully!');
    
    // Get current verification or create a new one if it doesn't exist
    let verification = blockchainSystem.getVerification();
    
    if (!verification) {
      // If there is no existing verification, create a minimal one with verified status
      await blockchainSystem.verifyAadhaar('000000000000', 'Demo User', '1990-01-01', 'Other');
      verification = blockchainSystem.getVerification();
    }
    
    // Update verification in blockchain system with the phone number
    if (verification) {
      verification.phoneNumber = phoneNumber;
      verification.verified = true;
      verification.verifiedAt = Date.now();
    }
    
    console.log("Updated verification:", verification);
    
    if (onVerificationComplete) {
      onVerificationComplete();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phone Verification</CardTitle>
        <CardDescription>
          Verify your phone number using SMS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isVerified ? (
          <SmsVerification onVerificationComplete={handleVerificationComplete} />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-green-500">
              <Check className="h-5 w-5" />
              <span>Phone number verified successfully!</span>
            </div>
            {userData && (
              <div className="text-sm text-muted-foreground">
                <p>Phone: {userData.phoneNumber}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OtpVerification;
