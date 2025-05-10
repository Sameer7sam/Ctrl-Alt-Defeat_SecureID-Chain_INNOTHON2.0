
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Award, Loader2, Clock, AlertTriangle, Zap, Tag, FileCheck, RefreshCw } from "lucide-react";
import { blockchainSystem } from "@/lib/blockchain";
import { useTheme } from "@/components/ThemeProvider";
import { NFT } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NFTMinting = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("create");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "identity"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [myNfts, setMyNfts] = useState<NFT[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // NFT categories
  const nftCategories = [
    { value: "identity", label: "Identity Badge" },
    { value: "access", label: "Access Pass" },
    { value: "credential", label: "Digital Credential" }
  ];
  
  // Check if user is verified
  useEffect(() => {
    const verification = blockchainSystem.getVerification();
    setIsVerified(!!verification && verification.verified);
    
    // Get user's NFTs
    refreshNFTs();
  }, []);
  
  const refreshNFTs = () => {
    setRefreshing(true);
    const nfts = blockchainSystem.getNFTs();
    
    // Add status based on expiration
    const processedNfts = nfts.map(nft => ({
      ...nft,
      status: Date.now() > nft.expiresAt ? 'Expired' : 'Active'
    }));
    
    setMyNfts(processedNfts);
    setRefreshing(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleMintNft = async () => {
    if (!formData.name || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await blockchainSystem.mintNft(formData.name, formData.description);
      
      if (response.success) {
        toast.success("NFT minted successfully!", {
          description: `Your NFT badge will be valid for 7 days`
        });
        setFormData({ name: "", description: "", category: "identity" });
        setActiveTab("collection");
        
        // Refresh NFTs list
        refreshNFTs();
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
  
  const getNftCategoryLabel = (categoryValue: string): string => {
    const category = nftCategories.find(cat => cat.value === categoryValue);
    return category ? category.label : "Identity Badge";
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
      
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="create">Create NFT</TabsTrigger>
          <TabsTrigger value="collection">My Collection</TabsTrigger>
        </TabsList>
        
        {/* Create NFT Tab */}
        <TabsContent value="create">
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
                  <div className="flex items-start">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${theme === "dark" ? "text-yellow-300" : "text-yellow-600"}`} />
                    <div className="ml-3">
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
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`p-4 rounded-md ${theme === "dark" ? "bg-green-900/30" : "bg-green-50"}`}>
                    <div className="flex items-start">
                      <FileCheck className={`w-5 h-5 mt-0.5 ${theme === "dark" ? "text-green-300" : "text-green-600"}`} />
                      <div className="ml-3">
                        <p className={theme === "dark" ? "text-green-300" : "text-green-800"}>
                          Your identity is verified. You can now mint an NFT badge.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="category" className={textColor}>NFT Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
                    >
                      <SelectTrigger className={`w-full mt-1 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : ""}`}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {nftCategories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="name" className={textColor}>NFT Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="My Identity Badge"
                      className={`mt-1 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : ""}`}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className={textColor}>Description <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="This NFT represents my verified identity on SecureID-Chain"
                      className={`mt-1 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : ""}`}
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className={`p-4 rounded-md ${theme === "dark" ? "bg-blue-900/30" : "bg-blue-50"}`}>
                    <div className="flex items-start">
                      <Zap className={`w-5 h-5 mt-0.5 ${theme === "dark" ? "text-blue-300" : "text-blue-600"}`} />
                      <div className="ml-3">
                        <h3 className={`text-sm font-medium ${theme === "dark" ? "text-blue-300" : "text-blue-800"}`}>
                          NFT Badge Details
                        </h3>
                        <div className={`mt-2 text-sm space-y-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          <p>• All NFT badges are valid for 7 days after creation</p>
                          <p>• The badge will be associated with your verified identity</p>
                          <p>• You can mint multiple badges for different purposes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleMintNft} 
                    disabled={isLoading || !formData.name || !formData.description}
                    className={`w-full ${theme === "dark" ? "bg-purple-700 hover:bg-purple-800" : ""}`}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isLoading ? "Minting..." : "Mint NFT Badge"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* My Collection Tab */}
        <TabsContent value="collection">
          <Card className={cardBg}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className={textColor}>My NFT Badges</CardTitle>
                <CardDescription className={textMutedColor}>
                  View all your minted identity badges
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshNFTs}
                disabled={refreshing}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {myNfts.length === 0 ? (
                <div className="text-center py-10">
                  <Award className={`w-12 h-12 mx-auto mb-3 ${textMutedColor}`} />
                  <h3 className={`text-lg font-medium mb-1 ${textColor}`}>No NFTs Found</h3>
                  <p className={textMutedColor}>
                    You haven't minted any NFT badges yet.
                  </p>
                  <Button 
                    onClick={() => setActiveTab("create")} 
                    variant="outline" 
                    className="mt-4"
                  >
                    Create Your First NFT
                  </Button>
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
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`text-lg font-medium ${textColor}`}>{nft.name}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isExpired(nft.expiresAt)
                              ? (theme === "dark" ? "bg-red-900/60 text-red-300" : "bg-red-100 text-red-800")
                              : (theme === "dark" ? "bg-green-900/60 text-green-300" : "bg-green-100 text-green-800")
                          }`}>
                            {isExpired(nft.expiresAt) ? "Expired" : "Active"}
                          </span>
                        </div>
                        
                        <div className="flex items-center mb-3">
                          <Tag className={`w-3.5 h-3.5 mr-1 ${textMutedColor}`} />
                          <span className={`text-xs ${textMutedColor}`}>
                            {nft.category ? getNftCategoryLabel(nft.category) : "Identity Badge"}
                          </span>
                        </div>
                        
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
            
            <CardFooter className={`bg-opacity-50 ${theme === "dark" ? "bg-purple-900/20" : "bg-purple-50"} mt-4`}>
              <div className="w-full text-center">
                <p className={`text-sm ${textMutedColor} mb-2`}>
                  Want to create more NFTs based on your verified identity?
                </p>
                <Button 
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setActiveTab("create")}
                  className={theme === "dark" ? "bg-purple-700 hover:bg-purple-800" : ""}
                >
                  Mint a New NFT Badge
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NFTMinting;
