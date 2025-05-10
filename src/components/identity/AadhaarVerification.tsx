
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { blockchainSystem } from '@/lib/blockchain';
import OtpVerification from './OtpVerification';

const AadhaarVerification = () => {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);

  // Format Aadhaar number with spaces
  const formatAadhaarNumber = (input: string) => {
    const digitsOnly = input.replace(/\D/g, '');
    let formatted = '';
    
    for (let i = 0; i < digitsOnly.length && i < 12; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += digitsOnly[i];
    }
    
    return formatted;
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadhaarNumber(e.target.value);
    setAadhaarNumber(formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 10 digits
    const value = e.target.value.replace(/\D/g, '').substring(0, 10);
    setPhoneNumber(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (aadhaarNumber.replace(/\s/g, '').length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    if (phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await blockchainSystem.verifyAadhaar(
        aadhaarNumber,
        fullName,
        dateOfBirth,
        address
      );
      
      if (response.success) {
        toast.success('Aadhaar details verified. Proceeding to phone verification.');
        setShowOtpVerification(true);
        
        // Simulate OTP being sent
        toast.info(`OTP sent to ${phoneNumber}. For demo, use 123456.`);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error verifying Aadhaar:', error);
      toast.error('Failed to verify Aadhaar details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpComplete = () => {
    setIsVerified(true);
    toast.success('Identity verification complete!');
  };

  return (
    <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle>Aadhaar Verification</CardTitle>
        <CardDescription>
          Verify your identity using your Aadhaar details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showOtpVerification ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aadhaar">Aadhaar Number</Label>
              <Input 
                id="aadhaar" 
                value={aadhaarNumber} 
                onChange={handleAadhaarChange}
                placeholder="XXXX XXXX XXXX"
                required
                maxLength={14}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Enter your 12-digit Aadhaar number
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="flex">
                <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0 border-input text-muted-foreground">
                  +91
                </div>
                <Input 
                  id="phoneNumber" 
                  value={phoneNumber} 
                  onChange={handlePhoneChange}
                  placeholder="Enter your phone number"
                  required
                  maxLength={10}
                  className="rounded-l-none bg-background/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your phone number linked with Aadhaar
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name (as per Aadhaar)</Label>
              <Input 
                id="fullName" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input 
                id="dob" 
                type="date" 
                value={dateOfBirth} 
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                required
                className="bg-background/50"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : 'Verify Aadhaar & Proceed'}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground pt-2">
              This is a simulated verification. No real data is being sent.
            </p>
          </form>
        ) : (
          <OtpVerification 
            phoneNumber={`+91 ${phoneNumber}`}
            onVerificationComplete={handleOtpComplete}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AadhaarVerification;
