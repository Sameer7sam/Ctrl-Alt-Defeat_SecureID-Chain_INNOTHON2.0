
import { ethers } from "ethers";
import { WalletConnection } from "./types";
import { toast } from "sonner";

declare global {
  interface Window {
    ethereum?: any;
  }
}

class WalletService {
  // Check if wallet is connected
  public async isWalletConnected(): Promise<boolean> {
    try {
      if (!window.ethereum) return false;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      return accounts.length > 0;
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      return false;
    }
  }

  // Connect to MetaMask wallet
  public async connectWallet(): Promise<{ success: boolean; message: string; data?: WalletConnection }> {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        return {
          success: false,
          message: "MetaMask is not installed. Please install MetaMask to connect your wallet."
        };
      }

      try {
        // Request accounts access
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Get account and network information
        const accounts = await provider.listAccounts();
        const address = await accounts[0].getAddress();
        const network = await provider.getNetwork();
        
        // Create wallet connection object
        const walletConnection: WalletConnection = {
          address,
          network: this.formatNetworkName(network.name, Number(network.chainId)),
          connected: true,
          connectedAt: Date.now()
        };

        // Save connection to localStorage
        localStorage.setItem('walletConnection', JSON.stringify(walletConnection));
        
        return {
          success: true,
          message: "Wallet connected successfully!",
          data: walletConnection
        };
      } catch (error: any) {
        // MetaMask error handling
        if (error.code === 4001) {
          // User rejected the connection
          return {
            success: false,
            message: "Connection rejected. Please approve the connection request in MetaMask."
          };
        }
        throw error;
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      return {
        success: false,
        message: error.message || "Failed to connect wallet"
      };
    }
  }

  // Disconnect wallet
  public async disconnectWallet(): Promise<{ success: boolean; message: string }> {
    try {
      // Remove from localStorage
      localStorage.removeItem('walletConnection');
      
      return {
        success: true,
        message: "Wallet disconnected successfully!"
      };
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      return {
        success: false,
        message: "Failed to disconnect wallet"
      };
    }
  }

  // Get saved wallet connection
  public getWalletConnection(): WalletConnection | undefined {
    try {
      const savedConnection = localStorage.getItem('walletConnection');
      if (savedConnection) {
        const connection = JSON.parse(savedConnection) as WalletConnection;
        return connection;
      }
      return undefined;
    } catch (error) {
      console.error("Error retrieving wallet connection:", error);
      return undefined;
    }
  }

  // Sign a message using the connected wallet
  public async signMessage(message: string): Promise<{ success: boolean; signature?: string; message: string }> {
    try {
      if (!window.ethereum) {
        return {
          success: false,
          message: "MetaMask is not installed"
        };
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const signature = await signer.signMessage(message);
      
      return {
        success: true,
        signature,
        message: "Message signed successfully!"
      };
    } catch (error: any) {
      console.error("Error signing message:", error);
      return {
        success: false,
        message: error.message || "Failed to sign message"
      };
    }
  }

  // Format network name for better display
  private formatNetworkName(name: string, chainId: number): string {
    if (name === "homestead") return "Ethereum Mainnet";
    if (chainId === 11155111) return "Sepolia";
    if (chainId === 80001) return "Polygon Mumbai";
    if (chainId === 137) return "Polygon Mainnet";
    if (chainId === 42161) return "Arbitrum One";
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}

export const walletService = new WalletService();
