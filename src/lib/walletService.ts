import { ethers } from "ethers";
import { WalletConnection } from "./types";
import { toast } from "sonner";
import CryptoJS from "crypto-js";

declare global {
    interface Window {
        ethereum?: any;
    }
}

class WalletService {
    // Transaction monitoring for security
    private transactionCounter: Map<
        string,
        { count: number; lastReset: number }
    > = new Map();
    private readonly MAX_TRANSACTIONS_PER_MINUTE = 3;

    // Local storage keys
    private readonly KEY_WALLET_CONNECTION = "walletConnection";
    private readonly KEY_PUBLIC_KEY = "securePublicKey";
    private readonly KEY_ENCRYPTED_KEY = "secureEncryptedKey";
    private readonly KEY_DID_IDENTIFIER = "secureDidIdentifier";

    // Create a secure keystore with password protection
    public async generateSecureKeyPair(
        password: string
    ): Promise<{
        publicKey: string;
        privateKey: string;
        encryptedKey: string;
        didIdentifier: string;
    } | null> {
        // Check if keys already exist
        if (this.hasGeneratedKeys()) {
            toast.error(
                "Keys have already been generated. Each wallet can only generate one set of keys."
            );
            return null;
        }

        // Create a wallet with a random private key
        const wallet = ethers.Wallet.createRandom();

        // Get public and private keys
        const privateKey = wallet.privateKey;
        const publicKey = wallet.address;

        // Generate DID identifier (Decentralized Identifier)
        // Format: did:ethr:{networknamespace}:{address}
        const didIdentifier = `did:ethr:main:${publicKey}`;

        // Encrypt the private key with the password
        const encryptedKey = await this.encryptKey(privateKey, password);

        // Store keys in localStorage
        localStorage.setItem(this.KEY_PUBLIC_KEY, publicKey);
        localStorage.setItem(this.KEY_ENCRYPTED_KEY, encryptedKey);
        localStorage.setItem(this.KEY_DID_IDENTIFIER, didIdentifier);

        return {
            publicKey,
            privateKey, // Only shown once to the user
            encryptedKey, // This is what gets stored
            didIdentifier,
        };
    }

    // Check if keys have been generated before
    public hasGeneratedKeys(): boolean {
        return (
            !!localStorage.getItem(this.KEY_PUBLIC_KEY) &&
            !!localStorage.getItem(this.KEY_ENCRYPTED_KEY)
        );
    }

    // Get the stored public key
    public getPublicKey(): string | null {
        return localStorage.getItem(this.KEY_PUBLIC_KEY);
    }

    // Get the stored DID identifier
    public getDidIdentifier(): string | null {
        return localStorage.getItem(this.KEY_DID_IDENTIFIER);
    }

    // Get the encrypted private key
    public getEncryptedKey(): string | null {
        return localStorage.getItem(this.KEY_ENCRYPTED_KEY);
    }

