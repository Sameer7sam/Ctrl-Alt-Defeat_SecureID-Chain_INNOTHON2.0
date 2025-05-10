
import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PhotoVerification from '@/components/identity/PhotoVerification';
import AadhaarVerification from '@/components/identity/AadhaarVerification';
import KeyManagement from '@/components/identity/KeyManagement';

const Identity = () => {
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
            <TabsTrigger value="aadhaar">Aadhaar & Phone</TabsTrigger>
            <TabsTrigger value="keys">Identity Keys</TabsTrigger>
          </TabsList>
          
          <TabsContent value="photo" className="space-y-6">
            <PhotoVerification />
          </TabsContent>
          
          <TabsContent value="aadhaar" className="space-y-6">
            <AadhaarVerification />
          </TabsContent>
          
          <TabsContent value="keys" className="space-y-6">
            <KeyManagement />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default Identity;
