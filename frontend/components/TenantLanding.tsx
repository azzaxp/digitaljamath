"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ShieldCheck } from "lucide-react";

export function TenantLanding() {
    const [masjidName, setMasjidName] = useState("Community Portal");

    useEffect(() => {
        // Fetch Tenant Info
        const fetchTenantInfo = async () => {
            try {
                const protocol = window.location.protocol;
                const hostname = window.location.hostname;
                const apiBase = `${protocol}//${hostname}:8000`;

                const res = await fetch(`${apiBase}/api/tenant-info/`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.name) {
                        setMasjidName(data.name);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch tenant info", err);
            }
        };

        fetchTenantInfo();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Welcome to {masjidName}
                </h1>
                <p className="text-muted-foreground mt-2">
                    Please select your login type to continue.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 w-full max-w-2xl">
                {/* Member Login Card */}
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-500">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                            <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle>Member Login</CardTitle>
                        <CardDescription>
                            For household heads and family members.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-sm text-gray-500">
                            Access your digital ID, pay fees, view receipts, and submit requests.
                        </p>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                            <Link href="/portal/login">Login as Member</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Admin Login Card */}
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-indigo-500">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                            <ShieldCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <CardTitle>Admin Login</CardTitle>
                        <CardDescription>
                            For Zimmedars, Treasurers, and Staff.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-sm text-gray-500">
                            Manage households, finances, welfare, and announcements.
                        </p>
                        <Button variant="outline" className="w-full border-indigo-200 hover:bg-indigo-50 text-indigo-700" asChild>
                            <Link href="/auth/login">Login as Admin</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <footer className="mt-12 text-sm text-gray-400">
                Powered by <a href="https://projectmizan.org" target="_blank" className="hover:underline">DigitalJamath</a>
            </footer>
        </div>
    );
}
