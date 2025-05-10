import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { backendService } from '@/lib/backend';
import { useWallet } from '@/lib/useWallet';
import { useNavigate } from 'react-router-dom';

export function PasswordRecovery() {
  const { currentUser } = useWallet();
  const navigate = useNavigate();
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recoveredPassword, setRecoveredPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setRecoveredPassword(null);

    try {
      const password = await backendService.recoverWalletPassword(
        currentUser.publicKey,
        {
          aadhaarNumber,
          fullName,
          dateOfBirth,
          phoneNumber
        }
      );

      if (password) {
        setRecoveredPassword(password);
      } else {
        setError('Could not recover password. Please verify your details.');
      }
    } catch (err) {
      setError('An error occurred while recovering your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Recover Wallet Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aadhaar">Aadhaar Number</Label>
            <Input
              id="aadhaar"
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value)}
              placeholder="Enter your Aadhaar number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {recoveredPassword && (
            <Alert>
              <AlertDescription>
                Your wallet password has been recovered. Please keep it safe.
                <div className="mt-2 p-2 bg-muted rounded">
                  {recoveredPassword}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Recovering...' : 'Recover Password'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/wallet')}
            >
              Back to Wallet
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 