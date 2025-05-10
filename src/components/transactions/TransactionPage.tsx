import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Send, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { backendService } from '@/lib/backend';
import { blockchainSystem } from '@/lib/blockchain';

interface Transaction {
  id: string;
  sender: string;
  recipient: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  signature: string;
}

const TransactionPage = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const currentUser = blockchainSystem.getCurrentUser();
      if (currentUser) {
        const history = await backendService.getTransactionHistory(currentUser.publicKey);
        setTransactions(history);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUser = blockchainSystem.getCurrentUser();
      if (!currentUser) {
        toast.error('Please log in to send transactions');
        return;
      }

      // Check if user is fully verified
      const isVerified = await backendService.isFullyVerified(currentUser.publicKey);
      if (!isVerified) {
        toast.error('Please complete identity verification first');
        return;
      }

      // Create and sign transaction
      const response = await blockchainSystem.sendTransaction(recipient, amountNum);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      const transactionId = response.data.transactionId;

      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await backendService.updateTransactionStatus(transactionId, 'completed');
      toast.success('Transaction completed successfully');
      
      // Reset form and reload transactions
      setRecipient('');
      setAmount('');
      loadTransactions();
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast.error('Failed to send transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Send Transaction Card */}
        <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle>Send Transaction</CardTitle>
            <CardDescription>
              Send a secure transaction using your verified identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient's public key"
                  className="bg-background/50"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-background/50"
                  disabled={isSubmitting}
                />
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Transaction
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transaction History Card */}
        <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View your recent transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-background/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {tx.sender === blockchainSystem.getCurrentUser()?.publicKey ? (
                        <ArrowUpRight className="h-5 w-5 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="h-5 w-5 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium">
                          {tx.sender === blockchainSystem.getCurrentUser()?.publicKey
                            ? `Sent to ${tx.recipient.slice(0, 8)}...`
                            : `Received from ${tx.sender.slice(0, 8)}...`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(tx.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-medium">
                        {tx.sender === blockchainSystem.getCurrentUser()?.publicKey ? '-' : '+'}
                        {tx.amount}
                      </p>
                      {getStatusIcon(tx.status)}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionPage; 