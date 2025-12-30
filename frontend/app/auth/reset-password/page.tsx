"use client";
import { getApiBaseUrl, APP_VERSION } from "@/lib/config";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const apiBase = getApiBaseUrl();

            const response = await fetch(`${apiBase}/api/auth/password-reset-confirm/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ uid, token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Reset failed");
            }

            // Success
            alert("Password has been reset successfully. Please login.");
            router.push("/auth/signin");

        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    }

    if (!uid || !token) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-red-500">Invalid password reset link.</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="border-b bg-white dark:bg-gray-950 sticky top-0 z-50">
                <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
                    <Link className="flex items-center justify-center font-bold text-xl gap-2" href="/">
                        <Image src="/logo.png" alt="DigitalJamath Logo" width={32} height={32} className="h-8 w-8" />
                        DigitalJamath
                    </Link>
                    <Link href="/auth/signin" className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to Login
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <div className="text-red-500 text-sm">{error}</div>}
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>

            {/* Footer */}
            <footer className="border-t bg-white dark:bg-gray-950 py-4">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} DigitalJamath. Open Source under MIT License.</p>
                    <p className="text-xs mt-1">Version {APP_VERSION}</p>
                </div>
            </footer>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
