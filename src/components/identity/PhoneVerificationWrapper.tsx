
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import PhoneVerification from '@/components/PhoneVerification';

interface PhoneVerificationWrapperProps {
  isPhoneVerified: boolean;
  onVerificationSuccess: (data: any) => void;
}

const PhoneVerificationWrapper = ({ 
  isPhoneVerified, 
  onVerificationSuccess 
}: PhoneVerificationWrapperProps) => {
  return (
    <>
      {!isPhoneVerified ? (
        <PhoneVerification onVerificationSuccess={onVerificationSuccess} />
      ) : (
        <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg neo-blur overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">Phone Verified</h3>
                <p className="text-muted-foreground">Your phone number has been successfully verified</p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default PhoneVerificationWrapper;
