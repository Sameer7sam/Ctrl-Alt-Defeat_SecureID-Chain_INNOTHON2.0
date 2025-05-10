
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Camera, Check, Loader2, Smartphone } from "lucide-react";
import { blockchainSystem } from "@/lib/blockchain";
import { useTheme } from "@/components/ThemeProvider";
import { IdentityVerification } from "@/lib/types";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Identity = () => {
  const { theme } = useTheme();
  const [photoTab, setPhotoTab] = useState("capture");
  const [aadhaarTab, setAadhaarTab] = useState("form");
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoVerified, setPhotoVerified] = useState(false);
  const [verifyingPhoto, setVerifyingPhoto] = useState(false);
  
  const [aadhaarData, setAadhaarData] = useState({
    aadhaarNumber: "",
    phoneNumber: "",
    fullName: "",
    dateOfBirth: "",
    address: ""
  });
  const [verifyingAadhaar, setVerifyingAadhaar] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [verifiedIdentity, setVerifiedIdentity] = useState<IdentityVerification | undefined>(undefined);
  
  // OTP related states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // Check if user is already verified
    const verification = blockchainSystem.getVerification();
    if (verification) {
      setVerifiedIdentity(verification);
      setAadhaarVerified(verification.verified);
      setPhotoVerified(!!verification.photoUrl);
      
      if (verification.photoUrl) {
        setPhoto(verification.photoUrl);
        setPhotoTab("verified");
      }
      
      if (verification.verified) {
        setAadhaarTab("verified");
        setAadhaarData({
          aadhaarNumber: verification.aadhaarNumber,
          phoneNumber: verification.phoneNumber || "",
          fullName: verification.fullName,
          dateOfBirth: verification.dateOfBirth,
          address: verification.address
        });
      }
    }
  }, []);
  
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      toast.error("Could not access webcam. Please make sure your camera is connected and you've granted permission.");
    }
  };
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };
  
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoDataUrl = canvas.toDataURL("image/png");
        setPhoto(photoDataUrl);
        setPhotoTab("review");
        stopCamera();
      }
    }
  };
  
  const retakePhoto = () => {
    setPhoto(null);
    setPhotoTab("capture");
    startCamera();
  };
  
  const verifyPhoto = async () => {
    if (!photo) return;
    
    setVerifyingPhoto(true);
    
    try {
      const response = await blockchainSystem.savePhotoVerification(photo);
      
      // Simulate verification delay
      setTimeout(() => {
        if (response.success) {
          setPhotoVerified(true);
          setPhotoTab("verified");
          toast.success("Photo verification successful!");
        } else {
          toast.error(response.message || "Photo verification failed");
        }
        setVerifyingPhoto(false);
      }, 2000);
    } catch (error) {
      console.error("Error verifying photo:", error);
      toast.error("An error occurred during photo verification");
      setVerifyingPhoto(false);
    }
  };
  
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhaarData({
      ...aadhaarData,
      [e.target.name]: e.target.value
    });
  };
  
  const formatAadhaarNumber = (input: string): string => {
    const digits = input.replace(/\D/g, '');
    const parts = [];
    
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.substr(i, 4));
    }
    
    return parts.join('-').substring(0, 14); // Format as XXXX-XXXX-XXXX
  };

  const sendOTP = () => {
    // Validate Aadhaar number and phone number
    const aadhaarNumberClean = aadhaarData.aadhaarNumber.replace(/[-\s]/g, '');
    if (!/^\d{12}$/.test(aadhaarNumberClean)) {
      toast.error("Invalid Aadhaar number. Must be 12 digits.");
      return;
    }

    if (!/^\d{10}$/.test(aadhaarData.phoneNumber)) {
      toast.error("Invalid phone number. Must be 10 digits.");
      return;
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    
    // Show toast notification
    toast.success(`OTP sent to phone number ending with ${aadhaarData.phoneNumber.slice(-4)}`, {
      description: `For demo purposes, the OTP is: ${otp}`
    });
  };
  
  const verifyOTP = () => {
    setOtpVerifying(true);
    
    // Simulate verification delay
    setTimeout(() => {
      if (otpCode === generatedOtp) {
        // Proceed with Aadhaar verification after OTP is verified
        verifyAadhaar();
      } else {
        toast.error("Invalid OTP. Please try again.");
        setOtpVerifying(false);
      }
    }, 1500);
  };
  
  const verifyAadhaar = async () => {
    setVerifyingAadhaar(true);
    
    try {
      const response = await blockchainSystem.verifyAadhaar(
        aadhaarData.aadhaarNumber,
        aadhaarData.fullName,
        aadhaarData.dateOfBirth,
        aadhaarData.address
      );
      
      // Simulate verification delay
      setTimeout(() => {
        if (response.success) {
          setAadhaarVerified(true);
          setAadhaarTab("verified");
          setVerifiedIdentity(blockchainSystem.getVerification());
          toast.success("Aadhaar verification successful!");
        } else {
          toast.error(response.message || "Aadhaar verification failed");
        }
        setVerifyingAadhaar(false);
        setOtpVerifying(false);
      }, 2000);
    } catch (error) {
      console.error("Error verifying Aadhaar:", error);
      toast.error("An error occurred during Aadhaar verification");
      setVerifyingAadhaar(false);
      setOtpVerifying(false);
    }
  };
  
  useEffect(() => {
    // Start camera when the component mounts and photoTab is "capture"
    if (photoTab === "capture") {
      startCamera();
    }
    
    // Clean up function to stop the camera when the component unmounts
    return () => {
      stopCamera();
    };
  }, [photoTab]);
  
  const cardBg = theme === "dark" ? "bg-gray-900 border-gray-800" : "";
  const textColor = theme === "dark" ? "text-white" : "";
  const textMutedColor = theme === "dark" ? "text-gray-400" : "text-gray-500";
  
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-[#ED64A6]" : "text-blue-700"}`}>
          Identity Verification
        </h1>
        <p className={textMutedColor}>
          Verify your identity to access all features of SecureID-Chain
        </p>
      </div>
      
      {/* Photo Verification Section */}
      <Card className={cardBg}>
        <CardHeader>
          <CardTitle className={textColor}>
            <div className="flex items-center">
              <Camera className="w-6 h-6 mr-2" />
              Photo Verification
              {photoVerified && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check className="w-3 h-3 mr-1" />
                  Verified
                </span>
              )}
            </div>
          </CardTitle>
          <CardDescription className={textMutedColor}>
            Take a photo for identity verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={photoTab} onValueChange={setPhotoTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="capture" disabled={photoVerified}>Capture</TabsTrigger>
              <TabsTrigger value="review" disabled={!photo || photoVerified}>Review</TabsTrigger>
              <TabsTrigger value="verified" disabled={!photoVerified}>Verified</TabsTrigger>
            </TabsList>
            
            <TabsContent value="capture">
              <div className="space-y-4">
                <div className="relative border rounded-md overflow-hidden bg-black aspect-video mx-auto max-w-md">
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover"
                    autoPlay 
                    playsInline 
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <Button onClick={capturePhoto} className={`w-full max-w-md mx-auto ${theme === "dark" ? "bg-purple-700 hover:bg-purple-800" : ""}`}>
                  Capture Photo
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="review">
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden bg-black aspect-video mx-auto max-w-md">
                  {photo && <img src={photo} className="w-full h-full object-cover" alt="Captured" />}
                </div>
                <div className="flex space-x-2 max-w-md mx-auto">
                  <Button variant="outline" onClick={retakePhoto} className="flex-1">
                    Retake
                  </Button>
                  <Button 
                    onClick={verifyPhoto} 
                    className={`flex-1 ${theme === "dark" ? "bg-purple-700 hover:bg-purple-800" : ""}`}
                    disabled={verifyingPhoto}
                  >
                    {verifyingPhoto && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Verify
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="verified">
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden bg-black aspect-video mx-auto max-w-md">
                  {photo && <img src={photo} className="w-full h-full object-cover" alt="Verified" />}
                </div>
                <div className={`p-4 rounded-md ${theme === "dark" ? "bg-green-900/30" : "bg-green-50"}`}>
                  <div className="flex">
                    <div className={`rounded-full p-1 ${theme === "dark" ? "bg-green-500" : "bg-green-100"}`}>
                      <Check className={`w-5 h-5 ${theme === "dark" ? "text-green-900" : "text-green-500"}`} />
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${theme === "dark" ? "text-green-300" : "text-green-800"}`}>
                        Photo verification successful
                      </h3>
                      <div className={`mt-2 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        <p>Your photo has been verified and securely stored.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Aadhaar Verification Section */}
      <Card className={cardBg}>
        <CardHeader>
          <CardTitle className={textColor}>
            <div className="flex items-center">
              <div className="mr-2">🆔</div>
              Aadhaar Verification
              {aadhaarVerified && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check className="w-3 h-3 mr-1" />
                  Verified
                </span>
              )}
            </div>
          </CardTitle>
          <CardDescription className={textMutedColor}>
            Verify your identity with your Aadhaar card details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={aadhaarTab} onValueChange={setAadhaarTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="form" disabled={aadhaarVerified}>Form</TabsTrigger>
              <TabsTrigger value="verified" disabled={!aadhaarVerified}>Verified</TabsTrigger>
            </TabsList>
            
            <TabsContent value="form">
              <div className="space-y-4">
                {!otpSent ? (
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="aadhaarNumber" className={textColor}>Aadhaar Number</Label>
                      <Input
                        id="aadhaarNumber"
                        name="aadhaarNumber"
                        value={formatAadhaarNumber(aadhaarData.aadhaarNumber)}
                        onChange={handleAadhaarChange}
                        placeholder="XXXX-XXXX-XXXX"
                        className={`mt-1 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : ""}`}
                        maxLength={14}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber" className={textColor}>Registered Mobile Number</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={aadhaarData.phoneNumber}
                        onChange={handleAadhaarChange}
                        placeholder="10-digit mobile number"
                        className={`mt-1 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : ""}`}
                        maxLength={10}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="fullName" className={textColor}>Full Name (as per Aadhaar)</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={aadhaarData.fullName}
                        onChange={handleAadhaarChange}
                        placeholder="John Doe"
                        className={`mt-1 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : ""}`}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="dateOfBirth" className={textColor}>Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={aadhaarData.dateOfBirth}
                        onChange={handleAadhaarChange}
                        className={`mt-1 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : ""}`}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address" className={textColor}>Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={aadhaarData.address}
                        onChange={handleAadhaarChange}
                        placeholder="123 Main St, City, State, Pincode"
                        className={`mt-1 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : ""}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className={`p-4 rounded-md ${theme === "dark" ? "bg-blue-900/30" : "bg-blue-50"}`}>
                      <div className="flex">
                        <div className={`rounded-full p-1 ${theme === "dark" ? "bg-blue-500" : "bg-blue-100"}`}>
                          <Smartphone className={`w-5 h-5 ${theme === "dark" ? "text-blue-900" : "text-blue-500"}`} />
                        </div>
                        <div className="ml-3">
                          <h3 className={`text-sm font-medium ${theme === "dark" ? "text-blue-300" : "text-blue-800"}`}>
                            OTP Sent
                          </h3>
                          <div className={`mt-2 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            <p>Please enter the OTP sent to your registered mobile number ending with {aadhaarData.phoneNumber.slice(-4)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="otp" className={textColor}>Enter OTP</Label>
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={otpSent ? verifyOTP : sendOTP} 
                  className={`w-full ${theme === "dark" ? "bg-purple-700 hover:bg-purple-800" : ""}`}
                  disabled={otpSent ? otpVerifying || otpCode.length !== 6 : verifyingAadhaar}
                >
                  {(otpVerifying || verifyingAadhaar) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {otpSent ? "Verify OTP" : "Send OTP"}
                </Button>

                {otpSent && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode("");
                    }}
                    className="w-full mt-2"
                  >
                    Change Mobile Number
                  </Button>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="verified">
              <div className={`p-4 rounded-md ${theme === "dark" ? "bg-green-900/30" : "bg-green-50"}`}>
                <div className="flex">
                  <div className={`rounded-full p-1 ${theme === "dark" ? "bg-green-500" : "bg-green-100"}`}>
                    <Check className={`w-5 h-5 ${theme === "dark" ? "text-green-900" : "text-green-500"}`} />
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${theme === "dark" ? "text-green-300" : "text-green-800"}`}>
                      Aadhaar verification successful
                    </h3>
                    <div className={`mt-2 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      <p>Your Aadhaar details have been verified successfully.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className={`text-lg font-medium mb-3 ${textColor}`}>Verified Details</h3>
                <dl className="divide-y divide-gray-700">
                  <div className="py-3 grid grid-cols-3">
                    <dt className={textMutedColor}>Name</dt>
                    <dd className={`col-span-2 ${textColor}`}>{verifiedIdentity?.fullName}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <dt className={textMutedColor}>Aadhaar Number</dt>
                    <dd className={`col-span-2 ${textColor}`}>
                      {verifiedIdentity?.aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3")}
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <dt className={textMutedColor}>Date of Birth</dt>
                    <dd className={`col-span-2 ${textColor}`}>{verifiedIdentity?.dateOfBirth}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <dt className={textMutedColor}>Address</dt>
                    <dd className={`col-span-2 ${textColor}`}>{verifiedIdentity?.address}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <dt className={textMutedColor}>Verified At</dt>
                    <dd className={`col-span-2 ${textColor}`}>
                      {verifiedIdentity?.verifiedAt ? new Date(verifiedIdentity.verifiedAt).toLocaleString() : ""}
                    </dd>
                  </div>
                </dl>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Identity Status Card */}
      <Card className={`${cardBg} ${theme === "dark" ? "border-purple-900/50" : "border-blue-100"}`}>
        <CardHeader className={theme === "dark" ? "bg-purple-900/20" : "bg-blue-50"}>
          <CardTitle className={textColor}>Identity Verification Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={textColor}>Photo Verification</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${photoVerified 
                ? "bg-green-100 text-green-800" 
                : "bg-yellow-100 text-yellow-800"}`}>
                {photoVerified ? "Completed" : "Pending"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={textColor}>Aadhaar Verification</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${aadhaarVerified 
                ? "bg-green-100 text-green-800" 
                : "bg-yellow-100 text-yellow-800"}`}>
                {aadhaarVerified ? "Completed" : "Pending"}
              </span>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${textColor}`}>Overall Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${(photoVerified && aadhaarVerified) 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"}`}>
                  {(photoVerified && aadhaarVerified) ? "Fully Verified" : "Incomplete"}
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${((photoVerified ? 1 : 0) + (aadhaarVerified ? 1 : 0)) * 50}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Identity;
