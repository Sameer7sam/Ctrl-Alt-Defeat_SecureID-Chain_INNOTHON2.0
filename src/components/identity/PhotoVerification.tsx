
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Camera, RefreshCw, Check, CameraOff, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { blockchainSystem } from '@/lib/blockchain';
import { motion } from 'framer-motion';

const PhotoVerification = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isPhotoVerifying, setIsPhotoVerifying] = useState(false);
  const [isPhotoVerified, setIsPhotoVerified] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Ensure we stop the camera when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      // Reset error state and set initializing state
      setCameraError(null);
      setIsInitializing(true);
      console.log("Requesting camera permissions...");
      
      // Request camera with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        } 
      });
      
      console.log("Camera permission granted, stream obtained:", stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            console.log("Video metadata loaded, playing...");
            videoRef.current.play()
              .then(() => {
                console.log("Video playing successfully");
                setIsStreamActive(true);
              })
              .catch(err => {
                console.error("Error playing video:", err);
                setCameraError(`Error playing video: ${err.message}`);
              });
          }
        };
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      
      // Provide more specific error messages based on common camera errors
      if (error.name === 'NotAllowedError') {
        setCameraError('Camera access was denied. Please check your browser permissions.');
        toast.error('Camera access denied. Please allow camera access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera device found. Please connect a camera and try again.');
        toast.error('No camera device found.');
      } else if (error.name === 'NotReadableError') {
        setCameraError('Camera is already in use by another application.');
        toast.error('Camera is being used by another application.');
      } else {
        setCameraError(`Could not access camera: ${error.message}`);
        toast.error('Could not access camera. Please check your permissions.');
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      console.log("Stopping camera stream");
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => {
        console.log("Stopping track:", track);
        track.stop();
      });
      
      videoRef.current.srcObject = null;
      setIsStreamActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isStreamActive) {
      toast.error('Camera not ready');
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      console.log("Capturing photo from video");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      try {
        const photoData = canvas.toDataURL('image/jpeg');
        console.log("Photo captured successfully");
        setPhoto(photoData);
        stopCamera();
      } catch (error) {
        console.error('Error capturing photo:', error);
        toast.error('Failed to capture photo');
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
      // Check if user is registered first
      const currentUser = blockchainSystem.getCurrentUser();
      console.log("Current user check:", currentUser);
      
      if (!currentUser) {
        // Register identity automatically if not registered
        console.log("No user found, registering identity automatically...");
        await blockchainSystem.registerIdentity("auto-id", "auto-selfie");
        toast.success('Identity registered automatically');
      }
      
      console.log("Sending photo for verification...");
      const response = await blockchainSystem.savePhotoVerification(photo);
      
      if (response.success) {
        toast.success('Photo verification successful');
        setIsPhotoVerified(true);
      } else {
        toast.error(response.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error verifying photo:', error);
      toast.error('Failed to verify photo');
    } finally {
      setIsPhotoVerifying(false);
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg neo-blur overflow-hidden">
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
              <div className="w-full max-w-md h-64 bg-black/50 rounded-lg overflow-hidden relative">
                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                    <p className="text-red-500 text-center">{cameraError}</p>
                    <Button 
                      onClick={startCamera}
                      variant="outline"
                      className="mt-4 border-white/20 hover:bg-white/10"
                    >
                      <CameraOff className="mr-2 h-4 w-4" />
                      Retry Camera Access
                    </Button>
                  </div>
                )}
                
                {isInitializing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Initializing camera...</p>
                    </div>
                  </div>
                )}
                
                {isStreamActive ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  !isInitializing && !cameraError && (
                    <div className="flex items-center justify-center h-full">
                      <Button 
                        onClick={startCamera}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Start Camera
                      </Button>
                    </div>
                  )
                )}
              </div>
              
              {isStreamActive && (
                <Button 
                  onClick={capturePhoto} 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Capture Photo
                </Button>
              )}
            </>
          ) : (
            <>
              <motion.div 
                className="w-full max-w-md h-64 bg-black/50 rounded-lg overflow-hidden relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
              
              <div className="flex space-x-4">
                {!isPhotoVerified && (
                  <>
                    <Button 
                      onClick={retakePhoto}
                      variant="outline"
                      className="border-white/20 hover:bg-white/10"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retake
                    </Button>
                    
                    <Button 
                      onClick={verifyPhoto}
                      disabled={isPhotoVerifying}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
        
        <div className="bg-primary/10 p-4 rounded-md">
          <h4 className="font-medium text-sm mb-2">Why we need your photo</h4>
          <p className="text-sm text-muted-foreground">
            Your photo helps us verify your identity and secure your account. 
            This prevents unauthorized access and protects your digital assets.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoVerification;
