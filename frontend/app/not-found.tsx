"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/lib/config";

export default function NotFound() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="border-b bg-white dark:bg-gray-950 sticky top-0 z-50">
                <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
                    <Link className="flex items-center justify-center font-bold text-xl gap-2" href="/">
                        <Image src="/logo.png" alt="DigitalJamath Logo" width={32} height={32} className="h-8 w-8" />
                        DigitalJamath
                    </Link>
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="space-y-4">
                    <h1 className="text-6xl font-extrabold text-blue-600">404</h1>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Page Not Found
                    </h2>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Sorry, we couldn't find the page or workspace you're looking for. It might have been moved, deleted, or never existed.
                    </p>
                    <div className="flex justify-center gap-4 pt-4">
                        <Link href="/">
                            <Button variant="default">Back to Home</Button>
                        </Link>
                        <Link href="/auth/login">
                            <Button variant="outline">Sign In to Workspace</Button>
                        </Link>
                    </div>
                </div>
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
