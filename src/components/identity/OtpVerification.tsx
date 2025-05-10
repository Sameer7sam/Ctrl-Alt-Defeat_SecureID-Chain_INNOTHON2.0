
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';
import { blockchainSystem } from '@/lib/blockchain';

interface OtpVerificationProps {
  phoneNumber: string;
  onVerificationComplete?: () => void;
}

const OtpVerification = ({ phoneNumber, onVerificationComplete }: OtpVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Handle OTP change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, '');
    setOtp(value);
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }

    setIsVerifying(true);

    try {
      // This is where you'd call your backend API
      // For now, we'll simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, let's consider 123456 as the valid OTP
      if (otp === '123456') {
        setIsVerified(true);
        toast.success('Phone number verified successfully!');
        
        // Update verification in blockchain system
        const verification = blockchainSystem.getVerification();
        if (verification) {
          verification.phoneNumber = phoneNumber;
          verification.verified = true;
        }
        
        if (onVerificationComplete) {
          onVerificationComplete();
        }
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    setResendDisabled(true);
    
    try {
      toast.info(`OTP sent to ${phoneNumber}. For demo, use 123456.`);
      
      // Start countdown for 30 seconds
      setResendCountdown(30);
      const countdownInterval = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP');
      setResendDisabled(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phone Verification</CardTitle>
        <CardDescription>
          Verify your phone number with a one-time password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isVerified ? (
          <>
            <div className="space-y-2">
              <p className="text-sm">
                An OTP has been sent to <span className="font-medium">{phoneNumber}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                For demo purposes, use the code: 123456
              </p>
              <div className="flex items-center space-x-2">
                <Input 
                  placeholder="Enter OTP" 
                  value={otp} 
                  onChange={handleOtpChange}
                  maxLength={6}
                  className="text-center text-lg letter-spacing-wide"
                />
                <Button 
                  onClick={handleVerifyOtp}
                  disabled={otp.length < 4 || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </div>
            <div className="text-center pt-2">
              <Button 
                variant="link" 
                onClick={handleResendOtp}
                disabled={resendDisabled}
                className="text-sm"
              >
                {resendCountdown > 0 
                  ? `Resend OTP in ${resendCountdown}s` 
                  : 'Resend OTP'}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-2 text-green-500">
            <Check className="h-5 w-5" />
            <span>Phone number verified successfully!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OtpVerification;
