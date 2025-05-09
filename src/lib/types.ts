
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
