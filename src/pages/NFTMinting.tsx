
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Award, Loader2, Clock } from "lucide-react";
import { blockchainSystem } from "@/lib/blockchain";
import { useTheme } from "@/components/ThemeProvider";
import { NFT } from "@/lib/types";

const NFTMinting = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [myNfts, setMyNfts] = useState<NFT[]>([]);
  
  // Check if user is verified
  useEffect(() => {
    const verification = blockchainSystem.getVerification();
    setIsVerified(!!verification && verification.verified);
    
    // Get user's NFTs
    const nfts = blockchainSystem.getNFTs();
    setMyNfts(nfts);
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleMintNft = async () => {
    if (!formData.name || !formData.description) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await blockchainSystem.mintNft(formData.name, formData.description);
      
      if (response.success) {
        toast.success("NFT minted successfully!");
        setFormData({ name: "", description: "" });
        
        // Refresh NFTs list
        const updatedNfts = blockchainSystem.getNFTs();
        setMyNfts(updatedNfts);
      } else {
        toast.error(response.message || "Failed to mint NFT");
      }
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error("An error occurred while minting the NFT");
    } finally {
      setIsLoading(false);
    }
  };
  
  const isExpired = (expiresAt: number): boolean => {
    return Date.now() > expiresAt;
  };
  
  const formatTimeRemaining = (expiresAt: number): string => {
    const now = Date.now();
    
    if (now > expiresAt) {
      return "Expired";
    }
    
    const remainingMs = expiresAt - now;
    const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h remaining`;
  };
  
  const cardBg = theme === "dark" ? "bg-gray-900 border-gray-800" : "";
  const textColor = theme === "dark" ? "text-white" : "";
  const textMutedColor = theme === "dark" ? "text-gray-400" : "text-gray-500";
  
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-[#ED64A6]" : "text-blue-700"}`}>
          NFT Minting
        </h1>
        <p className={textMutedColor}>
          Mint your identity verification as an NFT badge with a 7-day expiration
        </p>
      </div>
      
      {/* NFT Minting Form */}
      <Card className={cardBg}>
        <CardHeader>
          <CardTitle className={textColor}>
            <div className="flex items-center">
              <Award className="w-6 h-6 mr-2" />
              Mint Legitimacy Badge NFT
            </div>
          </CardTitle>
          <CardDescription className={textMutedColor}>
            Create a digital badge NFT that proves your verified identity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isVerified ? (
            <div className={`p-4 rounded-md ${theme === "dark" ? "bg-yellow-900/30" : "bg-yellow-50"}`}>
              <p className={theme === "dark" ? "text-yellow-300" : "text-yellow-800"}>
                You need to complete identity verification before you can mint NFTs.
              </p>
              <Button 
                asChild 
                variant="outline" 
                className="mt-4"
              >
                <a href="/identity">Go to Identity Verification</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className={textColor}>NFT Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="My Identity Badge"
                  className={`mt-1 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : ""}`}
                />
              </div>
              
              <div>
                <Label htmlFor="description" className={textColor}>Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="This NFT represents my verified identity on SecureID-Chain"
                  className={`mt-1 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : ""}`}
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={handleMintNft} 
                disabled={isLoading || !formData.name || !formData.description}
                className={theme === "dark" ? "bg-purple-700 hover:bg-purple-800 w-full" : "w-full"}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? "Minting..." : "Mint NFT Badge"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* My NFTs */}
      <Card className={cardBg}>
        <CardHeader>
          <CardTitle className={textColor}>My NFT Badges</CardTitle>
          <CardDescription className={textMutedColor}>
            View all your minted identity badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myNfts.length === 0 ? (
            <div className="text-center py-10">
              <Award className={`w-12 h-12 mx-auto mb-3 ${textMutedColor}`} />
              <h3 className={`text-lg font-medium mb-1 ${textColor}`}>No NFTs Found</h3>
              <p className={textMutedColor}>
                You haven't minted any NFT badges yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myNfts.map((nft) => (
                <Card key={nft.id} className={`overflow-hidden ${theme === "dark" ? "bg-gray-800 border-gray-700" : ""}`}>
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={nft.imageUrl} 
                      alt={nft.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className={`text-lg font-medium mb-1 ${textColor}`}>{nft.name}</h3>
                    <p className={`text-sm mb-4 ${textMutedColor}`}>{nft.description}</p>
                    
                    <div className={`flex items-center justify-between py-2 px-3 rounded-md ${
                      isExpired(nft.expiresAt)
                        ? (theme === "dark" ? "bg-red-900/30 text-red-300" : "bg-red-50 text-red-800")
                        : (theme === "dark" ? "bg-green-900/30 text-green-300" : "bg-green-50 text-green-800")
                    }`}>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-xs font-medium">
                          {formatTimeRemaining(nft.expiresAt)}
                        </span>
                      </div>
                      
                      <div className="text-xs font-medium">
                        {isExpired(nft.expiresAt) ? "Expired" : "Active"}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        ID: {nft.id.substring(0, 8)}...
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(nft.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTMinting;
