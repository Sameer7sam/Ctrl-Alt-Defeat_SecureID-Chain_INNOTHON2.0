import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

type PhoneEmailListener = ((userObj: { user_json_url: string }) => void) | undefined;

interface PhoneEmailSignInProps {
  onVerificationComplete?: (userData: {
    countryCode: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
  }) => void;
}

const PhoneEmailSignIn: React.FC<PhoneEmailSignInProps> = ({ onVerificationComplete }) => {
  useEffect(() => {
    // Load the external script
    const script = document.createElement('script');
    script.src = "https://www.phone.email/sign_in_button_v1.js";
    script.async = true;
    document.querySelector('.pe_signin_button')?.appendChild(script);

    // Define the listener function
    (window as any).phoneEmailListener = async function(userObj: { user_json_url: string }) {
      try {
        // Fetch user data from the provided URL
        const response = await fetch(userObj.user_json_url);
        const userData = await response.json();

        if (onVerificationComplete) {
          onVerificationComplete({
            countryCode: userData.user_country_code,
            phoneNumber: userData.user_phone_number,
            firstName: userData.user_first_name,
            lastName: userData.user_last_name
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to verify phone number');
      }
    };

    return () => {
      // Cleanup the listener function when the component unmounts
      (window as any).phoneEmailListener = undefined;
    };
  }, [onVerificationComplete]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phone Verification</CardTitle>
        <CardDescription>
          Verify your phone number using Phone.Email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="pe_signin_button" data-client-id="15695407177920574360"></div>
      </CardContent>
    </Card>
  );
};

export default PhoneEmailSignIn; 