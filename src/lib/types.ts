
export interface Wallet {
  publicKey: string;
  privateKey: string;
  identityToken: string | null;
}

export interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
  identityToken: string;
  timestamp: number;
  signature: string;
  status?: 'Confirmed' | 'Pending' | 'Blocked';
  txHash?: string;
}

export interface Block {
  index: number;
  transactions: Transaction[];
  previousHash: string;
  timestamp: number;
  hash: string;
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  ownerPublicKey: string;
  createdAt: number;
  expiresAt: number;
  imageUrl: string;
  status?: 'Active' | 'Expired';
  category?: string;
  traits?: Record<string, string>;
}

export interface IdentityVerification {
  aadhaarNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  verified: boolean;
  verifiedAt?: number;
  photoUrl?: string;
  phoneNumber?: string;
  address?: string;
}

export interface WalletConnection {
  address: string;
  network: string;
  connected: boolean;
  connectedAt: number;
  balance?: string;
}
