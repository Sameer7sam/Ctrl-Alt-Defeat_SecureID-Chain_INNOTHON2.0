
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

const PhoneVerification = ({
  onVerificationSuccess
}: {
  onVerificationSuccess?: (phoneData: any) => void
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isScriptError, setIsScriptError] = useState(false);
  
  useEffect(() => {
    // Load the external script
    const script = document.createElement('script');
    script.src = "https://www.phone.email/sign_in_button_v1.js";
    script.async = true;
    
    // Add event listeners for success and error
    script.onload = () => {
      console.log("Phone verification script loaded successfully");
      setIsScriptLoaded(true);
    };
    
    script.onerror = () => {
      console.error("Failed to load phone verification script");
      setIsScriptError(true);
      toast.error("Failed to load verification service. Please try again later.");
    };
    
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    // Define the listener function
    window.phoneEmailListener = function(userObj) {
      console.log("Phone verification callback received:", userObj);
      const user_json_url = userObj.user_json_url;
      
      // Call the success handler with the user data
      if (onVerificationSuccess) {
        onVerificationSuccess({
          user_json_url,
          verified: true
        });
      }
      
      // For demonstration, display a success message
      if (containerRef.current) {
        const successMessage = document.createElement('div');
        successMessage.className = "mt-4 p-3 bg-green-500/20 text-green-500 rounded-md text-sm";
        successMessage.innerHTML = "Phone Verification Successful!";
        containerRef.current.appendChild(successMessage);
      }
    };

    return () => {
      // Cleanup the listener function when the component unmounts
      window.phoneEmailListener = null;
    };
  }, [onVerificationSuccess]);

  return (
    <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg neo-glow overflow-hidden">
      <CardHeader>
        <CardTitle>Phone Verification</CardTitle>
        <CardDescription>
          Verify your mobile number to complete your identity verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-primary/5 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">
              Click the button below to verify your phone number. You'll receive a verification code via SMS.
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            {isScriptError && (
              <div className="text-center mb-4">
                <p className="text-red-500 text-sm">Failed to load verification service.</p>
                <button 
                  className="text-primary hover:text-primary/80 text-sm mt-2"
                  onClick={() => window.location.reload()}
                >
                  Refresh page to try again
                </button>
              </div>
            )}
            
            {!isScriptLoaded && !isScriptError && (
              <div className="flex items-center justify-center py-4">
                <Loader className="h-6 w-6 text-primary animate-spin mr-2" />
                <span className="text-sm">Loading verification...</span>
              </div>
            )}
            
            <div ref={containerRef} className="pe_signin_button" data-client-id="15695407177920574360"></div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center text-xs text-muted-foreground">
        Your phone number will only be used for verification purposes.
      </CardFooter>
    </Card>
  );
};

// Add this type definition to the global Window interface
declare global {
  interface Window {
    phoneEmailListener: ((userObj: { user_json_url: string }) => void) | null;
  }
}

export default PhoneVerification;
