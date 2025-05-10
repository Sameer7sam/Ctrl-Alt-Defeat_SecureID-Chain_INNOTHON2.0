
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Wallet as WalletIcon, Globe, Loader2, ChevronDown, Shield } from "lucide-react";
import { blockchainSystem } from "@/lib/blockchain";
import { useTheme } from "@/components/ThemeProvider";
import { WalletConnection } from "@/lib/types";

const Wallet = () => {
  const { theme } = useTheme();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletConnection, setWalletConnection] = useState<WalletConnection | undefined>(undefined);
  const [isVerified, setIsVerified] = useState(false);
  
  // Check if wallet is already connected
  useEffect(() => {
    const connection = blockchainSystem.getWalletConnection();
    if (connection) {
      setWalletConnection(connection);
    }
    
    // Check if user is verified
    const verification = blockchainSystem.getVerification();
    setIsVerified(!!verification && verification.verified);
  }, []);
  
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate connecting to MetaMask
      setTimeout(async () => {
        try {
          const response = await blockchainSystem.connectWallet();
          
          if (response.success) {
            setWalletConnection(response.data as WalletConnection);
            toast.success("Wallet connected successfully!");
          } else {
            toast.error(response.message || "Failed to connect wallet");
          }
        } catch (error) {
          console.error("Error connecting wallet:", error);
          toast.error("An error occurred while connecting the wallet");
        } finally {
          setIsConnecting(false);
        }
      }, 1500); // Simulate connection delay
    } catch (error) {
      console.error("Error initiating wallet connection:", error);
      toast.error("Could not initiate wallet connection");
      setIsConnecting(false);
    }
  };
  
  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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
          Web3 Wallet
        </h1>
        <p className={textMutedColor}>
          Connect your wallet to the blockchain
        </p>
      </div>
      
      {/* Wallet Connection */}
      <Card className={cardBg}>
        <CardHeader>
          <CardTitle className={textColor}>
            <div className="flex items-center">
              <WalletIcon className="w-6 h-6 mr-2" />
              Wallet Connection
            </div>
          </CardTitle>
          <CardDescription className={textMutedColor}>
            Connect your Web3 wallet to the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          {walletConnection ? (
            <div>
              <div className={`p-4 rounded-md ${theme === "dark" ? "bg-green-900/30" : "bg-green-50"}`}>
                <div className="flex items-start">
                  <Shield className={theme === "dark" ? "text-green-400 w-5 h-5 mr-3" : "text-green-600 w-5 h-5 mr-3"} />
                  <div>
                    <p className={`font-medium ${theme === "dark" ? "text-green-400" : "text-green-800"}`}>
                      Wallet Connected
                    </p>
                    <p className={theme === "dark" ? "text-gray-300 mt-1" : "text-gray-700 mt-1"}>
                      Your wallet is successfully connected to the blockchain.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`mt-4 p-4 rounded-md border ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200"}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className={`text-sm ${textMutedColor}`}>Connected Wallet</div>
                    <div className={`font-medium ${textColor}`}>{formatAddress(walletConnection.address)}</div>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <span>{walletConnection.network}</span>
                    <ChevronDown className="ml-1 w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="text-sm flex justify-between">
                    <span className={textMutedColor}>Connected at</span>
                    <span className={textColor}>{formatDate(walletConnection.connectedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">
                  Disconnect
                </Button>
                <Button className={`w-full ${theme === "dark" ? "bg-purple-700 hover:bg-purple-800" : ""}`}>
                  Explore Assets
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <WalletIcon className={`w-16 h-16 mx-auto mb-4 ${theme === "dark" ? "text-purple-400" : "text-blue-500"}`} />
              <h3 className={`text-lg font-medium mb-2 ${textColor}`}>Connect Your Wallet</h3>
              <p className={`text-sm mb-6 max-w-md mx-auto ${textMutedColor}`}>
                Connect your Web3 wallet to interact with the blockchain and manage your identity NFTs and transactions.
              </p>
              
              <Button 
                onClick={handleConnectWallet} 
                disabled={isConnecting}
                className={`w-full max-w-xs ${theme === "dark" ? "bg-purple-700 hover:bg-purple-800" : ""}`}
              >
                {isConnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Blockchain Status */}
      <Card className={cardBg}>
        <CardHeader>
          <CardTitle className={textColor}>
            <div className="flex items-center">
              <Globe className="w-6 h-6 mr-2" />
              Blockchain Status
            </div>
          </CardTitle>
          <CardDescription className={textMutedColor}>
            Current blockchain network status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-md ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
                <div className={`text-sm ${textMutedColor}`}>Network</div>
                <div className={`font-medium ${textColor}`}>
                  {walletConnection ? walletConnection.network : "Not Connected"}
                </div>
              </div>
              
              <div className={`p-4 rounded-md ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
                <div className={`text-sm ${textMutedColor}`}>Status</div>
                <div className={`font-medium flex items-center ${walletConnection ? "text-green-500" : theme === "dark" ? "text-red-400" : "text-red-500"}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${walletConnection ? "bg-green-500" : "bg-red-500"}`}></span>
                  {walletConnection ? "Active" : "Disconnected"}
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-md ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
              <h3 className={`text-sm font-medium mb-3 ${textColor}`}>Network Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={textMutedColor}>Gas Price</span>
                  <span className={textColor}>32 Gwei</span>
                </div>
                <div className="flex justify-between">
                  <span className={textMutedColor}>Latest Block</span>
                  <span className={textColor}>15,402,349</span>
                </div>
                <div className="flex justify-between">
                  <span className={textMutedColor}>Confirmation Time</span>
                  <span className={textColor}>~15 seconds</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Identity Status */}
      <Card className={`${cardBg} ${theme === "dark" ? "border-purple-900/50" : "border-blue-100"}`}>
        <CardHeader className={theme === "dark" ? "bg-purple-900/20" : "bg-blue-50"}>
          <CardTitle className={textColor}>Identity Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={textColor}>Identity Verification</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${isVerified 
                ? "bg-green-100 text-green-800" 
                : "bg-yellow-100 text-yellow-800"}`}>
                {isVerified ? "Complete" : "Incomplete"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={textColor}>Web3 Wallet</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${walletConnection 
                ? "bg-green-100 text-green-800" 
                : "bg-yellow-100 text-yellow-800"}`}>
                {walletConnection ? "Connected" : "Not Connected"}
              </span>
            </div>
            
            <div className="mt-4">
              {!isVerified && (
                <Button 
                  asChild 
                  variant="outline" 
                  className="mt-2 w-full"
                >
                  <a href="/identity">Complete Identity Verification</a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;
