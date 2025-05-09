
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { blockchainSystem } from '@/lib/blockchain';

interface BlockchainInfo {
  blocks: number;
  latestBlock: {
    index: number;
    timestamp: number;
    hash: string;
  };
  pendingTransactions: number;
  registeredUsers: number;
}

export default function BlockchainStatus() {
  const [info, setInfo] = useState<BlockchainInfo | null>(null);
  const [currentUser, setCurrentUser] = useState<{ publicKey: string, identityToken: string | null } | null>(null);
  
  useEffect(() => {
    // Initial fetch
    updateInfo();
    
    // Update every 5 seconds
    const interval = setInterval(updateInfo, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const updateInfo = () => {
    const blockchainInfo = blockchainSystem.getBlockchainInfo();
    setInfo(blockchainInfo);
    
    const user = blockchainSystem.getCurrentUser();
    if (user) {
      setCurrentUser({
        publicKey: user.publicKey,
        identityToken: user.identityToken
      });
    }
  };
  
  if (!info) {
    return <div className="text-center p-4">Loading blockchain status...</div>;
  }
  
  return (
    <div className="space-y-4 w-full">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800">
          <CardTitle className="text-white">Blockchain Status</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="bg-blue-50 p-3 rounded-md text-center">
              <div className="text-sm text-gray-500">Blocks</div>
              <div className="font-bold text-xl">{info.blocks}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-md text-center">
              <div className="text-sm text-gray-500">Latest Block</div>
              <div className="font-bold text-xl">#{info.latestBlock.index}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-md text-center">
              <div className="text-sm text-gray-500">Pending Txs</div>
              <div className="font-bold text-xl">{info.pendingTransactions}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-md text-center">
              <div className="text-sm text-gray-500">Users</div>
              <div className="font-bold text-xl">{info.registeredUsers}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {currentUser && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-800">
            <CardTitle className="text-white">Your Wallet</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-500">Your Public Key</div>
                <div className="bg-gray-100 p-2 rounded-md overflow-x-auto text-xs font-mono">
                  {currentUser.publicKey}
                </div>
              </div>
              {currentUser.identityToken && (
                <div>
                  <div className="text-sm text-gray-500">Identity Token</div>
                  <div className="bg-gray-100 p-2 rounded-md overflow-x-auto text-xs font-mono">
                    {currentUser.identityToken}
                  </div>
                </div>
              )}
              <div className="bg-green-50 p-2 rounded-md border border-green-200">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm font-medium text-green-800">
                    {currentUser.identityToken ? "Identity Verified" : "Not Verified"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
