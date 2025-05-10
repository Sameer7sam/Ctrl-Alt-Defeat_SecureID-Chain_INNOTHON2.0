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
import { Alert, AlertDescription } from "@/components/ui/alert";

const KeyManagement: React.FC = () => {
    const [password, setPassword] = useState("");
    const [keys, setKeys] = useState<{
        publicKey: string;
        privateKey: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<"public" | "private" | null>(null);
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateKeys = async () => {
        try {
            setError(null);
            setIsGenerating(true);

            if (!password) {
                setError("Please enter a password to protect your keys");
                return;
            }

            const currentUser = blockchainSystem.getCurrentUser();
            if (!currentUser) {
                setError("No user found. Please connect your wallet first.");
                return;
            }

            const newKeys = await blockchainSystem.generateNewKeys();
            if (!newKeys) {
                setError("Failed to generate keys");
                return;
            }

            const success = await backendService.storeKeys(
                currentUser.publicKey,
                password,
                newKeys
            );

            if (!success) {
                setError("Failed to store keys");
                return;
            }

            setKeys(newKeys);
            toast.success("Keys generated and stored successfully!");
        } catch (error) {
            console.error("Error generating keys:", error);
            setError("Failed to generate keys. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async (
        text: string,
        type: "public" | "private"
    ) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
            toast.success(
                `${
                    type === "public" ? "Public" : "Private"
                } key copied to clipboard`
            );
        } catch (error) {
            console.error("Error copying to clipboard:", error);
            setError("Failed to copy to clipboard");
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Generate New Identity Keys</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium"
                        >
                            Set Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter a password to protect your keys"
                        />
                    </div>

                    <Button
                        onClick={handleGenerateKeys}
                        className="w-full"
                        disabled={isGenerating}
                    >
                        {isGenerating ? "Generating..." : "Generate Keys"}
                    </Button>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {keys && (
                        <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Public Key
                                </label>
                                <div className="relative">
                                    <Input
                                        value={keys.publicKey}
                                        readOnly
                                        className="pr-10"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                        onClick={() =>
                                            copyToClipboard(
                                                keys.publicKey,
                                                "public"
                                            )
                                        }
                                    >
                                        {copied === "public" ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Private Key
                                </label>
                                <div className="relative">
                                    <Input
                                        type={
                                            showPrivateKey ? "text" : "password"
                                        }
                                        value={keys.privateKey}
                                        readOnly
                                        className="pr-20"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setShowPrivateKey(
                                                    !showPrivateKey
                                                )
                                            }
                                        >
                                            {showPrivateKey ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                copyToClipboard(
                                                    keys.privateKey,
                                                    "private"
                                                )
                                            }
                                        >
                                            {copied === "private" ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default KeyManagement;