    // Encrypt a private key with a password
    private async encryptKey(
        privateKey: string,
        password: string
    ): Promise<string> {
        const salt = CryptoJS.lib.WordArray.random(128 / 8);
        const key = CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: 1000,
        });

        const iv = CryptoJS.lib.WordArray.random(128 / 8);
        const encrypted = CryptoJS.AES.encrypt(privateKey, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC,
        });

        // Combine salt, iv, and encrypted data
        const result = salt.toString() + iv.toString() + encrypted.toString();
        return result;
    }

    // Decrypt a private key with a password
    public async decryptKey(password: string): Promise<string | null> {
        const encryptedKey = this.getEncryptedKey();
        if (!encryptedKey) return null;

        try {
            // Extract salt, iv, and encrypted data
            const salt = CryptoJS.enc.Hex.parse(encryptedKey.substr(0, 32));
            const iv = CryptoJS.enc.Hex.parse(encryptedKey.substr(32, 32));
            const encrypted = encryptedKey.substring(64);

            // Derive key using PBKDF2
            const key = CryptoJS.PBKDF2(password, salt, {
                keySize: 256 / 32,
                iterations: 1000,
            });

            // Decrypt
            const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
                iv: iv,
                padding: CryptoJS.pad.Pkcs7,
                mode: CryptoJS.mode.CBC,
            });

            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error("Failed to decrypt key:", error);
            toast.error("Incorrect password");
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
    public async connectWallet(): Promise<{
        success: boolean;
        message: string;
        data?: WalletConnection;
    }> {
        try {
            // Check if MetaMask is installed
            if (!window.ethereum) {
                return {
                    success: false,
                    message:
                        "MetaMask is not installed. Please install MetaMask to connect your wallet.",
                };
            }

            try {
                // Request accounts access
                const provider = new ethers.BrowserProvider(window.ethereum);
                await window.ethereum.request({
                    method: "eth_requestAccounts",
                });

                // Get account and network information
                const accounts = await provider.listAccounts();
                const address = await accounts[0].getAddress();
                const network = await provider.getNetwork();
                const balance = await provider.getBalance(address);
                const etherBalance = ethers.formatEther(balance);

                // Create wallet connection object
                const walletConnection: WalletConnection = {
                    address,
                    network: this.formatNetworkName(
                        network.name,
                        Number(network.chainId)
                    ),
                    connected: true,
                    connectedAt: Date.now(),
                    balance: etherBalance,
                };

                // Save connection to localStorage
                localStorage.setItem(
                    this.KEY_WALLET_CONNECTION,
                    JSON.stringify(walletConnection)
                );

                return {
                    success: true,
                    message: "Wallet connected successfully!",
                    data: walletConnection,
                };
            } catch (error: any) {
                // MetaMask error handling
                if (error.code === 4001) {
                    // User rejected the connection
                    return {
                        success: false,
                        message:
                            "Connection rejected. Please approve the connection request in MetaMask.",
                    };
                }
                throw error;
            }
        } catch (error: any) {
            console.error("Error connecting wallet:", error);
            return {
                success: false,
                message: error.message || "Failed to connect wallet",
            };
        }
    }

    // Disconnect wallet
    public async disconnectWallet(): Promise<{
        success: boolean;
        message: string;
    }> {
        try {
            // Remove from localStorage
            localStorage.removeItem(this.KEY_WALLET_CONNECTION);

            return {
                success: true,
                message: "Wallet disconnected successfully!",
            };
        } catch (error) {
            console.error("Error disconnecting wallet:", error);
            return {
                success: false,
                message: "Failed to disconnect wallet",
            };
        }
    }

    // Get saved wallet connection
    public getWalletConnection(): WalletConnection | undefined {
        try {
            const savedConnection = localStorage.getItem(
                this.KEY_WALLET_CONNECTION
            );
            if (savedConnection) {
                const connection = JSON.parse(
                    savedConnection
                ) as WalletConnection;
                return connection;
            }
            return undefined;
        } catch (error) {
            console.error("Error retrieving wallet connection:", error);
            return undefined;
        }
    }

    // Get current network gas information
    public async getNetworkInfo(): Promise<{
        gasPrice: string;
        latestBlock: number;
    } | null> {
        try {
            if (!window.ethereum) return null;

            const provider = new ethers.BrowserProvider(window.ethereum);
            const gasPrice = await provider.getGasPrice();
            const formattedGasPrice = `${Math.round(
                Number(ethers.formatUnits(gasPrice, "gwei"))
            )} Gwei`;

            // Get latest block number
            const blockNumber = await provider.getBlockNumber();

            return {
                gasPrice: formattedGasPrice,
                latestBlock: blockNumber,
            };
        } catch (error) {
            console.error("Error getting network info:", error);
            return null;
        }
    }

    // Sign a message using the connected wallet
    public async signMessage(
        message: string
    ): Promise<{ success: boolean; signature?: string; message: string }> {
        try {
            if (!window.ethereum) {
                return {
                    success: false,
                    message: "MetaMask is not installed",
                };
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const signature = await signer.signMessage(message);

            return {
                success: true,
                signature,
                message: "Message signed successfully!",
            };
        } catch (error: any) {
            console.error("Error signing message:", error);
            return {
                success: false,
                message: error.message || "Failed to sign message",
            };
        }
    }

    // Monitor transaction frequency (anti-fraud mechanism)
    public checkTransactionLimit(address: string): {
        allowed: boolean;
        timeToWait?: number;
    } {
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
            const timeToWait = tracker.lastReset + minute - now;
            return { allowed: false, timeToWait };
        }

        // Increment transaction count
        tracker.count++;
        return { allowed: true };
    }

    // Generate demo transaction IDs
    public generateDemoTransactionId(): string {
        // Format: 0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (42 chars)
        return (
            "0x" +
            Array(40)
                .fill(0)
                .map(() => Math.floor(Math.random() * 16).toString(16))
                .join("")
        );
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
