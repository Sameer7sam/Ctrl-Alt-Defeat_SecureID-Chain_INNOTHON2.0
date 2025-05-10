import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { walletService } from "@/lib/walletService";
import { Eye, EyeOff, Key, Lock, Copy, Check, Shield } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { blockchainSystem } from "@/lib/blockchain";
import { backendService } from "@/lib/backend";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface KeyPair {
    publicKey: string;
    privateKey: string;
    encryptedKey: string;
}

const KeyManagement = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState<"public" | "private" | null>(
        null
    );

    // Generate key pair with password
    const handleGenerateKeys = async () => {
        if (!password) {
            toast.error("Please enter a password to protect your keys");
            return;
        }

        setIsGenerating(true);
        try {
            const currentUser = blockchainSystem.getCurrentUser();
            if (!currentUser) {
                const response = await blockchainSystem.registerIdentity(
                    "auto-id",
                    "auto-selfie"
                );
                if (!response.success) {
                    throw new Error("Failed to register identity");
                }
            }

            // Generate new keys
            const keys = await blockchainSystem.generateNewKeys();
            if (!keys) {
                throw new Error("Failed to generate keys");
            }

            // Save password to backend
            const saved = await backendService.saveKeyPassword(
                currentUser!.publicKey,
                password
            );
            if (!saved) {
                throw new Error("Failed to save key password");
            }

            // Set the key pair
            setKeyPair({
                publicKey: keys.publicKey,
                privateKey: keys.privateKey,
                encryptedKey: keys.privateKey, // For demo purposes, we're not actually encrypting
            });

            toast.success("Keys generated and password saved successfully!");
            setPassword("");
        } catch (error) {
            console.error("Error generating keys:", error);
            toast.error("Failed to generate keys");
        } finally {
            setIsGenerating(false);
        }
    };

    // Copy key to clipboard
    const copyToClipboard = (text: string, type: "public" | "private") => {
        navigator.clipboard.writeText(text).then(
            () => {
                setCopySuccess(type);
                setTimeout(() => setCopySuccess(null), 2000);
                toast.success(
                    `${
                        type === "public" ? "Public" : "Private"
                    } key copied to clipboard`
                );
            },
            () => {
                toast.error("Failed to copy key");
            }
        );
    };

    // Format key for display (truncate)
    const formatKey = (key: string): string => {
        if (!key) return "";
        return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
    };

    return (
        <>
            <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Identity Key Management
                    </CardTitle>
                    <CardDescription>
                        Generate and manage your secure identity keys for
                        blockchain transactions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!keyPair ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Key Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter password to protect your keys"
                                    className="bg-background/50"
                                    disabled={isGenerating}
                                />
                                <p className="text-xs text-muted-foreground">
                                    This password will be used to protect your
                                    private keys
                                </p>
                            </div>

                            <Button
                                onClick={handleGenerateKeys}
                                disabled={isGenerating || !password}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                {isGenerating ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                    </motion.div>
                                ) : (
                                    <Key className="mr-2 h-4 w-4" />
                                )}
                                {isGenerating
                                    ? "Generating Keys..."
                                    : "Generate New Keys"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-primary/5 p-3 rounded-md">
                                <Label className="text-sm text-muted-foreground">
                                    Public Key
                                </Label>
                                <div className="flex items-center mt-1">
                                    <code className="bg-black/20 p-2 rounded text-sm flex-1 overflow-x-auto">
                                        {keyPair.publicKey}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            copyToClipboard(
                                                keyPair.publicKey,
                                                "public"
                                            )
                                        }
                                        className="ml-2"
                                    >
                                        {copySuccess === "public" ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Button
                                    onClick={() => setIsDialogOpen(true)}
                                    variant="outline"
                                    className="w-full flex items-center gap-2 justify-center"
                                >
                                    <Eye className="h-4 w-4" />
                                    View Private Key
                                </Button>
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-md">
                                <div className="flex items-start gap-2">
                                    <Lock className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-medium text-yellow-500">
                                            Important Security Warning
                                        </p>
                                        <p className="mt-1 text-muted-foreground">
                                            This is the only time your private
                                            key will be shown. Make sure to save
                                            it in a secure location. If you lose
                                            this key, you will lose access to
                                            your identity and assets.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog for showing private key */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Your Private Key
                        </DialogTitle>
                        <DialogDescription>
                            This key gives full access to your digital identity.
                            Keep it secret and secure.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="bg-black/10 p-4 rounded-md relative">
                            <div
                                className={`absolute inset-0 backdrop-blur-md flex items-center justify-center ${
                                    showPrivateKey ? "hidden" : "block"
                                }`}
                            >
                                <Button
                                    onClick={() => setShowPrivateKey(true)}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Show Private Key
                                </Button>
                            </div>

                            {showPrivateKey && keyPair && (
                                <div className="break-all font-mono text-sm">
                                    {keyPair.privateKey}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setShowPrivateKey(!showPrivateKey)
                                }
                                className="flex items-center gap-2"
                            >
                                {showPrivateKey ? (
                                    <>
                                        <EyeOff className="h-4 w-4" />
                                        Hide Key
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-4 w-4" />
                                        Show Key
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={() =>
                                    keyPair &&
                                    copyToClipboard(
                                        keyPair.privateKey,
                                        "private"
                                    )
                                }
                                disabled={!showPrivateKey}
                                className="flex items-center gap-2"
                            >
                                {copySuccess === "private" ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-md mt-4">
                            <div className="text-sm text-center text-muted-foreground">
                                <p className="font-medium text-red-500">
                                    Warning!
                                </p>
                                <p>
                                    Never share this key with anyone or enter it
                                    on any website. Anyone with this key can
                                    access your identity and assets.
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default KeyManagement;
