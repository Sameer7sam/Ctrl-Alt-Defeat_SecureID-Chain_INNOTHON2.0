
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { blockchainSystem } from '@/lib/blockchain';
import { toast } from 'sonner';

export default function TransactionForm() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const currentUser = blockchainSystem.getCurrentUser();
    setIsRegistered(!!currentUser?.identityToken);
  }, []);

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isRegistered) {
      toast.error("You need to register your identity first!");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await blockchainSystem.sendTransaction(
        recipient,
        parseFloat(amount)
      );
      
      if (response.success) {
        toast.success(response.message);
        setRecipient('');
        setAmount('');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('An error occurred while processing the transaction.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Send Secure Transaction</CardTitle>
        <CardDescription>
          Send a digitally signed transaction to another user
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleTransaction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Public Key</Label>
            <Input
              id="recipient"
              placeholder="Enter recipient's public key"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
              className="border-blue-200 focus:border-blue-500"
              disabled={!isRegistered}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount to send"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              className="border-blue-200 focus:border-blue-500"
              disabled={!isRegistered}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isLoading || !isRegistered}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900"
          >
            {!isRegistered ? 'Register First' : isLoading ? 'Processing...' : 'Send Transaction'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
