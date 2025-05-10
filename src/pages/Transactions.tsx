
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { CircleDollarSign, Loader2, AlertTriangle, Clock, CheckCircle, CircleX, Shield, ShieldAlert } from "lucide-react";
import { blockchainSystem } from "@/lib/blockchain";
import { useTheme } from "@/components/ThemeProvider";
import { Transaction } from "@/lib/types";
import { walletService } from "@/lib/walletService";

// Demo recipient addresses
const DEMO_RECIPIENTS = [
  "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
  "0x617F2E2fD72FD9D5503197092aC168c91465E7f2",
  "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
  "0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678"
];

const Transactions = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    recipient: "",
    amount: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fraudLockCountdown, setFraudLockCountdown] = useState<number | null>(null);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
  const [showDemoRecipients, setShowDemoRecipients] = useState(false);
  
  // Check if user is verified
  useEffect(() => {
    const verification = blockchainSystem.getVerification();
    setIsVerified(!!verification && verification.verified);
    
    // Get transactions
    const txs = blockchainSystem.getTransactions();
    setTransactions(txs);
    
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const selectDemoRecipient = (recipient: string) => {
    setFormData({
      ...formData,
      recipient
    });
    setShowDemoRecipients(false);
  };
  
  const handleSendTransaction = async () => {
    if (!formData.recipient || !formData.amount) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Validate amount is a positive number
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get wallet connection
      const walletConnection = walletService.getWalletConnection();
      if (!walletConnection) {
        toast.error("Please connect your wallet first");
        return;
      }
      
      // Check transaction frequency (anti-fraud)
      const transactionCheck = walletService.checkTransactionLimit(walletConnection.address);
      if (!transactionCheck.allowed) {
        startCountdown(transactionCheck.timeToWait || 60000);
        toast.error("Transaction frequency limit exceeded. Please wait before trying again.");
        return;
      }
      
      const response = await blockchainSystem.sendTransaction(formData.recipient, amount);
      
      if (response.success) {
        // Generate a random transaction ID for demo
        const txId = walletService.generateDemoTransactionId();
        toast.success(`Transaction completed! ID: ${txId.substring(0, 10)}...`);
        setFormData({ recipient: "", amount: "" });
        
        // Refresh transactions list
        const updatedTxs = blockchainSystem.getTransactions();
        setTransactions(updatedTxs);
      } else {
        toast.error(response.message || "Transaction failed");
        
        // Handle fraud detection lockout
        if (response.data?.timeToWait) {
          startCountdown(response.data.timeToWait);
        }
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
      toast.error("An error occurred while sending the transaction");
    } finally {
      setIsLoading(false);
    }
  };
  
  const startCountdown = (timeToWait: number) => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    
    setFraudLockCountdown(Math.ceil(timeToWait / 1000));
    
    const interval = setInterval(() => {
      setFraudLockCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    setCountdownInterval(interval);
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const cardBg = theme === "dark" ? "bg-gray-900 border-gray-800" : "";
  const textColor = theme === "dark" ? "text-white" : "";
  const textMutedColor = theme === "dark" ? "text-gray-400" : "text-gray-500";
  
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-[#ED64A6]" : "text-blue-700"}`}>
          Transactions
        </h1>
        <p className={textMutedColor}>
          Send secure transactions with fraud detection
        </p>
      </div>
      
      {/* Transaction Form */}
      <Card className={cardBg}>
        <CardHeader>
          <CardTitle className={textColor}>
            <div className="flex items-center">
              <CircleDollarSign className="w-6 h-6 mr-2" />
              Send Transaction
            </div>
          </CardTitle>
          <CardDescription className={textMutedColor}>
            Send a transaction to another user's public key
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isVerified ? (
            <div className={`p-4 rounded-md ${theme === "dark" ? "bg-yellow-900/30" : "bg-yellow-50"}`}>
              <p className={theme === "dark" ? "text-yellow-300" : "text-yellow-800"}>
                You need to complete identity verification before you can send transactions.
              </p>
              <Button 
                asChild 
                variant="outline" 
                className="mt-4"
              >
                <a href="/identity">Go to Identity Verification</a>
              </Button>
            </div>
          ) : fraudLockCountdown ? (
            <div className={`p-4 rounded-md ${theme === "dark" ? "bg-red-900/30" : "bg-red-50"}`}>
              <div className="flex items-start">
                <ShieldAlert className={theme === "dark" ? "text-red-400 w-5 h-5 mr-3" : "text-red-600 w-5 h-5 mr-3"} />
                <div>
                  <p className={`font-medium ${theme === "dark" ? "text-red-400" : "text-red-800"}`}>
                    Security Alert: Transaction Limit Exceeded
                  </p>
                  <p className={theme === "dark" ? "text-gray-300 mt-1" : "text-gray-700 mt-1"}>
                    Our security system has detected too many transactions in a short period.
                    Please wait {fraudLockCountdown} seconds before trying again.
                  </p>
                  <div className="mt-3 w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-red-600 h-2.5 rounded-full" 
                      style={{ width: `${(fraudLockCountdown / 60) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Label htmlFor="recipient" className={textColor}>Recipient Public Key</Label>
                <div className="flex">
                  <Input
                    id="recipient"
                    name="recipient"
                    value={formData.recipient}
                    onChange={handleInputChange}
                    placeholder="Recipient's public key"
                    className={`mt-1 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-2 whitespace-nowrap"
                    onClick={() => setShowDemoRecipients(!showDemoRecipients)}
                  >
                    Demo IDs
                  </Button>
                </div>
                
                {showDemoRecipients && (
                  <div className={`absolute z-10 mt-1 p-2 rounded-md shadow-lg w-full ${theme === "dark" ? "bg-gray-800" : "bg-white border"}`}>
                    <p className={`text-xs mb-2 ${textMutedColor}`}>Select a demo recipient:</p>
                    {DEMO_RECIPIENTS.map((address, i) => (
                      <div 
                        key={i}
                        onClick={() => selectDemoRecipient(address)}
                        className={`p-2 cursor-pointer rounded-md text-xs truncate ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                      >
                        {address}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="amount" className={textColor}>Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={`mt-1 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : ""}`}
                />
              </div>
              
              <Button 
                onClick={handleSendTransaction} 
                disabled={isLoading || !formData.recipient || !formData.amount}
                className={theme === "dark" ? "bg-purple-700 hover:bg-purple-800 w-full" : "w-full"}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? "Processing..." : "Send Transaction"}
              </Button>
              
              <div className={`p-4 rounded-md mt-4 ${theme === "dark" ? "bg-blue-900/20" : "bg-blue-50"}`}>
                <div className="flex items-start">
                  <Shield className={theme === "dark" ? "text-blue-400 w-5 h-5 mr-3 flex-shrink-0" : "text-blue-600 w-5 h-5 mr-3 flex-shrink-0"} />
                  <div>
                    <p className={`text-sm font-medium ${theme === "dark" ? "text-blue-300" : "text-blue-800"}`}>
                      Security Notice
                    </p>
                    <p className={`text-xs ${theme === "dark" ? "text-blue-200/70" : "text-blue-700/70"}`}>
                      For your protection, our fraud detection limits you to 3 transactions per minute. Exceeding this limit will temporarily lock transactions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Transaction History */}
      <Card className={cardBg}>
        <CardHeader>
          <CardTitle className={textColor}>Transaction History</CardTitle>
          <CardDescription className={textMutedColor}>
            View your recent transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-10">
              <CircleDollarSign className={`w-12 h-12 mx-auto mb-3 ${textMutedColor}`} />
              <h3 className={`text-lg font-medium mb-1 ${textColor}`}>No Transactions</h3>
              <p className={textMutedColor}>
                You haven't made any transactions yet.
              </p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={textMutedColor}>Transaction ID</TableHead>
                    <TableHead className={textMutedColor}>Type</TableHead>
                    <TableHead className={textMutedColor}>Amount</TableHead>
                    <TableHead className={textMutedColor}>Status</TableHead>
                    <TableHead className={textMutedColor}>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    const isSender = tx.sender !== "system";
                    const isRecipient = tx.recipient !== "system";
                    const type = isSender && isRecipient ? "Transfer" : (isSender ? "System" : "Received");
                    const txId = tx.txHash || tx.signature || walletService.generateDemoTransactionId();
                    
                    return (
                      <TableRow key={tx.signature} className={theme === "dark" ? "border-gray-800" : ""}>
                        <TableCell className={`font-mono ${textColor}`}>
                          {txId.substring(0, 8) + "..."}
                        </TableCell>
                        <TableCell className={textColor}>{type}</TableCell>
                        <TableCell className={textColor}>
                          {tx.amount === 0 ? "-" : tx.amount.toString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {tx.status === "Confirmed" ? (
                              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                            ) : tx.status === "Blocked" ? (
                              <CircleX className="w-4 h-4 mr-1 text-red-500" />
                            ) : (
                              <Clock className="w-4 h-4 mr-1 text-yellow-500" />
                            )}
                            <span className={`text-sm ${
                              tx.status === "Confirmed" 
                                ? "text-green-500" 
                                : tx.status === "Blocked" 
                                  ? "text-red-500" 
                                  : "text-yellow-500"
                            }`}>
                              {tx.status || "Confirmed"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className={textMutedColor}>
                          {formatDate(tx.timestamp)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
