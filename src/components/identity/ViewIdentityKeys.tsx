
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { walletService } from '@/lib/walletService';
import { Eye, EyeOff, Key, Lock, Copy, Check, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ViewIdentityKeys = () => {
  const [password, setPassword] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [copySuccess, setCopySuccess] = useState<'public' | 'private' | 'did' | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const publicKey = walletService.getPublicKey();
  const didIdentifier = walletService.getDidIdentifier();
  const hasKeys = walletService.hasGeneratedKeys();

  // Handle password validation and key display
  const handleViewKeys = async () => {
    if (password.length < 8) {
      toast.error('Please enter your password (minimum 8 characters)');
      return;
    }

    setIsValidating(true);
    try {
      const decryptedKey = await walletService.decryptKey(password);
      if (decryptedKey) {
        setPrivateKey(decryptedKey);
        setShowDialog(true);
        toast.success('Password validated successfully');
      } else {
        toast.error('Invalid password');
      }
    } catch (error) {
      console.error('Error validating password:', error);
      toast.error('Failed to validate password');
    } finally {
      setIsValidating(false);
    }
  };

  // Copy key to clipboard
  const copyToClipboard = (text: string | null, type: 'public' | 'private' | 'did') => {
    if (!text) {
      toast.error('No key available to copy');
      return;
    }
    
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(type);
        setTimeout(() => setCopySuccess(null), 2000);
        toast.success(`${type === 'public' ? 'Public' : type === 'private' ? 'Private' : 'DID'} copied to clipboard`);
      },
      () => {
        toast.error('Failed to copy key');
      }
    );
  };

  // Format key for display (truncate)
  const formatKey = (key: string | null): string => {
    if (!key) return 'Not available';
    return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
  };

  return (
    <>
      <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            View Identity Keys
          </CardTitle>
          <CardDescription>
            Access your identity keys with your secure password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasKeys ? (
            <div className="p-4 rounded-md bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-500">No Identity Keys Found</p>
                  <p className="mt-1 text-muted-foreground">
                    You haven't generated your identity keys yet. Please go to the Identity Keys tab to generate your keys first.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/5 p-3 rounded-md">
                <Label className="text-sm text-muted-foreground">Public Key (Safe to Share)</Label>
                <div className="flex items-center mt-1">
                  <code className="bg-black/20 p-2 rounded text-sm flex-1 overflow-x-auto">
                    {formatKey(publicKey)}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyToClipboard(publicKey, 'public')}
                    className="ml-2"
                  >
                    {copySuccess === 'public' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-primary/5 p-3 rounded-md">
                <Label className="text-sm text-muted-foreground">DID Identifier (Safe to Share)</Label>
                <div className="flex items-center mt-1">
                  <code className="bg-black/20 p-2 rounded text-sm flex-1 overflow-x-auto">
                    {didIdentifier || 'Not available'}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyToClipboard(didIdentifier, 'did')}
                    className="ml-2"
                    disabled={!didIdentifier}
                  >
                    {copySuccess === 'did' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="password">Enter Password to View Private Key</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleViewKeys}
                    disabled={isValidating || !password}
                    className="shrink-0"
                  >
                    {isValidating ? 'Validating...' : 'View Keys'}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-md">
                <div className="flex items-start gap-2">
                  <Lock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-500">Security Note</p>
                    <p className="mt-1 text-muted-foreground">
                      Your private key gives full access to your digital identity. Never share it with anyone and always keep it secure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog to show private key */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Your Private Key
            </DialogTitle>
            <DialogDescription>
              This key gives full access to your digital identity. Keep it secret and secure.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-black/10 p-4 rounded-md relative">
              <div className={`absolute inset-0 backdrop-blur-md flex items-center justify-center ${showPrivateKey ? 'hidden' : 'block'}`}>
                <Button 
                  onClick={() => setShowPrivateKey(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Show Private Key
                </Button>
              </div>
              
              {showPrivateKey && privateKey && (
                <div className="break-all font-mono text-sm">
                  {privateKey}
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setShowPrivateKey(!showPrivateKey)} 
                className="flex items-center gap-2"
              >
                {showPrivateKey ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide Key
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show Key
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => copyToClipboard(privateKey, 'private')}
                disabled={!showPrivateKey || !privateKey}
                className="flex items-center gap-2"
              >
                {copySuccess === 'private' ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-md mt-4">
              <div className="text-sm text-center text-muted-foreground">
                <p className="font-medium text-red-500">Warning!</p>
                <p>
                  Never share this key with anyone or enter it on any website.
                  Anyone with this key can access your identity and assets.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewIdentityKeys;
