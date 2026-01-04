
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    User, Receipt, Bell, FileText, LogOut,
    CheckCircle, AlertCircle, Users, Home, Loader2, CreditCard
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { getApiBaseUrl } from "@/lib/config";

// --- Types ---
type MembershipStatus = {
    status: string;
    is_active: boolean;
    amount_paid: string;
    minimum_required: string;
    start_date?: string;
    end_date?: string;
};

type Member = {
    id: number;
    full_name: string;
    is_head_of_family: boolean;
    relationship_to_head: string;
};

type Household = {
    id: number;
    membership_id: string;
    address: string;
    economic_status: string;
    housing_status: string;
    member_count: number;
    head_name: string;
    members: Member[];
    phone_number?: string;
};

export function PortalDashboardPage() {
    const navigate = useNavigate();
    const [household, setHousehold] = useState<Household | null>(null);
    const [membership, setMembership] = useState<MembershipStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [headName, setHeadName] = useState("");

    // For Payment Integration
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [extraCharity, setExtraCharity] = useState(0);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);

    // 80G Logic
    const [need80G, setNeed80G] = useState(false);
    const [donorPan, setDonorPan] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            navigate("/portal/login");
            return;
        }

        // Check for Return URL (Cashfree)
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('order_id');
        const panParam = params.get('pan');

        if (orderId) {
            // Clear URL params to avoid re-trigger
            window.history.replaceState({}, '', window.location.pathname);
            verifyCashfree(orderId, panParam || "", token);
        }

        setHeadName(localStorage.getItem("head_name") || "Member");
        fetchProfile(token);
    }, [navigate]);

    const verifyCashfree = async (orderId: string, pan: string, token: string) => {
        setIsPaymentLoading(true);
        const apiBase = getApiBaseUrl();
        try {
            const verifyRes = await fetch(`${apiBase}/api/portal/payment/verify/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    order_id: orderId,
                    donor_pan: pan
                })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.status === 'success') {
                alert("Payment Successful! Receipt Generated: " + verifyData.receipt);
                // fetchProfile call handled by useEffect or manually called?
                // profile fetch happens in useEffect anyway if component mounts, but here just alert.
                window.location.reload(); // Simple reload to refresh data
            } else {
                alert("Payment verification failed: " + verifyData.error);
            }
        } catch (err) {
            alert("Payment verification error");
        } finally {
            setIsPaymentLoading(false);
        }
    };

    const fetchProfile = async (token: string) => {
        try {
            const apiBase = getApiBaseUrl();

            const res = await fetch(`${apiBase}/api/portal/profile/`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.clear();
                navigate("/portal/login");
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setHousehold(data.household);
                setMembership(data.membership);
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/portal/login");
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const loadCashfree = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setIsPaymentLoading(true);

        // Validate 80G PAN
        if (need80G && !donorPan) {
            alert("Please enter PAN Number for 80G receipt.");
            setIsPaymentLoading(false);
            return;
        }

        const token = localStorage.getItem("access_token");
        const apiBase = getApiBaseUrl();

        // Calculate total
        const due = membership ? Math.max(0, parseFloat(membership.minimum_required) - parseFloat(membership.amount_paid)) : 0;
        const total = due + extraCharity;

        if (total <= 0) {
            alert("Amount must be greater than 0");
            setIsPaymentLoading(false);
            return;
        }

        try {
            // 1. Create Order
            const orderRes = await fetch(`${apiBase}/api/portal/payment/create-order/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount: total,
                    donor_pan: donorPan
                })
            });

            if (!orderRes.ok) throw new Error("Failed to create order");
            const orderData = await orderRes.json();

            // CHECK PROVIDER
            if (orderData.provider === 'CASHFREE') {
                const res = await loadCashfree();
                if (!res) { alert("Cashfree SDK failed to load"); setIsPaymentLoading(false); return; }

                const cashfree = new (window as any).Cashfree({ mode: orderData.env === 'SANDBOX' ? "sandbox" : "production" });
                cashfree.checkout({
                    paymentSessionId: orderData.payment_session_id,
                    redirectTarget: "_self"
                });
                // Return, page will redirect
                return;

            } else {
                // RAZORPAY (Default)
                const res = await loadRazorpay();
                if (!res) { alert("Razorpay SDK failed"); setIsPaymentLoading(false); return; }

                const options = {
                    key: orderData.key_id,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "Digital Jamath",
                    description: "Membership Payment",
                    image: "/logo.png",
                    order_id: orderData.order_id,
                    handler: async function (response: any) {
                        // 3. Verify Payment
                        try {
                            const verifyRes = await fetch(`${apiBase}/api/portal/payment/verify/`, {
                                method: "POST",
                                headers: {
                                    "Authorization": `Bearer ${token}`,
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    amount: total, // Send total logic
                                    donor_pan: donorPan
                                })
                            });

                            const verifyData = await verifyRes.json();
                            if (verifyData.status === 'success') {
                                alert("Payment Successful! Receipt Generated: " + verifyData.receipt);
                                setIsPaymentOpen(false);
                                fetchProfile(token!); // Reload profile
                            } else {
                                alert("Payment verification failed: " + verifyData.error);
                            }
                        } catch (err) {
                            alert("Payment verification error");
                        }
                    },
                    prefill: {
                        name: household?.head_name,
                        contact: household?.phone_number || '', // could add phone
                        email: ''
                    },
                    theme: {
                        color: "#2563EB"
                    }
                };

                const paymentObject = new (window as any).Razorpay(options);
                paymentObject.open();
            }

        } catch (err) {
            console.error(err);
            alert("Payment initiation failed. Please check gateway configuration.");
        } finally {
            // Note: If Cashfree redirects, this finally might run before unload? 
            if ((window as any).Cashfree) {
                // Keep loading true if redirecting
            } else {
                setIsPaymentLoading(false);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!household) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <p className="text-gray-500">Failed to load profile.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
        );
    }

    // Logic for Due Amount
    const amountDue = membership ? Math.max(0, parseFloat(membership.minimum_required) - parseFloat(membership.amount_paid)) : 0;
    const totalAmount = amountDue + extraCharity;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10 w-full">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Digital Jamath</h1>
                            <p className="text-xs text-gray-500">Member Portal</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 space-y-6 max-w-lg flex-1">

                {/* 1. Membership & Payment Card */}
                {membership && (
                    <Card className={`shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 ${!membership.is_active && amountDue > 0 ? 'border-amber-200 bg-amber-50' : 'border-blue-100 bg-white'}`}>
                        <CardHeader className="pb-2">
                            <CardTitle className={`text-lg flex items-center ${!membership.is_active && amountDue > 0 ? 'text-amber-800' : 'text-blue-800'}`}>
                                {!membership.is_active && amountDue > 0 ? <AlertCircle className="h-5 w-5 mr-2 text-amber-600" /> : <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />}
                                {(!membership.is_active && amountDue > 0) ? "Membership Payment Due" : "Membership Status"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                {amountDue > 0 ? (
                                    <>
                                        <div>
                                            <p className="text-sm text-gray-600">Amount Due</p>
                                            <p className="text-2xl font-bold text-gray-900">₹{amountDue}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Required</p>
                                            <p className="text-sm font-medium text-gray-700">₹{membership.minimum_required}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full">
                                        <p className="text-sm text-gray-600">Current Status</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-xl font-bold text-green-700">Active</p>
                                            <Badge variant="outline" className="bg-green-50 text-green-700">No Dues</Badge>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(!membership.is_active && amountDue > 0) ? (
                                <p className="text-xs text-amber-700 mb-4 bg-amber-100/50 p-2 rounded">
                                    Your membership is currently <b>{membership.status}</b>. Please pay the due amount.
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded">
                                    Your membership is active. You can make voluntary donations (Sadaqah) below.
                                </p>
                            )}

                            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                                <DialogTrigger asChild>
                                    <Button className={`w-full font-semibold text-white ${!membership.is_active && amountDue > 0 ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`} size="lg">
                                        {amountDue > 0 ? "Pay Now via UPI / Card" : "Make a Mutation / Donation"}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{amountDue > 0 ? "Processing Payment" : "Make a Donation"}</DialogTitle>
                                        <DialogDescription>
                                            Secure payment gateway.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        <Card className="border p-4 bg-gray-50">
                                            {amountDue > 0 && (
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm text-gray-600">Membership Fee</span>
                                                    <span className="font-medium">₹{amountDue}</span>
                                                </div>
                                            )}
                                            {extraCharity > 0 && (
                                                <div className="flex justify-between items-center mb-2 text-green-600">
                                                    <span className="text-sm">Donation Amount</span>
                                                    <span className="font-medium">+₹{extraCharity}</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-2 mt-2 flex justify-between items-center">
                                                <span className="font-bold text-lg">Total Pay</span>
                                                <span className="text-2xl font-bold text-blue-700">₹{totalAmount}</span>
                                            </div>
                                        </Card>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <span>{amountDue > 0 ? "Add Extra Donation (Sadaqah)" : "Select Donation Amount"}</span>
                                            </label>
                                            <div className="flex gap-2">
                                                {[100, 500, 1000, 2000].map(amt => (
                                                    <Button
                                                        key={amt}
                                                        variant={extraCharity === amt ? "default" : "outline"}
                                                        size="sm"
                                                        className={`flex-1 ${extraCharity === amt ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                                        onClick={() => setExtraCharity(amt)}
                                                    >
                                                        ₹{amt}
                                                    </Button>
                                                ))}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <input
                                                    type="number"
                                                    placeholder="Custom Amount"
                                                    className="flex-1 px-3 py-1 text-sm border rounded"
                                                    onChange={(e) => setExtraCharity(parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>

                                        {/* 80G Checkbox */}
                                        <div className="flex items-center space-x-2 pt-2 border-t">
                                            <input
                                                type="checkbox"
                                                id="need80g"
                                                className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                                checked={need80G}
                                                onChange={(e) => setNeed80G(e.target.checked)}
                                            />
                                            <label htmlFor="need80g" className="text-sm font-medium leading-none cursor-pointer">
                                                I need 80G Tax Exemption Receipt
                                            </label>
                                        </div>

                                        {need80G && (
                                            <div className="animate-in fade-in slide-in-from-top-2">
                                                <label className="text-sm font-medium mb-1 block">PAN Number (Required for 80G)</label>
                                                <input
                                                    type="text"
                                                    value={donorPan}
                                                    onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                                                    placeholder="ABCDE1234F"
                                                    className="w-full px-3 py-2 border rounded-md text-sm uppercase"
                                                    maxLength={10}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <DialogFooter className="sm:justify-center gap-2">
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            size="lg"
                                            onClick={handlePayment}
                                            disabled={isPaymentLoading || totalAmount <= 0}
                                        >
                                            {isPaymentLoading ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                                            ) : (
                                                <>Pay ₹{totalAmount} Securely</>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                )}

                {/* 2. Digital ID Card */}
                <Card className="bg-gradient-to-r from-blue-700 to-blue-900 text-white border-0 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

                    <CardContent className="p-6 relative z-0">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold">Member ID</p>
                                <p className="text-3xl font-bold tracking-tight font-mono">
                                    {household?.membership_id || `#${household?.id}`}
                                </p>
                            </div>
                            <Badge
                                className={`px-3 py-1 border-0 ${membership?.is_active
                                    ? 'bg-green-500/20 text-green-100 hover:bg-green-500/30'
                                    : 'bg-red-500/20 text-red-100 hover:bg-red-500/30'
                                    }`}
                            >
                                {membership?.is_active ? (
                                    <span className="flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> ACTIVE</span>
                                ) : (
                                    <span className="flex items-center"><AlertCircle className="h-3 w-3 mr-1" /> EXPIRED</span>
                                )}
                            </Badge>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xl font-semibold leading-none">{household.head_name || headName}</p>
                            <p className="text-sm text-blue-200">{household?.address}</p>
                        </div>

                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/20">
                            <div className="flex items-center text-sm text-blue-100">
                                <Users className="h-4 w-4 mr-2 opacity-70" />
                                {household?.member_count} Family Members
                            </div>
                            {membership?.end_date && (
                                <div className="text-xs text-blue-200">
                                    Valid until: {new Date(membership.end_date).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Quick Actions Grid */}
                <div>
                    <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Services</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/portal/receipts">
                            <Card className="hover:bg-blue-50 transition-all cursor-pointer h-full border hover:border-blue-200 group">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className="p-3 bg-green-100 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                        <Receipt className="h-6 w-6 text-green-600" />
                                    </div>
                                    <p className="font-semibold text-gray-900">Receipt Vault</p>
                                    <p className="text-xs text-gray-500 mt-1">View history</p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link to="/portal/announcements">
                            <Card className="hover:bg-blue-50 transition-all cursor-pointer h-full border hover:border-blue-200 group">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className="p-3 bg-blue-100 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                        <Bell className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <p className="font-semibold text-gray-900">Announcements</p>
                                    <p className="text-xs text-gray-500 mt-1">Latest updates</p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link to="/portal/services">
                            <Card className="hover:bg-blue-50 transition-all cursor-pointer h-full border hover:border-blue-200 group">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className="p-3 bg-purple-100 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                        <FileText className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <p className="font-semibold text-gray-900">Service Desk</p>
                                    <p className="text-xs text-gray-500 mt-1">Request docs</p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link to="/portal/family">
                            <Card className="hover:bg-blue-50 transition-all cursor-pointer h-full border hover:border-blue-200 group">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className="p-3 bg-orange-100 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                        <User className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <p className="font-semibold text-gray-900">Family Profile</p>
                                    <p className="text-xs text-gray-500 mt-1">Manage members</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t py-6 mt-auto">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm font-semibold text-gray-900">Digital Jamath</p>
                    <p className="text-xs text-gray-500 mt-1">Empowering Communities</p>
                    <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
                        <a href="#" className="hover:text-gray-600">Privacy</a>
                        <span>•</span>
                        <a href="#" className="hover:text-gray-600">Terms</a>
                        <span>•</span>
                        <a href="#" className="hover:text-gray-600">Support</a>
                    </div>
                    <p className="text-[10px] text-gray-300 mt-4">v1.1.0 • © 2026</p>
                </div>
            </footer>
        </div>
    );
}

export default PortalDashboardPage;
