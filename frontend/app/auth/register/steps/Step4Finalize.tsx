import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/lib/config";
import { Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { useRouter } from 'next/navigation';

interface Step4Props {
    domainPart: string;
    loginUrl: string;
    setupData?: any;
    baseDomain: string;
    verificationToken: string;
}

export default function Step4Finalize({ domainPart, loginUrl, setupData, baseDomain, verificationToken }: Step4Props) {
    const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
    const [message, setMessage] = useState('Finalizing workspace setup...');
    const router = useRouter();

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 30; // 30 * 4s = 2 mins
        const apiBase = getApiBaseUrl();
        const schemaName = domainPart.replace(/-/g, '_');

        const poll = async () => {
            try {
                // Poll check-tenant
                const res = await fetch(`${apiBase}/api/check-tenant/?schema_name=${schemaName}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.exists) {
                        if (setupData) {
                            setMessage('Applying your configuration...');
                            try {
                                await fetch(`${apiBase}/api/register/setup/`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        schema_name: schemaName,
                                        verification_token: verificationToken,
                                        setup_data: setupData
                                    })
                                });
                                // Even if it fails, we proceed, but maybe log it?
                            } catch (e) {
                                console.error("Setup failed", e);
                            }
                        }

                        setStatus('success');
                        setMessage('Workspace ready!');
                        return;
                    }
                }
            } catch (ignored) { }

            attempts++;
            if (attempts >= maxAttempts) {
                setStatus('failed');
                setMessage('It is taking longer than expected. You will receive an email when it is ready.');
            } else {
                setTimeout(poll, 4000);
            }
        };

        // Start polling after a small delay to allow Gunicorn/Celery pick up
        setTimeout(poll, 2000);

    }, [domainPart, setupData]);

    // Pending State with Creative Loader
    const loadingMessages = [
        "Configuring secure schema...",
        "Setting up database isolation...",
        "Preparing accounting ledgers...",
        "Initializing member portal...",
        "Applying security policies...",
        "Almost there..."
    ];

    // Cycle messages (Hooks must be unconditional)
    const [msgIndex, setMsgIndex] = useState(0);
    useEffect(() => {
        const i = setInterval(() => setMsgIndex(p => (p + 1) % loadingMessages.length), 3000);
        return () => clearInterval(i);
    }, []);

    if (status === 'success') {
        return (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">You're all set!</h3>
                    <p className="text-gray-500 mt-2">Your DigitalJamath workspace has been created.</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Your Workspace URL</p>
                    <a href={loginUrl} className="text-lg font-medium text-blue-600 hover:text-blue-500 break-all">
                        {domainPart}.{baseDomain}
                    </a>
                </div>

                <Button className="w-full" asChild>
                    <a href={loginUrl}>
                        Go to Dashboard <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                </Button>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="text-center space-y-4">
                <div className="text-yellow-600 font-medium">Creation is taking time...</div>
                <p className="text-sm text-gray-500">{message}</p>
                <p className="text-xs text-gray-400">Check your email inbox or try refreshing later.</p>
                <div className="border p-3 rounded mx-auto inline-block bg-gray-50 dark:bg-gray-800">
                    <span className="font-mono text-sm">{domainPart}.{baseDomain}</span>
                </div>
            </div>
        );
    }



    return (
        <div className="text-center space-y-8 py-8 animate-in fade-in duration-500">
            <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-pulse" />
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold animate-pulse text-gray-800 dark:text-gray-200">
                    {message}
                </h3>
                <p className="text-sm text-gray-500 transition-all duration-500">
                    {loadingMessages[msgIndex]}
                </p>
            </div>
        </div>
    );
}
