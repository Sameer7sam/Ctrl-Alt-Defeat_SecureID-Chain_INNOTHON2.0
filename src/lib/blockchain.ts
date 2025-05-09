
import { Wallet, Transaction, Block, TransactionResponse } from './types';
import { generateKeyPair, generateIdentityToken, signTransaction, verifySignature } from './cryptography';
import { sha256 } from 'crypto-hash';

class BlockchainSystem {
  private wallets: Map<string, Wallet> = new Map();
  private blockchain: Block[] = [];
  private pendingTransactions: Transaction[] = [];
  private transactionTimestamps: Map<string, number[]> = new Map();
  private currentUser: Wallet | null = null;

  constructor() {
    // Create genesis block
    this.createGenesisBlock();
  }

  private async createGenesisBlock(): Promise<void> {
    const genesisBlock: Block = {
      index: 0,
      transactions: [],
      previousHash: "0",
      timestamp: Date.now(),
      hash: await sha256("genesisBlock")
    };
    this.blockchain.push(genesisBlock);
    console.log("Genesis block created:", genesisBlock);
  }

  private async calculateBlockHash(block: Omit<Block, "hash">): Promise<string> {
    const blockString = JSON.stringify(block);
    return await sha256(blockString);
  }

  private async createNewBlock(): Promise<Block> {
    const previousBlock = this.blockchain[this.blockchain.length - 1];
    const newBlock: Omit<Block, "hash"> = {
      index: previousBlock.index + 1,
      transactions: [...this.pendingTransactions],
      previousHash: previousBlock.hash,
      timestamp: Date.now()
    };
    
    const blockHash = await this.calculateBlockHash(newBlock);
    const block: Block = {
      ...newBlock,
      hash: blockHash
    };
    
    this.blockchain.push(block);
    this.pendingTransactions = [];
    
    console.log("New block created:", block);
    return block;
  }

  public async registerIdentity(idNumber: string, selfie: string): Promise<TransactionResponse> {
    // Basic validation
    if (!idNumber.trim() || !selfie.trim()) {
      return {
        success: false,
        message: "Invalid ID or selfie. Both fields are required."
      };
    }
    
    // Create new wallet for the user
    const keyPair = await generateKeyPair();
    const wallet: Wallet = {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      identityToken: null
    };
    
    // Generate an identity token
    const identityToken = await generateIdentityToken(wallet.publicKey);
    wallet.identityToken = identityToken;
    
    // Store the wallet
    this.wallets.set(wallet.publicKey, wallet);
    this.currentUser = wallet;
    
    // Create an identity registration transaction
    const transaction: Transaction = {
      sender: wallet.publicKey,
      recipient: "system",
      amount: 0,
      identityToken: identityToken,
      timestamp: Date.now(),
      signature: await signTransaction(
        wallet.privateKey,
        wallet.publicKey,
        "system",
        0,
        identityToken
      )
    };
    
    // Add transaction to pending list
    this.pendingTransactions.push(transaction);
    
    // Create a new block with this transaction
    await this.createNewBlock();
    
    return {
      success: true,
      message: "Identity registered successfully!",
      data: {
        publicKey: wallet.publicKey,
        identityToken: wallet.identityToken
      }
    };
  }

  public async sendTransaction(recipient: string, amount: number): Promise<TransactionResponse> {
    if (!this.currentUser) {
      return {
        success: false,
        message: "You must register an identity before sending transactions."
      };
    }

    if (!this.wallets.has(this.currentUser.publicKey)) {
      return {
        success: false,
        message: "Sender not registered in the system."
      };
    }
    
    const sender = this.currentUser.publicKey;
    
    // Check if wallet has identity token
    const senderWallet = this.wallets.get(sender);
    if (!senderWallet || !senderWallet.identityToken) {
      return {
        success: false,
        message: "Sender doesn't have a verified identity."
      };
    }

    // Fraud detection logic
    if (this.isFraudulent(sender)) {
      return {
        success: false,
        message: "Too many transactions in a short time. Please try again later."
      };
    }
    
    // Record this transaction timestamp for fraud detection
    this.recordTransactionTimestamp(sender);
    
    // Create and sign the transaction
    const transaction: Transaction = {
      sender,
      recipient,
      amount,
      identityToken: senderWallet.identityToken,
      timestamp: Date.now(),
      signature: await signTransaction(
        senderWallet.privateKey,
        sender,
        recipient,
        amount,
        senderWallet.identityToken
      )
    };
    
    // Verify the signature (in a real system, nodes would do this validation)
    const isValid = await verifySignature(
      sender,
      transaction.signature,
      sender,
      recipient,
      amount,
      senderWallet.identityToken,
      transaction.timestamp
    );
    
    if (!isValid) {
      return {
        success: false,
        message: "Invalid transaction signature."
      };
    }
    
    // Add to pending transactions and create a new block
    this.pendingTransactions.push(transaction);
    await this.createNewBlock();
    
    return {
      success: true,
      message: "Transaction completed successfully!",
      data: {
        transactionId: transaction.signature.substring(0, 10),
        amount,
        recipient
      }
    };
  }

  private recordTransactionTimestamp(sender: string): void {
    const now = Date.now();
    const timestamps = this.transactionTimestamps.get(sender) || [];
    
    // Remove timestamps older than 60 seconds
    const recentTimestamps = timestamps.filter(ts => now - ts < 60000);
    recentTimestamps.push(now);
    
    this.transactionTimestamps.set(sender, recentTimestamps);
  }

  private isFraudulent(sender: string): boolean {
    const now = Date.now();
    const timestamps = this.transactionTimestamps.get(sender) || [];
    
    // Count transactions in the last 60 seconds
    const recentCount = timestamps.filter(ts => now - ts < 60000).length;
    
    // More than 3 transactions in 60 seconds is considered fraudulent
    return recentCount >= 3;
  }

  public getBlockchainInfo(): any {
    return {
      blocks: this.blockchain.length,
      latestBlock: this.blockchain[this.blockchain.length - 1],
      pendingTransactions: this.pendingTransactions.length,
      registeredUsers: this.wallets.size
    };
  }

  public getCurrentUser(): Wallet | null {
    return this.currentUser;
  }
}

// Export singleton instance
export const blockchainSystem = new BlockchainSystem();
