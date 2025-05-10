import { createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";

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
        gender: "male" | "female";
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
    status: "pending" | "completed" | "failed";
    signature: string;
}

interface StoredKeys {
    publicKey: string;
    privateKey: string;
    passwordHash: string;
    salt: string;
    createdAt: number;
}

class BackendService {
    private static instance: BackendService;
    private users: Map<string, UserData> = new Map();
    private transactions: Map<string, Transaction> = new Map();
    private walletPasswords: Map<string, string> = new Map();
    private keys: Map<string, StoredKeys> = new Map();
    private readonly STORAGE_KEY = "identity_chain_keys";

    private constructor() {
        this.loadFromStorage();
    }

    public static getInstance(): BackendService {
        if (!BackendService.instance) {
            BackendService.instance = new BackendService();
        }
        return BackendService.instance;
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.keys = new Map(Object.entries(parsed));
            }
        } catch (error) {
            console.error("Error loading keys from storage:", error);
            this.keys = new Map();
        }
    }

    private saveToStorage(): void {
        try {
            const obj = Object.fromEntries(this.keys);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
        } catch (error) {
            console.error("Error saving keys to storage:", error);
        }
    }

    private generateSalt(): string {
        return CryptoJS.lib.WordArray.random(128 / 8).toString();
    }

    private hashPassword(password: string, salt: string): string {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: 1000,
        }).toString();
    }

    public async storeKeys(
        publicKey: string,
        password: string,
        keys: { publicKey: string; privateKey: string }
    ): Promise<boolean> {
        try {
            const salt = this.generateSalt();
            const passwordHash = this.hashPassword(password, salt);

            const storedKeys: StoredKeys = {
                publicKey: keys.publicKey,
                privateKey: keys.privateKey,
                passwordHash,
                salt,
                createdAt: Date.now(),
            };

            this.keys.set(publicKey, storedKeys);
            this.saveToStorage();
            return true;
        } catch (error) {
            console.error("Error storing keys:", error);
            return false;
        }
    }

    public async verifyAndGetKeys(
        publicKey: string,
        password: string
    ): Promise<{ publicKey: string; privateKey: string } | null> {
        try {
            const storedKeys = this.keys.get(publicKey);
            if (!storedKeys) return null;

            const passwordHash = this.hashPassword(password, storedKeys.salt);
            if (passwordHash !== storedKeys.passwordHash) return null;

            return {
                publicKey: storedKeys.publicKey,
                privateKey: storedKeys.privateKey,
            };
        } catch (error) {
            console.error("Error verifying and getting keys:", error);
            return null;
        }
    }

    public async recoverKeys(
        publicKey: string,
        recoveryPhrase: string
    ): Promise<{ publicKey: string; privateKey: string } | null> {
        try {
            const storedKeys = this.keys.get(publicKey);
            if (!storedKeys) return null;

            // In a real implementation, you would verify the recovery phrase here
            // For now, we'll just return the keys if the public key exists
            return {
                publicKey: storedKeys.publicKey,
                privateKey: storedKeys.privateKey,
            };
        } catch (error) {
            console.error("Error recovering keys:", error);
            return null;
        }
    }

    public async deleteKeys(publicKey: string): Promise<boolean> {
        try {
            this.keys.delete(publicKey);
            this.saveToStorage();
            return true;
        } catch (error) {
            console.error("Error deleting keys:", error);
            return false;
        }
    }

    // User Management
    async createUser(
        publicKey: string,
        privateKeyPassword: string
    ): Promise<string> {
        const userId = uuidv4();
        const hashedPassword = this.hashPassword(
            privateKeyPassword,
            this.generateSalt()
        );

        this.users.set(userId, {
            id: userId,
            publicKey,
            privateKeyPassword: hashedPassword,
            photoVerification: {
                photo: "",
                verified: false,
                verifiedAt: 0,
            },
            aadhaarVerification: {
                aadhaarNumber: "",
                fullName: "",
                dateOfBirth: "",
                phoneNumber: "",
                gender: "male",
                verified: false,
                verifiedAt: 0,
            },
            transactions: [],
        });

        // Store wallet password
        this.walletPasswords.set(publicKey, privateKeyPassword);

        return userId;
    }

    async verifyPrivateKeyPassword(
        userId: string,
        password: string
    ): Promise<boolean> {
        const user = this.users.get(userId);
        if (!user) return false;

        const hashedPassword = this.hashPassword(password, this.generateSalt());
        return user.privateKeyPassword === hashedPassword;
    }

    // Photo Verification
    async savePhotoVerification(
        userId: string,
        photo: string
    ): Promise<boolean> {
        const user = this.users.get(userId);
        if (!user) return false;

        user.photoVerification = {
            photo,
            verified: true,
            verifiedAt: Date.now(),
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
        gender: "male" | "female"
    ): Promise<boolean> {
        const user = this.users.get(userId);
        if (!user) {
            // Create a new user if not exists
            const newUserId = await this.createUser(userId, "default-password");
            const newUser = this.users.get(newUserId);
            if (!newUser) return false;

            newUser.aadhaarVerification = {
                aadhaarNumber,
                fullName,
                dateOfBirth,
                phoneNumber,
                gender,
                verified: true,
                verifiedAt: Date.now(),
            };
            return true;
        }

        user.aadhaarVerification = {
            aadhaarNumber,
            fullName,
            dateOfBirth,
            phoneNumber,
            gender,
            verified: true,
            verifiedAt: Date.now(),
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
            status: "pending",
            signature,
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
        status: "completed" | "failed"
    ): Promise<boolean> {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) return false;

        transaction.status = status;
        return true;
    }

    // Wallet Password Management
    async storeWalletPassword(
        publicKey: string,
        password: string
    ): Promise<void> {
        this.walletPasswords.set(publicKey, password);
    }

    async getWalletPassword(publicKey: string): Promise<string | null> {
        return this.walletPasswords.get(publicKey) || null;
    }

    async recoverWalletPassword(
        publicKey: string,
        verificationData: {
            aadhaarNumber: string;
            fullName: string;
            dateOfBirth: string;
            phoneNumber: string;
        }
    ): Promise<string | null> {
        const user = this.users.get(publicKey);
        if (!user) return null;

        // Verify the user's identity using Aadhaar details
        const aadhaarVerification = user.aadhaarVerification;
        if (!aadhaarVerification.verified) return null;

        // Check if verification data matches
        if (
            aadhaarVerification.aadhaarNumber ===
                verificationData.aadhaarNumber &&
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

    // Verification Status
    async isFullyVerified(userId: string): Promise<boolean> {
        const user = this.users.get(userId);
        if (!user) return false;

        return (
            user.photoVerification.verified && user.aadhaarVerification.verified
        );
    }
}

export const backendService = BackendService.getInstance();
