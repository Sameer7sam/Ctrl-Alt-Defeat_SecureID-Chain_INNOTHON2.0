
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Camera, RefreshCw, Check, CameraOff, AlertCircle, Shield, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { blockchainSystem } from '@/lib/blockchain';
import { motion } from 'framer-motion';

const PhotoVerification = () => {
  // State management
  const [photo, setPhoto] = useState<string | null>(null);
  const [isPhotoVerifying, setIsPhotoVerifying] = useState(false);
  const [isPhotoVerified, setIsPhotoVerified] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Clean up camera resources when component unmounts or when navigating away
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopCamera();
      }
    };
  }, []);
  
  // Function to start the camera with proper cleanup
  const startCamera = async () => {
    try {
      // Reset error state and ensure camera is stopped first
      setCameraError(null);
      stopCamera();
      
      console.log("Requesting camera access...");
      
      // Request camera with specific constraints for front-facing camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      console.log("Camera access granted");
      
      // Store stream in ref for cleanup
      streamRef.current = stream;
      
      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Play the video when loaded
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setIsCameraActive(true);
              })
              .catch(err => {
                console.error("Error playing video:", err);
                setCameraError(`Error starting camera: ${err.message}`);
                stopCamera();
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
      
      stopCamera();
      setIsCameraActive(false);
    }
  };

  // Improved function to stop the camera
  const stopCamera = () => {
    console.log("Stopping camera track");
    
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      
      tracks.forEach(track => {
        track.stop();
      });
      
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    console.log("Camera stopped");
  };

  // Function to capture a photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) {
      toast.error('Camera not ready');
      return;
    }
    
    console.log("Capturing photo...");
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      // Draw the current video frame on the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      try {
        // Convert canvas to data URL (JPEG format)
        const photoData = canvas.toDataURL('image/jpeg');
        setPhoto(photoData);
        stopCamera();
        console.log("Photo captured successfully");
      } catch (error) {
        console.error('Error capturing photo:', error);
        toast.error('Failed to capture photo');
      }
    }
  };

  // Function to retake the photo
  const retakePhoto = () => {
    setPhoto(null);
    setIsPhotoVerified(false);
    startCamera();
  };

  // Function to verify the photo
  const verifyPhoto = async () => {
    if (!photo) {
      toast.error('Please capture a photo first');
      return;
    }
    
    setIsPhotoVerifying(true);
    
    try {
      console.log("Starting photo verification process");
      
      // Check if user is registered first
      const currentUser = blockchainSystem.getCurrentUser();
      
      if (!currentUser) {
        // Register identity automatically if not registered
        await blockchainSystem.registerIdentity("auto-id", "auto-selfie");
        toast.success('Identity registered automatically');
      }
      
      const response = await blockchainSystem.savePhotoVerification(photo);
      
      if (response.success) {
        console.log("Photo verification successful");
        toast.success('Photo verification successful');
        setIsPhotoVerified(true);
      } else {
        console.error("Photo verification failed:", response.message);
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
    <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg overflow-hidden">
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
                      <Camera className="mr-2 h-4 w-4" />
                      Retry Camera Access
                    </Button>
                  </div>
                )}
                
                {isCameraActive ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  !cameraError && (
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
              
              {isCameraActive && (
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
