import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiBaseUrl } from "@/lib/config";
import { Loader2, ArrowRight } from "lucide-react";

interface Step2Props {
    email: string;
    onNext: (verificationToken: string) => void;
    onBack: () => void;
}

export default function Step2OTP({ email, onNext, onBack }: Step2Props) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow 1 char

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-advance
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '');

        if (pastedData) {
            const newOtp = [...otp];
            pastedData.split('').forEach((char, index) => {
                if (index < 6) newOtp[index] = char;
            });
            setOtp(newOtp);

            // Focus last filled or submit if full
            if (pastedData.length === 6) {
                inputRefs.current[5]?.focus();
                // Optional: Auto-submit?
            } else {
                inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const code = otp.join('');
        if (code.length !== 6) {
            setError("Please enter the 6-digit code.");
            return;
        }

        setIsLoading(true);

        try {
            const apiBase = getApiBaseUrl();
            const res = await fetch(`${apiBase}/api/register/otp/verify/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: code })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Verification failed");
            }

            // Success -> Return the Signed Token
            onNext(data.verification_token);

        } catch (err: any) {
            setError(err.message || "Failed to verify code.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Verify your Email</h3>
                <p className="text-sm text-gray-500">
                    We sent a code to <span className="font-semibold text-gray-900 dark:text-gray-100">{email}</span>
                </p>
                <button type="button" onClick={onBack} className="text-xs text-blue-600 hover:underline">
                    Wrong email?
                </button>
            </div>

            <div className="flex justify-center gap-2 sm:gap-4">
                {otp.map((digit, index) => (
                    <Input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold tracking-tighter"
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                    />
                ))}
            </div>

            {error && (
                <div className="p-3 text-sm text-center text-red-500 bg-red-50 rounded-md border border-red-200">
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
                        Verify & Start Setup <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>

            <p className="text-xs text-center text-gray-400">
                Tip: Check your spam folder if you don't see it.
            </p>
        </form>
    );
}
