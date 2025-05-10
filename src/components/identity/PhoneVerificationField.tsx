
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

interface PhoneVerificationFieldProps {
  onVerificationSuccess: (phoneData: any) => void;
  disabled?: boolean;
}

const PhoneVerificationField: React.FC<PhoneVerificationFieldProps> = ({
  onVerificationSuccess,
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isScriptError, setIsScriptError] = useState(false);
  
  useEffect(() => {
    if (disabled) return;
    
    // Load the external script
    const script = document.createElement('script');
    script.src = "https://www.phone.email/sign_in_button_v1.js";
    script.async = true;
    
    // Add event listeners for success and error
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    
    script.onerror = () => {
      setIsScriptError(true);
      toast.error("Failed to load verification service. Please try again later.");
    };
    
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    // Define the listener function
    window.phoneEmailListener = function(userObj) {
      const user_json_url = userObj.user_json_url;
      
      // Call the success handler with the user data
      if (onVerificationSuccess) {
        onVerificationSuccess({
          user_json_url,
          verified: true
        });
      }
      
      toast.success('Phone number verified successfully!');
    };

    return () => {
      // Cleanup the listener function when the component unmounts
      window.phoneEmailListener = null;
    };
  }, [onVerificationSuccess, disabled]);

  if (disabled) {
    return null;
  }

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="font-medium mb-2">Phone Verification</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Verify your phone number to complete the verification process
      </p>
      
      <div className="flex justify-center">
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
  );
};

export default PhoneVerificationField;
