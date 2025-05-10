import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

interface UserData {
  id: string;
  publicKey: string;
  privateKeyPassword: string;
  photoVerification: {
    photo: string;
    verified: boolean;
    verifiedAt: number;
  };
  aadhaarVerification: {
    aadhaarNumber: string;
    fullName: string;
    dateOfBirth: string;
    phoneNumber: string;
    gender: 'male' | 'female';
    verified: boolean;
    verifiedAt: number;
  };
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  sender: string;
  recipient: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  signature: string;
}

class BackendService {
  private users: Map<string, UserData> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private walletPasswords: Map<string, string> = new Map();

  // User Management
  async createUser(publicKey: string, privateKeyPassword: string): Promise<string> {
    const userId = uuidv4();
    const hashedPassword = this.hashPassword(privateKeyPassword);
    
    this.users.set(userId, {
      id: userId,
      publicKey,
      privateKeyPassword: hashedPassword,
      photoVerification: {
        photo: '',
        verified: false,
        verifiedAt: 0
      },
      aadhaarVerification: {
        aadhaarNumber: '',
        fullName: '',
        dateOfBirth: '',
        phoneNumber: '',
        gender: 'male',
        verified: false,
        verifiedAt: 0
      },
      transactions: []
    });

    // Store wallet password
    this.walletPasswords.set(publicKey, privateKeyPassword);

    return userId;
  }

  async verifyPrivateKeyPassword(userId: string, password: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;
    
    const hashedPassword = this.hashPassword(password);
    return user.privateKeyPassword === hashedPassword;
  }

  // Photo Verification
  async savePhotoVerification(userId: string, photo: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;

    user.photoVerification = {
      photo,
      verified: true,
      verifiedAt: Date.now()
    };

    return true;
  }

  async getPhotoVerificationStatus(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    return user?.photoVerification.verified || false;
  }

  // Aadhaar Verification
  async saveAadhaarVerification(
    userId: string,
    aadhaarNumber: string,
    fullName: string,
    dateOfBirth: string,
    phoneNumber: string,
    gender: 'male' | 'female'
  ): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;

    user.aadhaarVerification = {
      aadhaarNumber,
      fullName,
      dateOfBirth,
      phoneNumber,
      gender,
      verified: true,
      verifiedAt: Date.now()
    };

    return true;
  }

  async getAadhaarVerificationStatus(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    return user?.aadhaarVerification.verified || false;
  }

  // Transaction Management
  async createTransaction(
    senderId: string,
    recipientId: string,
    amount: number,
    signature: string
  ): Promise<string> {
    const transactionId = uuidv4();
    const transaction: Transaction = {
      id: transactionId,
      sender: senderId,
      recipient: recipientId,
      amount,
      timestamp: Date.now(),
      status: 'pending',
      signature
    };

    this.transactions.set(transactionId, transaction);
    
    const sender = this.users.get(senderId);
    if (sender) {
      sender.transactions.push(transaction);
    }

    return transactionId;
  }

  async getTransactionHistory(userId: string): Promise<Transaction[]> {
    const user = this.users.get(userId);
    return user?.transactions || [];
  }

  async updateTransactionStatus(
    transactionId: string,
    status: 'completed' | 'failed'
  ): Promise<boolean> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return false;

    transaction.status = status;
    return true;
  }

  // Wallet Password Management
  async storeWalletPassword(publicKey: string, password: string): Promise<void> {
    this.walletPasswords.set(publicKey, password);
  }

  async getWalletPassword(publicKey: string): Promise<string | null> {
    return this.walletPasswords.get(publicKey) || null;
  }

  async recoverWalletPassword(publicKey: string, verificationData: {
    aadhaarNumber: string;
    fullName: string;
    dateOfBirth: string;
    phoneNumber: string;
  }): Promise<string | null> {
    const user = this.users.get(publicKey);
    if (!user) return null;

    // Verify the user's identity using Aadhaar details
    const aadhaarVerification = user.aadhaarVerification;
    if (!aadhaarVerification.verified) return null;

    // Check if verification data matches
    if (
      aadhaarVerification.aadhaarNumber === verificationData.aadhaarNumber &&
      aadhaarVerification.fullName === verificationData.fullName &&
      aadhaarVerification.dateOfBirth === verificationData.dateOfBirth &&
      aadhaarVerification.phoneNumber === verificationData.phoneNumber
    ) {
      // Return the stored wallet password
      return this.walletPasswords.get(publicKey) || null;
    }

    return null;
  }

  // User Data Management
  async getUserData(publicKey: string): Promise<UserData | null> {
    for (const user of this.users.values()) {
      if (user.publicKey === publicKey) {
        return user;
      }
    }
    return null;
  }

  // Helper Methods
  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  // Verification Status
  async isFullyVerified(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;

    return user.photoVerification.verified && user.aadhaarVerification.verified;
  }
}

export const backendService = new BackendService(); 