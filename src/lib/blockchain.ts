import {
    Wallet,
    Transaction,
    Block,
    TransactionResponse,
    NFT,
    IdentityVerification,
    WalletConnection,
} from "./types";
import {
    generateKeyPair,
    generateIdentityToken,
    signTransaction,
    verifySignature,
} from "./cryptography";
import CryptoJS from "crypto-js";

class BlockchainSystem {
    private wallets: Map<string, Wallet> = new Map();
    private blockchain: Block[] = [];
    private pendingTransactions: Transaction[] = [];
    private transactionTimestamps: Map<string, number[]> = new Map();
    private nfts: NFT[] = [];
    private identityVerifications: Map<string, IdentityVerification> =
        new Map();
    private walletConnections: Map<string, WalletConnection> = new Map();
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
            hash: CryptoJS.SHA256("genesisBlock").toString(),
        };
        this.blockchain.push(genesisBlock);
        console.log("Genesis block created:", genesisBlock);
    }

    private async calculateBlockHash(
        block: Omit<Block, "hash">
    ): Promise<string> {
        const blockString = JSON.stringify(block);
        return CryptoJS.SHA256(blockString).toString();
    }

    private async createNewBlock(): Promise<Block> {
        const previousBlock = this.blockchain[this.blockchain.length - 1];
        const newBlock: Omit<Block, "hash"> = {
            index: previousBlock.index + 1,
            transactions: [...this.pendingTransactions],
            previousHash: previousBlock.hash,
            timestamp: Date.now(),
        };

        const blockHash = await this.calculateBlockHash(newBlock);
        const block: Block = {
            ...newBlock,
            hash: blockHash,
        };

        this.blockchain.push(block);
        this.pendingTransactions = [];

        console.log("New block created:", block);
        return block;
    }

    public async registerIdentity(
        idNumber: string,
        selfie: string
    ): Promise<TransactionResponse> {
        // Basic validation
        if (!idNumber.trim() || !selfie.trim()) {
            return {
                success: false,
                message: "Invalid ID or selfie. Both fields are required.",
            };
        }

        // Create new wallet for the user
        const keyPair = await generateKeyPair();
        const wallet: Wallet = {
            publicKey: keyPair.publicKey,
            privateKey: keyPair.privateKey,
            identityToken: null,
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
            status: "Confirmed",
            txHash: await this.generateTxHash(),
            signature: await signTransaction(
                wallet.privateKey,
                wallet.publicKey,
                "system",
                0,
                identityToken
            ),
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
                identityToken: wallet.identityToken,
            },
        };
    }

    public async verifyAadhaar(
        aadhaarNumber: string,
        fullName: string,
        dateOfBirth: string,
        gender: string
    ): Promise<TransactionResponse> {
        if (!this.currentUser) {
            return {
                success: false,
                message: "You must register an identity first.",
            };
        }

        // Check Aadhaar format (simple 12-digit check)
        const aadhaarNumberClean = aadhaarNumber.replace(/[-\s]/g, "");
        if (!/^\d{12}$/.test(aadhaarNumberClean)) {
            return {
                success: false,
                message: "Invalid Aadhaar number. Must be 12 digits.",
            };
        }

        // Basic validation
        if (!fullName.trim() || !dateOfBirth.trim() || !gender.trim()) {
            return {
                success: false,
                message: "All fields are required.",
            };
        }

        // Store verification data
        const verification: IdentityVerification = {
            aadhaarNumber: aadhaarNumberClean,
            fullName,
            dateOfBirth,
            gender,
            verified: true,
            verifiedAt: Date.now(),
        };

        this.identityVerifications.set(
            this.currentUser.publicKey,
            verification
        );

        return {
            success: true,
            message: "Aadhaar verification successful!",
            data: {
                name: fullName,
                status: "Verified",
                timestamp: verification.verifiedAt,
            },
        };
    }

    public async savePhotoVerification(
        photoUrl: string
    ): Promise<TransactionResponse> {
        if (!this.currentUser) {
            return {
                success: false,
                message: "You must register an identity first.",
            };
        }

        // Get the existing verification or create a new one
        let verification = this.identityVerifications.get(
            this.currentUser.publicKey
        );
        if (!verification) {
            verification = {
                aadhaarNumber: "",
                fullName: "",
                dateOfBirth: "",
                gender: "",
                verified: false,
                photoUrl,
            };
        } else {
            verification.photoUrl = photoUrl;
        }

        // Set the verification in the map
        this.identityVerifications.set(
            this.currentUser.publicKey,
            verification
        );

        return {
            success: true,
            message: "Photo verification saved successfully!",
            data: {
                photoUrl,
            },
        };
    }

    public async mintNft(
        name: string,
        description: string
    ): Promise<TransactionResponse> {
        if (!this.currentUser) {
            return {
                success: false,
                message: "You must register an identity first.",
            };
        }

        const verification = this.identityVerifications.get(
            this.currentUser.publicKey
        );
        if (!verification || !verification.verified) {
            return {
                success: false,
                message: "You must complete identity verification first.",
            };
        }

        // Basic validation
        if (!name.trim() || !description.trim()) {
            return {
                success: false,
                message: "Name and description are required.",
            };
        }

        // Create NFT
        const id = await this.generateUUID();
        const now = Date.now();
        const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days from now

        const nft: NFT = {
            id,
            name,
            description,
            ownerPublicKey: this.currentUser.publicKey,
            createdAt: now,
            expiresAt,
            imageUrl: `https://www.gravatar.com/avatar/${await CryptoJS.SHA256(
                id
            ).toString()}?d=identicon&s=200`,
        };

        this.nfts.push(nft);

        // Create a transaction record for this mint
        const transaction: Transaction = {
            sender: this.currentUser.publicKey,
            recipient: "system",
            amount: 0,
            identityToken: this.currentUser.identityToken!,
            timestamp: now,
            signature: await signTransaction(
                this.currentUser.privateKey,
                this.currentUser.publicKey,
                "system",
                0,
                this.currentUser.identityToken!
            ),
            status: "Confirmed",
            txHash: await this.generateTxHash(),
        };

        this.pendingTransactions.push(transaction);
        await this.createNewBlock();

        return {
            success: true,
            message: "NFT minted successfully!",
            data: {
                nft,
                txHash: transaction.txHash,
            },
        };
    }

    public async connectWallet(address?: string): Promise<TransactionResponse> {
        // If address is provided, use it, otherwise generate one
        const walletAddress =
            address || `0x${await this.generateRandomHex(40)}`;
        const network = "Ethereum Mainnet";

        const connection: WalletConnection = {
            address: walletAddress,
            network,
            connected: true,
            connectedAt: Date.now(),
        };

        this.walletConnections.set(
            this.currentUser?.publicKey || "guest",
            connection
        );

        return {
            success: true,
            message: "Wallet connected successfully!",
            data: connection,
        };
    }

    public async sendTransaction(
        recipient: string,
        amount: number
    ): Promise<TransactionResponse> {
        if (!this.currentUser) {
            return {
                success: false,
                message:
                    "You must register an identity before sending transactions.",
            };
        }

        if (!this.wallets.has(this.currentUser.publicKey)) {
            return {
                success: false,
                message: "Sender not registered in the system.",
            };
        }

        const sender = this.currentUser.publicKey;

        // Check if wallet has identity token
        const senderWallet = this.wallets.get(sender);
        if (!senderWallet || !senderWallet.identityToken) {
            return {
                success: false,
                message: "Sender doesn't have a verified identity.",
            };
        }

        // Fraud detection logic
        if (this.isFraudulent(sender)) {
            const timeToWait = this.getTimeToWait(sender);
            return {
                success: false,
                message: `Too many transactions in a short time. Please try again in ${Math.ceil(
                    timeToWait / 1000
                )} seconds.`,
                data: {
                    timeToWait,
                },
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
            ),
            status: "Confirmed",
            txHash: await this.generateTxHash(),
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
                message: "Invalid transaction signature.",
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
                recipient,
                txHash: transaction.txHash,
            },
        };
    }

    private recordTransactionTimestamp(sender: string): void {
        const now = Date.now();
        const timestamps = this.transactionTimestamps.get(sender) || [];

        // Remove timestamps older than 60 seconds
        const recentTimestamps = timestamps.filter((ts) => now - ts < 60000);
        recentTimestamps.push(now);

        this.transactionTimestamps.set(sender, recentTimestamps);
    }

    private isFraudulent(sender: string): boolean {
        const now = Date.now();
        const timestamps = this.transactionTimestamps.get(sender) || [];

        // Count transactions in the last 60 seconds
        const recentCount = timestamps.filter((ts) => now - ts < 60000).length;

        // More than 3 transactions in 60 seconds is considered fraudulent
        return recentCount >= 3;
    }

    private getTimeToWait(sender: string): number {
        const now = Date.now();
        const timestamps = this.transactionTimestamps.get(sender) || [];

        if (timestamps.length === 0) return 0;

        // Get the oldest transaction timestamp within the last 60 seconds
        const oldestTimestamp = Math.min(
            ...timestamps.filter((ts) => now - ts < 60000)
        );

        // Return the time to wait in milliseconds
        return 60000 - (now - oldestTimestamp);
    }

    private async generateUUID(): Promise<string> {
        // Simple UUID v4 generation
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
                const r = (Math.random() * 16) | 0,
                    v = c == "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }
        );
    }

    private async generateRandomHex(length: number): Promise<string> {
        let result = "";
        const characters = "0123456789abcdef";
        for (let i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }
        return result;
    }

    private async generateTxHash(): Promise<string> {
        return await this.generateRandomHex(64);
    }

    public getBlockchainInfo(): any {
        return {
            blocks: this.blockchain.length,
            latestBlock: this.blockchain[this.blockchain.length - 1],
            pendingTransactions: this.pendingTransactions.length,
            registeredUsers: this.wallets.size,
        };
    }

    public getCurrentUser(): Wallet | null {
        return this.currentUser;
    }

    public getNFTs(publicKey?: string): NFT[] {
        const pk = publicKey || this.currentUser?.publicKey;
        if (!pk) return [];
        return this.nfts.filter((nft) => nft.ownerPublicKey === pk);
    }

    public getTransactions(publicKey?: string): Transaction[] {
        const pk = publicKey || this.currentUser?.publicKey;
        if (!pk) return [];

        return this.blockchain
            .flatMap((block) => block.transactions)
            .filter((tx) => tx.sender === pk || tx.recipient === pk)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    public getVerification(
        publicKey?: string
    ): IdentityVerification | undefined {
        const pk = publicKey || this.currentUser?.publicKey;
        if (!pk) return undefined;
        return this.identityVerifications.get(pk);
    }

    public getWalletConnection(
        publicKey?: string
    ): WalletConnection | undefined {
        const key = publicKey || this.currentUser?.publicKey;
        return key ? this.walletConnections.get(key) : undefined;
    }

    public async generateNewKeys(): Promise<{
        publicKey: string;
        privateKey: string;
    } | null> {
        try {
            const keyPair = await generateKeyPair();
            return {
                publicKey: keyPair.publicKey,
                privateKey: keyPair.privateKey,
            };
        } catch (error) {
            console.error("Error generating new keys:", error);
            return null;
        }
    }

    public async getUserKeys(): Promise<{
        publicKey: string;
        privateKey: string;
    } | null> {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return null;
            }

            return {
                publicKey: currentUser.publicKey,
                privateKey: currentUser.privateKey,
            };
        } catch (error) {
            console.error("Error getting user keys:", error);
            return null;
        }
    }
}

export const blockchainSystem = new BlockchainSystem();
