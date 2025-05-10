
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { blockchainSystem } from '@/lib/blockchain';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import PhoneVerificationField from './PhoneVerificationField';

const AadhaarVerification = () => {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);

  const verifyAadhaar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aadhaarNumber.trim() || !fullName.trim() || !dateOfBirth.trim() || !address.trim()) {
      toast.error('All fields are required');
      return;
    }
    
    setIsLoading(true);
    console.log("Starting Aadhaar verification process");
    
    try {
      // Check if user is registered first
      const currentUser = blockchainSystem.getCurrentUser();
      if (!currentUser) {
        // Register identity automatically if not registered
        await blockchainSystem.registerIdentity("auto-id", "auto-selfie");
        toast.success('Identity registered automatically');
      }
      
      const response = await blockchainSystem.verifyAadhaar(
        aadhaarNumber,
        fullName,
        dateOfBirth,
        address
      );
      
      if (response.success) {
        console.log("Aadhaar initial verification successful");
        setVerificationData(response.data);
        setIsVerifying(true);
        
        // Simulate OTP sent (in a real app you'd send an actual OTP)
        toast.success('OTP sent to your registered mobile number');
      } else {
        console.error("Aadhaar verification failed:", response.message);
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error verifying Aadhaar:', error);
      toast.error('Failed to verify Aadhaar');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    // Simulate OTP verification (this would be done with an actual API call)
    console.log("OTP verification successful");
    setIsVerifying(false);
    setIsVerified(true);
    toast.success('Aadhaar verification complete');
  };
  
  const handlePhoneVerificationSuccess = (data: any) => {
    console.log("Phone verification success:", data);
    setIsPhoneVerified(true);
    toast.success('Phone verification complete!');
  };

  // Compute overall verification status
  const isFullyVerified = isVerified && isPhoneVerified;

  return (
    <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg overflow-hidden">
      <CardHeader>
        <CardTitle>Aadhaar & Phone Verification</CardTitle>
        <CardDescription>
          Complete your identity verification using your Aadhaar details and phone number
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isFullyVerified ? (
          isVerifying ? (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-primary/10 p-4 rounded-md">
                <p className="text-sm">
                  Enter the 6-digit OTP sent to your registered mobile number
                </p>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                
                <Button 
                  onClick={verifyOTP} 
                  disabled={otp.length !== 6}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full mt-4"
                >
                  Verify OTP
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              {isVerified ? (
                <div className="space-y-6">
                  <motion.div 
                    className="flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="h-8 w-8 text-green-500" />
                    </div>
                  </motion.div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Aadhaar Verified</h3>
                    <p className="text-muted-foreground">Your Aadhaar has been successfully verified</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aadhaar:</span>
                      <span className="font-medium">XXXX-XXXX-{aadhaarNumber.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verified On:</span>
                      <span className="font-medium">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Phone Verification Section - Integrated with Aadhaar */}
                  {!isPhoneVerified ? (
                    <PhoneVerificationField 
                      onVerificationSuccess={handlePhoneVerificationSuccess} 
                      disabled={isPhoneVerified}
                    />
                  ) : (
                    <div className="bg-green-500/10 p-4 rounded-md flex items-center justify-between mt-4">
                      <span>Phone number verification</span>
                      <span className="flex items-center text-green-500">
                        <Check className="h-4 w-4 mr-1" />
                        Complete
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={verifyAadhaar} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aadhaar">Aadhaar Number</Label>
                    <Input
                      id="aadhaar"
                      placeholder="XXXX-XXXX-XXXX"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      className="bg-background/50 border-primary/30 focus-visible:ring-primary"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Enter your 12-digit Aadhaar number</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="As per Aadhaar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-background/50 border-primary/30 focus-visible:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="bg-background/50 border-primary/30 focus-visible:ring-primary"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="As per Aadhaar"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-background/50 border-primary/30 focus-visible:ring-primary"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Send OTP'}
                  </Button>
                </form>
              )}
            </>
          )
        ) : (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Verification Complete</h3>
              <p className="text-muted-foreground">Your identity has been fully verified</p>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="bg-green-500/10 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Aadhaar Verification</span>
                  <span className="flex items-center text-green-500">
                    <Check className="h-4 w-4 mr-1" />
                    Complete
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {fullName} • XXXX-XXXX-{aadhaarNumber.slice(-4)}
                </div>
              </div>
              
              <div className="bg-green-500/10 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Phone Verification</span>
                  <span className="flex items-center text-green-500">
                    <Check className="h-4 w-4 mr-1" />
                    Complete
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default AadhaarVerification;
