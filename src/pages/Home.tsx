
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { User, Award, CircleDollarSign, Wallet, Shield, CheckCircle, ArrowRight } from "lucide-react";
import { blockchainSystem } from "@/lib/blockchain";
import { useTheme } from "@/components/ThemeProvider";

const Home = () => {
  const { theme } = useTheme();
  const [isVerified, setIsVerified] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  
  useEffect(() => {
    // Check if user is verified
    const verification = blockchainSystem.getVerification();
    setIsVerified(!!verification && verification.verified);
    
    // Check if wallet is connected
    const connection = blockchainSystem.getWalletConnection();
    setHasWallet(!!connection);
  }, []);
  
  const cardBg = theme === "dark" ? "bg-gray-900 border-gray-800" : "";
  const textColor = theme === "dark" ? "text-white" : "";
  const textMutedColor = theme === "dark" ? "text-gray-400" : "text-gray-500";
  
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative">
        <div className={`absolute inset-0 rounded-xl opacity-20 ${theme === "dark" ? "bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900" : "bg-gradient-to-br from-blue-100 via-white to-blue-100"}`}></div>
        <div className={`relative p-8 md:p-12 rounded-xl ${theme === "dark" ? "bg-black/40 backdrop-blur-sm border border-purple-900/30" : "bg-white/80 backdrop-blur-sm border border-blue-100"}`}>
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <div>
              <Badge variant="outline" className={`mb-4 ${theme === "dark" ? "border-pink-700 text-pink-400" : "border-blue-200 text-blue-700"}`}>
                Blockchain Identity Verification
              </Badge>
              <h1 className={`text-4xl md:text-5xl font-bold leading-tight ${theme === "dark" ? "text-[#ED64A6]" : "text-blue-700"}`}>
                Secure Your Digital Identity on the Blockchain
              </h1>
              <p className={`mt-6 text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                SecureID-Chain provides a robust identity verification system with blockchain security, NFT minting, and fraud detection.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild size="lg" className={theme === "dark" ? "bg-purple-700 hover:bg-purple-800" : ""}>
                <Link to="/identity">Get Verified</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/wallet">Connect Wallet</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section>
        <h2 className={`text-2xl font-bold text-center mb-8 ${theme === "dark" ? "text-[#ED64A6]" : "text-blue-700"}`}>
          Core Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className={cardBg}>
            <CardHeader>
              <div className={`p-2 rounded-full w-12 h-12 flex items-center justify-center mb-3 ${theme === "dark" ? "bg-purple-900/30 text-purple-300" : "bg-blue-100 text-blue-800"}`}>
                <User className="w-6 h-6" />
              </div>
              <CardTitle className={textColor}>Identity Verification</CardTitle>
              <CardDescription className={textMutedColor}>
                Verify your identity with Aadhaar and photo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`mb-4 ${textMutedColor}`}>
                Securely verify your identity using Aadhaar details and photo verification.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/identity" className="flex items-center justify-center">
                  <span>Get Verified</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className={cardBg}>
            <CardHeader>
              <div className={`p-2 rounded-full w-12 h-12 flex items-center justify-center mb-3 ${theme === "dark" ? "bg-pink-900/30 text-pink-300" : "bg-blue-100 text-blue-800"}`}>
                <Award className="w-6 h-6" />
              </div>
              <CardTitle className={textColor}>NFT Minting</CardTitle>
              <CardDescription className={textMutedColor}>
                Mint your identity verification as an NFT
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`mb-4 ${textMutedColor}`}>
                Create a digital badge NFT that represents your verified identity on the blockchain.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/nft" className="flex items-center justify-center">
                  <span>Mint NFT</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className={cardBg}>
            <CardHeader>
              <div className={`p-2 rounded-full w-12 h-12 flex items-center justify-center mb-3 ${theme === "dark" ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"}`}>
                <CircleDollarSign className="w-6 h-6" />
              </div>
              <CardTitle className={textColor}>Transactions</CardTitle>
              <CardDescription className={textMutedColor}>
                Send and manage secure transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`mb-4 ${textMutedColor}`}>
                Send secure transactions with built-in fraud detection and blockchain security.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/transactions" className="flex items-center justify-center">
                  <span>Transact</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className={cardBg}>
            <CardHeader>
              <div className={`p-2 rounded-full w-12 h-12 flex items-center justify-center mb-3 ${theme === "dark" ? "bg-green-900/30 text-green-300" : "bg-blue-100 text-blue-800"}`}>
                <Wallet className="w-6 h-6" />
              </div>
              <CardTitle className={textColor}>Web3 Wallet</CardTitle>
              <CardDescription className={textMutedColor}>
                Connect your wallet to the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`mb-4 ${textMutedColor}`}>
                Connect your Web3 wallet to interact with the blockchain and manage your assets.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/wallet" className="flex items-center justify-center">
                  <span>Connect Wallet</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section>
        <h2 className={`text-2xl font-bold text-center mb-8 ${theme === "dark" ? "text-[#ED64A6]" : "text-blue-700"}`}>
          How It Works
        </h2>
        
        <Card className={cardBg}>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative flex flex-col items-center text-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold mb-4 ${theme === "dark" ? "bg-purple-900 text-white" : "bg-blue-100 text-blue-800"}`}>1</div>
                <h3 className={`text-lg font-medium mb-2 ${textColor}`}>Verify Your Identity</h3>
                <p className={textMutedColor}>Submit your Aadhaar details and a photo verification to establish your digital identity.</p>
                
                {/* Line connector (hidden on mobile) */}
                <div className="hidden md:block absolute top-6 left-full w-full h-0.5 -ml-4 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
              </div>
              
              <div className="relative flex flex-col items-center text-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold mb-4 ${theme === "dark" ? "bg-purple-900 text-white" : "bg-blue-100 text-blue-800"}`}>2</div>
                <h3 className={`text-lg font-medium mb-2 ${textColor}`}>Mint Your Identity NFT</h3>
                <p className={textMutedColor}>Create a tamper-proof digital badge that represents your verified identity on the blockchain.</p>
                
                {/* Line connector (hidden on mobile) */}
                <div className="hidden md:block absolute top-6 left-full w-full h-0.5 -ml-4 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold mb-4 ${theme === "dark" ? "bg-purple-900 text-white" : "bg-blue-100 text-blue-800"}`}>3</div>
                <h3 className={`text-lg font-medium mb-2 ${textColor}`}>Make Secure Transactions</h3>
                <p className={textMutedColor}>Send and receive transactions with built-in fraud detection and blockchain security.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Security Features */}
      <section>
        <h2 className={`text-2xl font-bold text-center mb-8 ${theme === "dark" ? "text-[#ED64A6]" : "text-blue-700"}`}>
          Security Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className={cardBg}>
            <CardHeader>
              <CardTitle className={`flex items-center ${textColor}`}>
                <Shield className="w-5 h-5 mr-2" />
                Fraud Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className={`space-y-3 ${textMutedColor}`}>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-500 shrink-0" />
                  <span>Real-time monitoring of transaction frequency</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-500 shrink-0" />
                  <span>Automatic blocking of suspicious activity</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-500 shrink-0" />
                  <span>Granular alerts and timeout mechanisms</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className={cardBg}>
            <CardHeader>
              <CardTitle className={`flex items-center ${textColor}`}>
                <Badge className="w-5 h-5 mr-2" />
                Blockchain Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className={`space-y-3 ${textMutedColor}`}>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-500 shrink-0" />
                  <span>Immutable transaction records</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-500 shrink-0" />
                  <span>Digital signatures verify transaction authenticity</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-500 shrink-0" />
                  <span>Cryptographic identity verification</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Call to Action */}
      <section>
        <Card className={`${theme === "dark" ? "bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-800" : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"}`}>
          <CardContent className="p-8 text-center">
            <h2 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-blue-800"}`}>
              Ready to Get Started?
            </h2>
            <p className={`mb-6 max-w-lg mx-auto ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Verify your identity, mint your NFT badge, and start making secure transactions today.
            </p>
            <Button asChild size="lg" className={theme === "dark" ? "bg-pink-700 hover:bg-pink-800" : ""}>
              <Link to="/identity">Get Verified Now</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Home;
