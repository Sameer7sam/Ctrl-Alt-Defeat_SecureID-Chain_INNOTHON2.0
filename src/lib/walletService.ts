
import { ethers } from "ethers";
import { WalletConnection } from "./types";
import { toast } from "sonner";
import { sha256 } from "crypto-hash";

declare global {
  interface Window {
    ethereum?: any;
  }
}

class WalletService {
  // Transaction monitoring for security
  private transactionCounter: Map<string, { count: number, lastReset: number }> = new Map();
  private readonly MAX_TRANSACTIONS_PER_MINUTE = 3;
  
  // Create a secure keystore with password protection
  public async generateSecureKeyPair(password: string): Promise<{ publicKey: string; privateKey: string; encryptedKey: string }> {
    // Create a wallet with a random private key
    const wallet = ethers.Wallet.createRandom();
    
    // Get public and private keys
    const privateKey = wallet.privateKey;
    const publicKey = wallet.address;
    
    // Encrypt the private key with the password
    const encryptedKey = await this.encryptKey(privateKey, password);
    
    return {
      publicKey,
      privateKey, // Only shown once to the user
      encryptedKey // This is what gets stored
    };
  }
  
  // Encrypt a private key with a password
  private async encryptKey(privateKey: string, password: string): Promise<string> {
    // In a production app, use a proper encryption library
    // For now, we'll just hash the combination which isn't secure but demonstrates the concept
    const salt = await sha256(Date.now().toString());
    return await sha256(privateKey + password + salt);
  }
  
  // Decrypt a private key with a password
  public async decryptKey(encryptedKey: string, password: string): Promise<string | null> {
    // This is a mock implementation since we're not actually encrypting
    // In a real app, this would decrypt the key using the password
    try {
      // Simulate checking password - in real app this would decrypt the key
      return "0x" + Array(64).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join('');
    } catch (error) {
      console.error("Failed to decrypt key:", error);
      return null;
    }
  }

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

  // Monitor transaction frequency (anti-fraud mechanism)
  public checkTransactionLimit(address: string): { allowed: boolean; timeToWait?: number } {
    const now = Date.now();
    const minute = 60 * 1000;
    
    // Get or initialize counter for this address
    if (!this.transactionCounter.has(address)) {
      this.transactionCounter.set(address, { count: 0, lastReset: now });
    }
    
    const tracker = this.transactionCounter.get(address)!;
    
    // Reset counter if a minute has passed
    if (now - tracker.lastReset > minute) {
      tracker.count = 0;
      tracker.lastReset = now;
    }
    
    // Check if transaction limit exceeded
    if (tracker.count >= this.MAX_TRANSACTIONS_PER_MINUTE) {
      // Calculate time to wait until next transaction allowed
      const timeToWait = (tracker.lastReset + minute) - now;
      return { allowed: false, timeToWait };
    }
    
    // Increment transaction count
    tracker.count++;
    return { allowed: true };
  }

  // Generate demo transaction IDs
  public generateDemoTransactionId(): string {
    // Format: 0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (42 chars)
    return "0x" + Array(40).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)).join('');
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
