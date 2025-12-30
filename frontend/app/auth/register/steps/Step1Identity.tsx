import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiBaseUrl, getDomainSuffix } from "@/lib/config";
import { Loader2, ArrowRight } from "lucide-react";

interface Step1Props {
    onNext: (data: any) => void;
    baseDomain: string;
}

export default function Step1Identity({ onNext, baseDomain }: Step1Props) {
    const [formData, setFormData] = useState({
        masjidName: '',
        domain: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'masjidName' && !formData.domain) {
            // Auto-suggest domain
            const suggested = value.toLowerCase().replace(/[^a-z0-9]/g, '');
            setFormData(prev => ({ ...prev, [name]: value, domain: suggested }));
        } else if (name === 'domain') {
            // Clean domain input
            const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
            setFormData(prev => ({ ...prev, [name]: clean }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);

        try {
            // Check domain availability + Request OTP
            const apiBase = getApiBaseUrl();

            // 1. Check availability
            const checkRes = await fetch(`${apiBase}/api/check-tenant/?schema_name=${formData.domain.replace(/-/g, '_')}`);
            if (checkRes.ok) {
                const checkData = await checkRes.json();
                if (checkData.exists) {
                    setError("This workspace domain is already taken.");
                    setIsLoading(false);
                    return;
                }
            }

            // 2. Request OTP
            const otpRes = await fetch(`${apiBase}/api/register/otp/request/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    masjid_name: formData.masjidName
                })
            });

            if (!otpRes.ok) {
                const otpData = await otpRes.json();
                throw new Error(otpData.error || "Failed to send verification code.");
            }

            // Success -> Next Step
            onNext(formData);

        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
                <Label htmlFor="masjidName">Masjid / Organization Name</Label>
                <Input
                    id="masjidName"
                    name="masjidName"
                    placeholder="e.g. Jama Masjid Mumbai"
                    value={formData.masjidName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="domain">Workspace URL</Label>
                <div className="flex">
                    <Input
                        id="domain"
                        name="domain"
                        className="rounded-r-none text-right pr-2"
                        placeholder="jamamasjid"
                        value={formData.domain}
                        onChange={handleChange}
                        required
                    />
                    <div className="flex items-center px-3 border border-l-0 rounded-r-md bg-muted text-muted-foreground text-sm">
                        .{baseDomain}
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">This will be your dedicated address.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Admin Email (Username)</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@masjid.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm</Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                    {error}
                </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                    </>
                ) : (
                    <>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>
        </form>
    );
}
