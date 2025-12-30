"use client";

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { getDomainSuffix } from "@/lib/config";
import Step1Identity from "./steps/Step1Identity";
import Step2OTP from "./steps/Step2OTP";
import Step3Setup from "./steps/Step3Setup";
import Step4Finalize from "./steps/Step4Finalize";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formData, setFormData] = useState<any>({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [setupData, setSetupData] = useState<any>({});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [verificationToken, setVerificationToken] = useState('');
    const [taskId, setTaskId] = useState('');
    const [loginUrl, setLoginUrl] = useState('');

    const baseDomain = getDomainSuffix();
    const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.8-alpha';

    // Step 1: Identity -> Request OTP
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleIdentitySubmit = (data: any) => {
        setFormData(data);
        setStep(2);
    };

    // Step 2: OTP -> Trigger Provisioning -> Move to Setup
    const handleOtpVerify = async (token: string) => {
        setVerificationToken(token);

        // --- Trigger Backend Provisioning ---
        try {
            // Use window.location.origin to ensure we hit the proxy correctly if needed, 
            // but Next.js usually handles relative paths fine.

            const payload = {
                ...formData,
                verification_token: token,
                schema_name: formData.domain.replace(/-/g, '_'),
                name: formData.masjidName
            };

            const res = await fetch('/api/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                setTaskId(data.task_id);
                setLoginUrl(data.login_url);
                setStep(3);
            } else {
                const errData = await res.json();
                alert(errData.error || "Failed to start workspace creation. Please try again.");
            }

        } catch (e) {
            console.error("Network error", e);
            alert("Network error. Please try again.");
        }
    };

    // Step 3: Setup -> Finish
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSetupFinish = (data?: any) => {
        if (data) setSetupData(data);
        setStep(4);
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950 font-sans">
            {/* Header */}
            <header className="w-full py-4 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                            <Image
                                src="/logo.png"
                                alt="DigitalJamath Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                            DigitalJamath
                        </span>
                    </Link>
                    <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                        Sign in
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                        {step === 4 ? "Finalizing Workspace..." : "Create your DigitalJamath"}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {step === 1 && "Start your 3-month free trial"}
                        {step === 2 && "Secure your account"}
                        {step === 3 && "Customize your experience"}
                    </p>
                </div>

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white dark:bg-gray-900 py-8 px-4 shadow-2xl shadow-gray-200/50 dark:shadow-none sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-800 relative overflow-hidden">

                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-50 dark:bg-gray-800">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
                                style={{ width: `${(step / 4) * 100}%` }}
                            />
                        </div>

                        <div className="mt-6">
                            {step === 1 && <Step1Identity onNext={handleIdentitySubmit} baseDomain={baseDomain} />}
                            {step === 2 && (
                                <Step2OTP
                                    email={formData.email}
                                    onNext={handleOtpVerify}
                                    onBack={() => setStep(1)}
                                />
                            )}
                            {step === 3 && <Step3Setup onNext={handleSetupFinish} taskId={taskId} />}
                            {step === 4 && (
                                <Step4Finalize
                                    domainPart={formData.domain}
                                    loginUrl={loginUrl}
                                    setupData={setupData}
                                    baseDomain={baseDomain}
                                    verificationToken={verificationToken}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} DigitalJamath. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/terms" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">Privacy</Link>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <span className="font-mono text-xs opacity-75">v{APP_VERSION}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
