
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { blockchainSystem } from '@/lib/blockchain';
import { toast } from 'sonner';

export default function RegisterForm() {
  const [idNumber, setIdNumber] = useState('');
  const [selfie, setSelfie] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await blockchainSystem.registerIdentity(idNumber, selfie);
      
      if (response.success) {
        toast.success(response.message);
        setIdNumber('');
        setSelfie('');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('An error occurred during registration.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
        <CardDescription>
          Register your identity to create a secure blockchain identity token
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              id="idNumber"
              placeholder="Enter your ID number (e.g. 12345)"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
              className="border-blue-200 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="selfie">Selfie Verification</Label>
            <Input
              id="selfie"
              placeholder="Enter 'selfie' to simulate photo verification"
              value={selfie}
              onChange={(e) => setSelfie(e.target.value)}
              required
              className="border-blue-200 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500">
              For this demo, just type "selfie" to simulate a photo verification
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
          >
            {isLoading ? 'Processing...' : 'Verify & Register'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
