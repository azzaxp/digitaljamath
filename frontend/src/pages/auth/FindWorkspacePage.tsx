import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getApiBaseUrl } from "@/lib/config";

export function FindWorkspacePage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setHasSearched(true);
        setResults([]);

        try {
            const apiBase = getApiBaseUrl();
            const res = await fetch(`${apiBase}/api/find-workspace/?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Find Your Masjid</h1>
                    <p className="text-muted-foreground">
                        Enter the name of your masjid or city to find your digital workspace.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="e.g. Jama Masjid Bangalore, or 560001"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                    </Button>
                </form>

                <div className="space-y-4">
                    {results.map((masjid) => (
                        <div key={masjid.schema_name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div>
                                <h3 className="font-semibold">{masjid.name}</h3>
                                <p className="text-sm text-gray-500">{masjid.city}, {masjid.state}</p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <a href={`http://${masjid.domain}`}>Visit</a>
                            </Button>
                        </div>
                    ))}
                    {hasSearched && results.length === 0 && !isLoading && (
                        <div className="text-center py-8 text-gray-500">
                            No masjids found matching "{query}".
                        </div>
                    )}
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
