"use client";
import { getApiBaseUrl, getBaseDomain, APP_VERSION } from '@/lib/config';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isValidTenant, setIsValidTenant] = useState<boolean | null>(null);

    // Get tenant name from subdomain and redirect if on main domain
    useEffect(() => {
        const hostname = window.location.hostname;
        const baseDomain = getBaseDomain();
        const protocol = window.location.protocol;

        // Set the main login URL for "switch workspace" link
        setMainLoginUrl(`${protocol}//${baseDomain}/auth/login`);

        // Check for local dev subdomain (e.g., demo.localhost)
        const isLocalSubdomain = hostname.endsWith('.localhost');
        const subdomain = hostname.split('.')[0];

        // If on a local subdomain, extract tenant name and stay
        if (isLocalSubdomain) {
            setTenantName(subdomain);
            verifyTenant(subdomain);
            return;
        }

        // Check if it's the main domain (no subdomain) - redirect to workspace entry
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === baseDomain || ['www', 'admin'].includes(subdomain)) {
            router.replace('/auth/login');
            return;
        }

        // Production subdomain - extract tenant name
        setTenantName(subdomain);
        verifyTenant(subdomain);
    }, [router]);

    async function verifyTenant(subdomain: string) {
        try {
            const apiBase = getApiBaseUrl();
            const response = await fetch(`${apiBase}/api/tenant-info/`);

            if (!response.ok) {
                setIsValidTenant(false);
                return;
            }

            const data = await response.json();

            // If backend handles unknown domain by falling back to public schema
            // but the frontend is on a subdomain, then the tenant is invalid.
            if (data.is_public) {
                setIsValidTenant(false);
            } else {
                setIsValidTenant(true);
                // Optionally update tenant name from backend
                if (data.name) setTenantName(data.name);
            }
        } catch (err) {
            console.error("Failed to verify tenant:", err);
            // On network error, we might want to be lenient or strict. 
            // Let's be strict for security.
            setIsValidTenant(false);
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            const apiBase = getApiBaseUrl();

            const response = await fetch(`${apiBase}/api/token/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: email, password: password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error("Invalid email or password");
            }

            // Store Token
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);

            // Redirect to Dashboard
            router.push("/dashboard");

        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setIsLoading(false);
        }
    }

    // If we're still checking, show nothing or a loader
    if (isValidTenant === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If tenant is invalid, show "Masjid Not Found"
    if (isValidTenant === false) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="border-b bg-white dark:bg-gray-950 h-16 flex items-center px-4 lg:px-6">
                    <Link className="flex items-center gap-2 font-bold text-xl" href="/">
                        <Image src="/logo.png" alt="Logo" width={32} height={32} />
                        DigitalJamath
                    </Link>
                </header>
                <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <h1 className="text-6xl font-extrabold text-blue-600">404</h1>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mt-4">
                        Masjid Not Found
                    </h2>
                    <p className="text-gray-500 max-w-lg mx-auto mt-2">
                        The digital jamath portal you are looking for does not exist.
                    </p>
                    <Link href="/" className="mt-6">
                        <Button>Go to Home</Button>
                    </Link>
                </main>
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
                    <div className="flex items-center gap-4">
                        {tenantName && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {tenantName}
                            </span>
                        )}
                        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                            ← Back
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">
                            Welcome back
                        </CardTitle>
                        <CardDescription className="text-center">
                            Sign in to {tenantName || "your"} workspace
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email / Username</Label>
                                <Input name="email" id="email" placeholder="name@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input name="password" id="password" type="password" required />
                            </div>
                            {error && <div className="text-red-500 text-sm">{error}</div>}
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading ? "Signing In..." : "Sign In"}
                            </Button>
                            <div className="text-center text-sm text-gray-500 space-y-2">
                                <div>
                                    <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="pt-2 border-t">
                                    <Link
                                        href={mainLoginUrl}
                                        className="text-gray-400 hover:text-gray-600 text-xs"
                                    >
                                        Not your workspace? Sign in to different workspace →
                                    </Link>
                                </div>
                            </div>
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
