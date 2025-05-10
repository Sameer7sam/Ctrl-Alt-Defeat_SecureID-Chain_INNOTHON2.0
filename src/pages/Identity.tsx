
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { blockchainSystem } from '@/lib/blockchain';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Camera, Check, RefreshCw, X } from 'lucide-react';
import PhoneVerification from '@/components/PhoneVerification';
import { Separator } from '@/components/ui/separator';

const Identity = () => {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  
  // For photo verification
  const [photo, setPhoto] = useState<string | null>(null);
  const [isPhotoVerifying, setIsPhotoVerifying] = useState(false);
  const [isPhotoVerified, setIsPhotoVerified] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check your permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreamActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const photoData = canvas.toDataURL('image/jpeg');
        setPhoto(photoData);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    setIsPhotoVerified(false);
    startCamera();
  };

  const verifyPhoto = async () => {
    if (!photo) {
      toast.error('Please capture a photo first');
      return;
    }
    
    setIsPhotoVerifying(true);
    
    try {
      const response = await blockchainSystem.savePhotoVerification(photo);
      
      if (response.success) {
        toast.success('Photo verification successful');
        setIsPhotoVerified(true);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error verifying photo:', error);
      toast.error('Failed to verify photo');
    } finally {
      setIsPhotoVerifying(false);
    }
  };

  const verifyAadhaar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aadhaarNumber.trim() || !fullName.trim() || !dateOfBirth.trim() || !address.trim()) {
      toast.error('All fields are required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await blockchainSystem.verifyAadhaar(
        aadhaarNumber,
        fullName,
        dateOfBirth,
        address
      );
      
      if (response.success) {
        setVerificationData(response.data);
        setIsVerifying(true);
        
        // Simulate OTP sent (in a real app you'd send an actual OTP)
        toast.success('OTP sent to your registered mobile number');
      } else {
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
    setIsVerifying(false);
    setIsVerified(true);
    toast.success('Aadhaar verification complete');
  };

  const handlePhoneVerificationSuccess = (data: any) => {
    setIsPhoneVerified(true);
    toast.success('Phone number verified successfully!');
    
    // In a real app, you'd make an API call to verify the user's phone number
    // using the user_json_url from data
    console.log('Phone verification data:', data);
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-8 max-w-4xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-gradient animate-glow">Identity Verification</h1>
          <p className="text-muted-foreground">Complete your identity verification to unlock full platform features</p>
        </div>

        <Tabs defaultValue="photo" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="photo">Photo Verification</TabsTrigger>
            <TabsTrigger value="aadhaar">Aadhaar Verification</TabsTrigger>
            <TabsTrigger value="phone">Phone Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="photo" className="space-y-6">
            <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg neo-glow overflow-hidden">
              <CardHeader>
                <CardTitle>Photo Verification</CardTitle>
                <CardDescription>
                  Take a selfie to verify your identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  {!photo ? (
                    <>
                      <div className="w-full max-w-md h-64 bg-black/30 rounded-lg overflow-hidden relative">
                        {isStreamActive ? (
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Button 
                              onClick={startCamera}
                              className="bg-gradient-to-r from-purple-600 to-pink-600"
                            >
                              <Camera className="mr-2 h-4 w-4" />
                              Start Camera
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {isStreamActive && (
                        <Button 
                          onClick={capturePhoto} 
                          className="bg-gradient-to-r from-green-600 to-emerald-600"
                        >
                          Capture Photo
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-full max-w-md h-64 bg-black/30 rounded-lg overflow-hidden relative">
                        <img 
                          src={photo} 
                          alt="Captured photo" 
                          className="w-full h-full object-cover"
                        />
                        
                        {isPhotoVerified && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-green-500/80 text-white px-2 py-1 rounded-md text-sm flex items-center">
                              <Check className="h-4 w-4 mr-1" />
                              Verified
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-4">
                        {!isPhotoVerified && (
                          <>
                            <Button 
                              onClick={retakePhoto}
                              variant="outline"
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Retake
                            </Button>
                            
                            <Button 
                              onClick={verifyPhoto}
                              disabled={isPhotoVerifying}
                              className="bg-gradient-to-r from-purple-600 to-pink-600"
                            >
                              {isPhotoVerifying ? 'Verifying...' : 'Verify Photo'}
                            </Button>
                          </>
                        )}
                        
                        {isPhotoVerified && (
                          <Button 
                            disabled
                            variant="outline"
                            className="text-green-500 border-green-500"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Verification Complete
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                  
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                
                <div className="bg-primary/5 p-4 rounded-md">
                  <h4 className="font-medium text-sm mb-2">Why we need your photo</h4>
                  <p className="text-sm text-muted-foreground">
                    Your photo helps us verify your identity and secure your account. 
                    This prevents unauthorized access and protects your digital assets.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="aadhaar" className="space-y-6">
            <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg neo-glow overflow-hidden">
              <CardHeader>
                <CardTitle>Aadhaar Verification</CardTitle>
                <CardDescription>
                  Verify your identity using your 12-digit Aadhaar number
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isVerified ? (
                  isVerifying ? (
                    <div className="space-y-6">
                      <div className="bg-primary/5 p-4 rounded-md">
                        <p className="text-sm text-muted-foreground">
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
                          className="bg-gradient-to-r from-purple-600 to-pink-600 w-full mt-4"
                        >
                          Verify OTP
                        </Button>
                      </div>
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
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Registered Mobile</Label>
                          <Input
                            id="phone"
                            placeholder="10-digit number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
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
                  )
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="h-8 w-8 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold">Verification Complete</h3>
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="phone" className="space-y-6">
            {!isPhoneVerified ? (
              <PhoneVerification onVerificationSuccess={handlePhoneVerificationSuccess} />
            ) : (
              <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg neo-glow overflow-hidden">
                <CardContent className="pt-6 pb-6">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="h-8 w-8 text-green-500" />
                    </div>
                    
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold">Phone Verified</h3>
                      <p className="text-muted-foreground">Your phone number has been successfully verified</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default Identity;
