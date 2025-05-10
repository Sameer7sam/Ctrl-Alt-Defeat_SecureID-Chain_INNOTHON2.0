import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { blockchainSystem } from '@/lib/blockchain';
import { backendService } from '@/lib/backend';
import { motion } from 'framer-motion';
import { Check, ThumbsUp, Shield } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const AadhaarVerification = () => {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'verifying' | 'verified'>('idle');

  // Check for existing verification on mount
  useEffect(() => {
    const checkExistingVerification = async () => {
      const currentUser = blockchainSystem.getCurrentUser();
      if (currentUser) {
        const isVerified = await backendService.getAadhaarVerificationStatus(currentUser.publicKey);
        if (isVerified) {
          setIsVerified(true);
          setVerificationStep('verified');
        }
      }
    };
    checkExistingVerification();
  }, []);

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

    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Please enter both first and last name');
      return;
    }
    
    setIsSubmitting(true);
    setVerificationStep('verifying');
    
    try {
      const currentUser = blockchainSystem.getCurrentUser();
      if (!currentUser) {
        const registerResponse = await blockchainSystem.registerIdentity("auto-id", "auto-selfie");
        if (!registerResponse.success) {
          toast.error('Failed to register identity');
          setVerificationStep('idle');
          return;
        }
        toast.success('Identity registered automatically');
      }

      const response = await blockchainSystem.verifyAadhaar(
        aadhaarNumber,
        `${firstName} ${lastName}`,
        dateOfBirth,
        gender
      );
      
      if (response.success) {
        // Save verification to backend
        const saved = await backendService.saveAadhaarVerification(
          currentUser!.publicKey,
          aadhaarNumber,
          `${firstName} ${lastName}`,
          dateOfBirth,
          phoneNumber,
          gender
        );

        if (saved) {
          setVerificationStep('verified');
          setIsVerified(true);
          toast.success('Aadhaar verification successful');
        } else {
          throw new Error('Failed to save verification data');
        }
      } else {
        setVerificationStep('idle');
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error verifying Aadhaar:', error);
      setVerificationStep('idle');
      toast.error('Failed to verify Aadhaar details');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerified) {
    return (
      <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle>Aadhaar Verification</CardTitle>
          <CardDescription>
            Your Aadhaar details have been verified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="flex flex-col items-center justify-center py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <Shield className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Verification Complete!</h3>
            <p className="text-muted-foreground text-center">
              Your Aadhaar details have been successfully verified and stored securely.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle>Aadhaar Verification</CardTitle>
        <CardDescription>
          Verify your identity using your Aadhaar details
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Enter your 12-digit Aadhaar number
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                required
                className="bg-background/50"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                required
                className="bg-background/50"
                disabled={isSubmitting}
              />
            </div>
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
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup 
              value={gender} 
              onValueChange={(value) => setGender(value as 'male' | 'female')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
            </RadioGroup>
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
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your phone number linked with Aadhaar
            </p>
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Verify Aadhaar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AadhaarVerification;
