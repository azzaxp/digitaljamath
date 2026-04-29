import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import {
    ArrowLeft, Loader2, Search, Download, Receipt,
    IndianRupee, TrendingUp, Calendar, Filter, X, Eye
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

type ReceiptData = {
    id: number;
    voucher_number: string;
    date: string;
    amount: number;
    donor_name: string;
    membership_id: string;
    narration: string;
    payment_mode: string;
    donor_pan: string;
    created_by: string;
};

type Stats = {
    total_amount: number;
    count: number;
    avg_amount: number;
};

export function PaymentsPage() {
    const [receipts, setReceipts] = useState<ReceiptData[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [paymentMode, setPaymentMode] = useState("all");

    useEffect(() => {
        fetchReceipts();
    }, [dateFrom, dateTo, paymentMode]);

    const fetchReceipts = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateFrom) params.append('from', dateFrom);
            if (dateTo) params.append('to', dateTo);
            if (search) params.append('search', search);
            if (paymentMode && paymentMode !== 'all') params.append('payment_mode', paymentMode);

            const res = await fetchWithAuth(`/api/admin/receipts/?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setReceipts(data.receipts);
                setStats(data.stats);
            }
        } catch (err) {
            console.error("Failed to fetch receipts", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        fetchReceipts();
    };

    const clearFilters = () => {
        setSearch("");
        setDateFrom("");
        setDateTo("");
        setPaymentMode("all");
    };

    const exportCSV = () => {
        if (!receipts.length) return;

        const headers = ["Voucher #", "Date", "Member", "Member ID", "Amount", "Mode", "PAN", "Narration"];
        const rows = receipts.map(r => [
            r.voucher_number,
            new Date(r.date).toLocaleDateString(),
            r.donor_name,
            r.membership_id,
            r.amount.toFixed(2),
            r.payment_mode,
            r.donor_pan,
            r.narration.replace(/,/g, ' ')
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getPaymentModeBadge = (mode: string) => {
        switch (mode) {
            case 'CASH':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Cash</Badge>;
            case 'UPI':
                return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">UPI</Badge>;
            case 'BANK':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Bank</Badge>;
            case 'CHEQUE':
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Cheque</Badge>;
            default:
                return <Badge variant="outline">{mode || 'N/A'}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/dashboard/finance"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
                    <p className="text-gray-500 mt-1">View all receipts and payments received</p>
                </div>
                <Button variant="outline" onClick={exportCSV} disabled={!receipts.length}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium">Total Collected</p>
                                    <p className="text-3xl font-bold mt-1">₹{stats.total_amount.toLocaleString()}</p>
                                </div>
                                <IndianRupee className="h-10 w-10 text-emerald-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Total Receipts</p>
                                    <p className="text-3xl font-bold mt-1">{stats.count}</p>
                                </div>
                                <Receipt className="h-10 w-10 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-violet-100 text-sm font-medium">Average Amount</p>
                                    <p className="text-3xl font-bold mt-1">₹{stats.avg_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                </div>
                                <TrendingUp className="h-10 w-10 text-violet-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name, receipt #, or member ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-9"
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="pl-9"
                                placeholder="From"
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="pl-9"
                                placeholder="To"
                            />
                        </div>
                        <Select value={paymentMode} onValueChange={setPaymentMode}>
                            <SelectTrigger>
                                <SelectValue placeholder="Payment Mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Modes</SelectItem>
                                <SelectItem value="CASH">Cash</SelectItem>
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="BANK">Bank Transfer</SelectItem>
                                <SelectItem value="CHEQUE">Cheque</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleSearch} size="sm">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <X className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Receipts</CardTitle>
                    <CardDescription>
                        {receipts.length} receipt{receipts.length !== 1 ? 's' : ''} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : receipts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-30" />
                            <p>No receipts found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Receipt #</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Member</TableHead>
                                        <TableHead>Member ID</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead>Narration</TableHead>
                                        <TableHead className="w-10"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {receipts.map(receipt => (
                                        <TableRow key={receipt.id}>
                                            <TableCell className="font-mono text-sm">
                                                {receipt.voucher_number}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(receipt.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {receipt.donor_name || 'Guest'}
                                            </TableCell>
                                            <TableCell>
                                                {receipt.membership_id ? (
                                                    <Badge variant="outline" className="font-mono">
                                                        {receipt.membership_id}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-green-600">
                                                ₹{receipt.amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {getPaymentModeBadge(receipt.payment_mode)}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">
                                                {receipt.narration}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link to={`/dashboard/finance/voucher/${receipt.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
