
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { blockchainSystem } from '@/lib/blockchain';
import { toast } from 'sonner';
import { NFT } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { Award, Shield, Clock } from 'lucide-react';

const NFTMinting = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [activeTab, setActiveTab] = useState('mint');

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    try {
      // Get NFTs for the current user
      const userNfts = blockchainSystem.getNFTs();
      
      // Process NFTs to add status based on expiration
      const processedNfts = userNfts.map(nft => {
        const now = Date.now();
        // Explicitly type the status as "Active" | "Expired"
        const status = now < nft.expiresAt ? "Active" as const : "Expired" as const;
        return {
          ...nft,
          status
        };
      });
      
      setNfts(processedNfts);
    } catch (error) {
      console.error('Error loading NFTs:', error);
      toast.error('Failed to load NFTs');
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !description) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if user is registered first
      const currentUser = blockchainSystem.getCurrentUser();
      if (!currentUser) {
        // Register identity automatically if not registered
        await blockchainSystem.registerIdentity("auto-id", "auto-selfie");
        toast.success('Identity registered automatically');
      }
      
      const response = await blockchainSystem.mintNft(name, description);
      
      if (response.success) {
        toast.success('NFT minted successfully');
        setName('');
        setDescription('');
        loadNFTs();
        setActiveTab('collection');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-8 max-w-4xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-gradient animate-glow">NFT Minting</h1>
          <p className="text-muted-foreground">Create and manage your identity verification NFTs</p>
        </div>

        <Tabs defaultValue="mint" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="mint" className="data-[state=active]:bg-primary/20">
              <Award className="w-4 h-4 mr-2" /> Mint NFT
            </TabsTrigger>
            <TabsTrigger value="collection" className="data-[state=active]:bg-primary/20">
              <Shield className="w-4 h-4 mr-2" /> My Collection
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="mint" className="space-y-6">
            <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg neo-blur">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Mint a New Identity Badge</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Create an NFT that verifies your identity on the blockchain. This badge can be used to prove your identity for transactions.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleMint}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">NFT Name</label>
                    <Input
                      placeholder="e.g., My Identity Badge"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background/50 border-primary/30 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Describe your identity NFT..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="bg-background/50 border-primary/30 focus-visible:ring-primary resize-none"
                    />
                  </div>
                  
                  <div className="bg-primary/10 p-4 rounded-md">
                    <h4 className="text-sm font-medium flex items-center">
                      <Clock className="w-4 h-4 mr-2" /> NFT Properties
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                        Valid for 7 days from minting
                      </li>
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                        Non-transferable identity verification
                      </li>
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                        Blockchain secured with unique hash
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    {isLoading ? 'Minting...' : 'Mint NFT'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="collection" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nfts.length > 0 ? (
                nfts.map((nft) => (
                  <motion.div 
                    key={nft.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg neo-blur overflow-hidden h-full">
                      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-purple-900/30 to-pink-900/30">
                        <img 
                          src={nft.imageUrl} 
                          alt={nft.name} 
                          className="w-full h-full object-cover transition-transform hover:scale-105 mix-blend-luminosity opacity-90"
                        />
                        <Badge 
                          className={`absolute top-2 right-2 ${
                            nft.status === 'Active' 
                              ? 'bg-green-500/90 hover:bg-green-500' 
                              : 'bg-red-500/90 hover:bg-red-500'
                          }`}
                        >
                          {nft.status}
                        </Badge>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <h3 className="font-bold text-lg text-white truncate">{nft.name}</h3>
                        </div>
                      </div>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{nft.description}</p>
                        <Separator className="my-3 bg-primary/10" />
                        <div className="text-xs text-muted-foreground space-y-2">
                          <div className="flex items-center">
                            <Award className="w-3.5 h-3.5 mr-2 text-primary" />
                            <div className="flex justify-between w-full">
                              <span>Created:</span>
                              <span className="font-medium">{formatDate(nft.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-2 text-primary" />
                            <div className="flex justify-between w-full">
                              <span>Expires:</span>
                              <span className="font-medium">{formatDate(nft.expiresAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Shield className="w-3.5 h-3.5 mr-2 text-primary" />
                            <div className="flex justify-between w-full overflow-hidden">
                              <span>ID:</span>
                              <span className="font-medium truncate ml-1" title={nft.id}>
                                {nft.id.substring(0, 8)}...{nft.id.substring(nft.id.length - 4)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="col-span-full p-8 text-center bg-card/60 backdrop-blur-md border-primary/20 neo-blur">
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <Award className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mt-4">No NFTs Found</h3>
                    <p className="text-muted-foreground">You haven't minted any identity NFTs yet.</p>
                    <Button 
                      onClick={() => setActiveTab('mint')}
                      variant="outline" 
                      className="mt-4 border-primary/30 hover:bg-primary/10"
                    >
                      Mint Your First NFT
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default NFTMinting;
