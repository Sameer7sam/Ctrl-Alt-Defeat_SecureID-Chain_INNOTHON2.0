import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { blockchainSystem } from "@/lib/blockchain";
import { backendService } from "@/lib/backend";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const ViewIdentityKeys: React.FC = () => {
    const [password, setPassword] = useState("");
    const [keys, setKeys] = useState<{
        publicKey: string;
        privateKey: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<"public" | "private" | null>(null);
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleViewKeys = async () => {
        try {
            setError(null);
            setIsLoading(true);

            if (!password) {
                setError("Please enter your password");
                return;
            }

            const currentUser = blockchainSystem.getCurrentUser();
            if (!currentUser) {
                setError("No user found. Please generate keys first.");
                return;
            }

            const storedKeys = await backendService.verifyAndGetKeys(
                currentUser.publicKey,
                password
            );

            if (!storedKeys) {
                setError("Invalid password. Please try again.");
                return;
            }

            setKeys(storedKeys);
            toast.success("Keys retrieved successfully!");
        } catch (error) {
            console.error("Error viewing keys:", error);
            setError("Failed to retrieve keys. Please try again.");
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
                <CardTitle>View Your Identity Keys</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium"
                        >
                            Enter Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>

                    <Button
                        onClick={handleViewKeys}
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading..." : "View Keys"}
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

export default ViewIdentityKeys;
