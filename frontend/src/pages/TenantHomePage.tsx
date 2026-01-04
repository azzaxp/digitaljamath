import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Phone, Loader2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

export function TenantHomePage() {
    const [tenantName, setTenantName] = useState<string | null>(null);
    const [tenantError, setTenantError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkTenant = async () => {
            const hostname = window.location.hostname;
            const subdomain = hostname.split('.')[0];

            // If no subdomain, show error
            if (hostname === 'localhost' || hostname === 'digitaljamath.com' || subdomain === 'localhost' || subdomain === 'www') {
                setTenantError('Please access your masjid via its subdomain.');
                setLoading(false);
                return;
            }

            try {
                const apiBase = getApiBaseUrl();
                const res = await fetch(`${apiBase}/api/tenant-info/`);

                if (!res.ok) {
                    setTenantError('Masjid not found. Please check the URL.');
                    setLoading(false);
                    return;
                }

                const data = await res.json();

                if (data.is_public) {
                    setTenantError('This is not a valid masjid subdomain.');
                    setLoading(false);
                    return;
                }

                setTenantName(data.name || subdomain);
                setLoading(false);
            } catch (err) {
                setTenantError('Unable to verify masjid.');
                setLoading(false);
            }
        };

        checkTenant();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (tenantError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-lg">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Masjid Not Found</h1>
                    <p className="text-gray-500 mb-6">{tenantError}</p>
                    <a
                        href="/find-masjid"
                        className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Find Your Masjid
                    </a>
                </div>
            </div>
        );
    }

    // Tenant landing page
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                        <span className="font-bold text-xl text-gray-900">{tenantName}</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Welcome to {tenantName}
                    </h1>
                    <p className="text-gray-600">
                        Access your dashboard or member portal below
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Staff Login Card */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <CardTitle>Staff Portal</CardTitle>
                            <CardDescription>
                                For committee members and administrators
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                                <Link to="/auth/signin">Login with Email</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Member Login Card */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <Phone className="h-8 w-8 text-green-600" />
                            </div>
                            <CardTitle>Member Portal</CardTitle>
                            <CardDescription>
                                For Jamath members and households
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                                <Link to="/portal/login">Login with OTP</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Demo Credentials - only show on demo subdomain */}
                {window.location.hostname.startsWith('demo.') && (
                    <div className="max-w-md mx-auto mt-12 p-4 bg-white/80 rounded-lg border text-center">
                        <p className="text-sm text-gray-500 mb-2">Demo Credentials</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <p className="font-medium text-gray-700">Staff</p>
                                <p className="text-gray-500">admin@demo.com / password</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">Member</p>
                                <p className="text-gray-500">+919876543210 / OTP: 123456</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t bg-white/80 py-4 mt-auto">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                    <p>Powered by <a href="/" className="text-blue-600 hover:underline">DigitalJamath</a></p>
                </div>
            </footer>
        </div>
    );
}
