import { Link } from "react-router-dom";

export function SiteFooter() {
    return (
        <footer className="border-t py-6 w-full shrink-0 bg-gray-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold mb-4">Digital Ummah Foundation</h3>
                        <p className="text-sm text-gray-500">Mangaluru, India (The Silicon Beach of India)</p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-4">Contact</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li>General: <a href="mailto:salam@digitaljamath.com" className="hover:text-blue-600">salam@digitaljamath.com</a></li>
                            <li>Contributors: <a href="mailto:contribute@digitaljamath.com" className="hover:text-blue-600">contribute@digitaljamath.com</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-4">Legal</h3>
                        <nav className="flex flex-col space-y-2 text-sm text-gray-500">
                            <Link className="hover:underline" to="/terms">Terms of Service</Link>
                            <Link className="hover:underline" to="/privacy">Privacy Policy</Link>
                        </nav>
                    </div>
                </div>
                <div className="border-t pt-6 text-center text-xs text-gray-400">
                    <p>© 2025 DigitalJamath. Open Source under MIT License.</p>
                </div>
            </div>
        </footer>
    );
}
