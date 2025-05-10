import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { blockchainSystem } from '@/lib/blockchain';
import PhoneEmailSignIn from './PhoneEmailSignIn';

interface OtpVerificationProps {
  onVerificationComplete?: () => void;
}

const OtpVerification = ({ onVerificationComplete }: OtpVerificationProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [userData, setUserData] = useState<{
    countryCode: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  const handleVerificationComplete = async (data: {
    countryCode: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
  }) => {
    setUserData(data);
    setIsVerified(true);
    toast.success('Phone number verified successfully!');
    
    // Update verification in blockchain system
    const verification = blockchainSystem.getVerification();
    if (verification) {
      verification.phoneNumber = `${data.countryCode}${data.phoneNumber}`;
      verification.verified = true;
    }
    
    if (onVerificationComplete) {
      onVerificationComplete();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phone Verification</CardTitle>
        <CardDescription>
          Verify your phone number using Phone.Email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isVerified ? (
          <PhoneEmailSignIn onVerificationComplete={handleVerificationComplete} />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-green-500">
              <Check className="h-5 w-5" />
              <span>Phone number verified successfully!</span>
            </div>
            {userData && (
              <div className="text-sm text-muted-foreground">
                <p>Name: {userData.firstName} {userData.lastName}</p>
                <p>Phone: +{userData.countryCode} {userData.phoneNumber}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OtpVerification;
