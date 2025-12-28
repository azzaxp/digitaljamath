import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
    return (
        <header className="border-b bg-white dark:bg-gray-950 sticky top-0 z-50">
            <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
                <Link className="flex items-center justify-center font-bold text-xl" href="/">
                    DigitalJamath
                </Link>
                <nav className="hidden md:flex gap-6 items-center">
                    <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="/about">
                        About
                    </Link>
                    <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="/#features">
                        Features
                    </Link>
                    <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="https://github.com/azzaxp/Project-Mizan" target="_blank">
                        GitHub
                    </Link>
                    <div className="h-4 w-px bg-gray-300 mx-2"></div>
                    <Link href="/auth/find-workspace">
                        <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                            Find My Masjid
                        </Button>
                    </Link>
                </nav>
            </div>
        </header>
    );
}
