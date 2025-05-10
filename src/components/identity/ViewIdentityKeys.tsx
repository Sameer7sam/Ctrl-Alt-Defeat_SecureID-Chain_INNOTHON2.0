import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { blockchainSystem } from "@/lib/blockchain";
import { backendService } from "@/lib/backend";
import { motion } from "framer-motion";
import { Key, Eye, EyeOff, Copy, Check, RefreshCw } from "lucide-react";

const ViewIdentityKeys = () => {
    const [password, setPassword] = useState("");
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [keys, setKeys] = useState<{
        publicKey: string;
        privateKey: string;
    } | null>(null);
    const [copySuccess, setCopySuccess] = useState<"public" | "private" | null>(
        null
    );

    const handleViewKeys = async () => {
        if (!password) {
            toast.error("Please enter your key password");
            return;
        }

        setIsLoading(true);
        try {
            const currentUser = blockchainSystem.getCurrentUser();
            if (!currentUser) {
                throw new Error("No user found");
            }

            // Verify password from backend
            const storedPassword = await backendService.getKeyPassword(
                currentUser.publicKey
            );
            if (!storedPassword || storedPassword !== password) {
                throw new Error("Invalid password");
            }

            // Get keys from blockchain system
            const userKeys = await blockchainSystem.getUserKeys();
            if (!userKeys) {
                throw new Error("No keys found");
            }

            setKeys(userKeys);
            toast.success("Keys retrieved successfully");
        } catch (error) {
            console.error("Error viewing keys:", error);
            toast.error(
                error instanceof Error ? error.message : "Failed to view keys"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (
        text: string,
        type: "public" | "private"
    ) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(type);
            setTimeout(() => setCopySuccess(null), 2000);
            toast.success(
                `${
                    type === "public" ? "Public" : "Private"
                } key copied to clipboard`
            );
        } catch (error) {
            toast.error("Failed to copy key");
        }
    };

    return (
        <Card className="bg-card/60 backdrop-blur-md border-primary/20 shadow-lg">
            <CardHeader>
                <CardTitle>View Your Keys</CardTitle>
                <CardDescription>
                    Enter your key password to view your public and private keys
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {!keys ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="viewPassword">
                                    Key Password
                                </Label>
                                <Input
                                    id="viewPassword"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter your key password"
                                    className="bg-background/50"
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                onClick={handleViewKeys}
                                disabled={isLoading || !password}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                {isLoading ? (
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
                                {isLoading ? "Loading Keys..." : "View Keys"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Public Key</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={keys.publicKey}
                                        readOnly
                                        className="bg-background/50 font-mono text-sm"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            copyToClipboard(
                                                keys.publicKey,
                                                "public"
                                            )
                                        }
                                    >
                                        {copySuccess === "public" ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Private Key</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type={
                                            showPrivateKey ? "text" : "password"
                                        }
                                        value={keys.privateKey}
                                        readOnly
                                        className="bg-background/50 font-mono text-sm"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            setShowPrivateKey(!showPrivateKey)
                                        }
                                    >
                                        {showPrivateKey ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            copyToClipboard(
                                                keys.privateKey,
                                                "private"
                                            )
                                        }
                                    >
                                        {copySuccess === "private" ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => {
                                    setKeys(null);
                                    setPassword("");
                                }}
                                className="w-full"
                            >
                                Clear Keys
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ViewIdentityKeys;
