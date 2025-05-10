
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
            <TabsTrigger value="mint">Mint NFT</TabsTrigger>
            <TabsTrigger value="collection">My Collection</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mint" className="space-y-6">
            <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg neo-glow">
              <CardHeader>
                <CardTitle>Mint a New Identity Badge</CardTitle>
                <CardDescription>
                  Create an NFT that verifies your identity on the blockchain. This badge can be used to prove your identity for transactions.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleMint}>
                <CardContent className="space-y-4">
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
                  
                  <div className="bg-primary/5 p-4 rounded-md">
                    <h4 className="text-sm font-medium">NFT Properties</h4>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• Valid for 7 days from minting</li>
                      <li>• Non-transferable identity verification</li>
                      <li>• Blockchain secured with unique hash</li>
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
                  >
                    <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg overflow-hidden">
                      <div className="aspect-square relative overflow-hidden">
                        <img 
                          src={nft.imageUrl} 
                          alt={nft.name} 
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                        <Badge 
                          className={`absolute top-2 right-2 ${
                            nft.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        >
                          {nft.status}
                        </Badge>
                      </div>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{nft.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{nft.description}</p>
                        <Separator className="my-2" />
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Created: {formatDate(nft.createdAt)}</p>
                          <p>Expires: {formatDate(nft.expiresAt)}</p>
                          <p className="truncate">ID: {nft.id}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="col-span-full p-8 text-center bg-card/60 backdrop-blur-md">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">No NFTs Found</h3>
                    <p className="text-muted-foreground">You haven't minted any identity NFTs yet.</p>
                    <Button 
                      onClick={() => setActiveTab('mint')}
                      variant="outline" 
                      className="mt-4"
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
