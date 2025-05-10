import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { blockchainSystem } from "@/lib/blockchain";
import { backendService } from "@/lib/backend";
import { Copy, Check } from "lucide-react";

export function PasswordRecovery() {
    const [publicKey, setPublicKey] = useState("");
    const [recoveryPhrase, setRecoveryPhrase] = useState("");
    const [keys, setKeys] = useState<{
        publicKey: string;
        privateKey: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<"public" | "private" | null>(null);

    const handleRecoverKeys = async () => {
        try {
            setError(null);

            if (!publicKey || !recoveryPhrase) {
                setError("Please enter both public key and recovery phrase");
                return;
            }

            const recoveredKeys = await backendService.recoverKeys(
                publicKey,
                recoveryPhrase
            );

            if (!recoveredKeys) {
                setError("Invalid public key or recovery phrase");
                return;
            }

            setKeys(recoveredKeys);
        } catch (error) {
            console.error("Error recovering keys:", error);
            setError("Failed to recover keys. Please try again.");
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
        } catch (error) {
            console.error("Error copying to clipboard:", error);
            setError("Failed to copy to clipboard");
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Recover Your Keys</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="publicKey"
                            className="text-sm font-medium"
                        >
                            Public Key
                        </label>
                        <Input
                            id="publicKey"
                            value={publicKey}
                            onChange={(e) => setPublicKey(e.target.value)}
                            placeholder="Enter your public key"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="recoveryPhrase"
                            className="text-sm font-medium"
                        >
                            Recovery Phrase
                        </label>
                        <Input
                            id="recoveryPhrase"
                            value={recoveryPhrase}
                            onChange={(e) => setRecoveryPhrase(e.target.value)}
                            placeholder="Enter your recovery phrase"
                        />
                    </div>

                    <Button onClick={handleRecoverKeys} className="w-full">
                        Recover Keys
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
                                        value={keys.privateKey}
                                        readOnly
                                        className="pr-10"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
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
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
