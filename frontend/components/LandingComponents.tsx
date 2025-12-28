import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Github, Cloud, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";

export function OriginStorySection() {
    return (
        <section id="about" className="w-full py-12 md:py-24 bg-linear-to-b from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-950">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center space-y-8 mb-12">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-2">
                        Empowering the Heart of the Community
                    </h2>
                    <div className="max-w-3xl space-y-4 text-center text-gray-600 dark:text-gray-300">
                        <p className="text-xl leading-relaxed">
                            Masjids have always been the center of our social fabric. However, the tools we use to manage them haven't kept pace with the times. While the world runs on data and automation, our institutions often struggle with manual processes.
                        </p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Enter DigitalJamath.
                        </p>
                        <p className="text-lg">
                            We exist to bridge the gap between traditional values and modern efficiency. We believe that managing the affairs of the Ummah requires more than just sincerity; it requires precision, transparency, and accountability.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Mission Card 1 */}
                    <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300">
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                            <Cloud className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Modernize Infrastructure</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Replacing fragmented paper trails and Excel sheets with secure, centralized cloud solutions.
                        </p>
                    </div>

                    {/* Mission Card 2 */}
                    <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300">
                        <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Ensure Transparency</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Creating audit-ready financial tools that build trust with every transaction.
                        </p>
                    </div>

                    {/* Mission Card 3 */}
                    <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300">
                        <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Optimize Impact</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Using AI to help committees make data-driven decisions for the community's benefit.
                        </p>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-lg text-gray-500 dark:text-gray-400 italic max-w-2xl mx-auto">
                        &quot;At DigitalJamath, we are ensuring that the institutions carrying the community’s trust have the technology to support it.&quot;
                    </p>
                </div>
            </div>
        </section>
    );
}

export function TeamSection() {
    return (
        <section id="team" className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">The Team</h2>
                <div className="flex flex-col items-center space-y-6 max-w-2xl mx-auto text-center">

                    <div className="relative">
                        <div className="absolute -inset-1 rounded-full bg-linear-to-r from-blue-600 to-purple-600 opacity-75 blur-sm"></div>
                        <Avatar className="h-32 w-32 relative border-4 border-white dark:border-gray-900">
                            <AvatarFallback className="text-2xl bg-gray-200 text-gray-700">AZ</AvatarFallback>
                        </Avatar>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold">Mohammed Azzan Patni</h3>
                        <p className="text-blue-600 font-medium">Founder & Lead Volunteer</p>
                    </div>

                    <div className="space-y-4 text-gray-600 dark:text-gray-300">
                        <p>
                            <span className="font-semibold">Role:</span> Entrepreneur, Founder & Product Manager
                        </p>

                        <p>
                            Azzan is bootstrapping the Digital Ummah Foundation to bridge the gap between modern technology and the local Jamath. He believes the Ummah doesn&apos;t just need more donations; it needs better systems.
                        </p>
                        <p className="text-sm text-gray-500">
                            Current Status: Volunteering part-time on this project and actively seeking Code Contributors who want to turn their GitHub commits into Sadaqah Jariyah.
                        </p>

                        <a
                            href="https://linkedin.com/in/azzaxp"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Connect on LinkedIn →
                        </a>
                    </div>

                </div>
            </div>
        </section>
    );
}

export function JoinMovementSection() {
    return (
        <section className="w-full py-12 md:py-24 bg-black text-white">
            <div className="container mx-auto px-4 md:px-6 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-6">Your Code can be a Service</h2>
                <p className="mb-8 text-xl text-gray-300 max-w-2xl mx-auto">
                    DigitalJamath is 100% Open Source. We are looking for:
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-12 text-left">
                    <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
                        <h3 className="font-bold text-lg mb-2 text-green-400">Django Developers</h3>
                        <p className="text-gray-400">To build the compliance engine.</p>
                    </div>
                    <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
                        <h3 className="font-bold text-lg mb-2 text-purple-400">Next.js Wizards</h3>
                        <p className="text-gray-400">To craft accessible UIs for our elders.</p>
                    </div>
                    <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
                        <h3 className="font-bold text-lg mb-2 text-rose-400">Reviewers & Testers</h3>
                        <p className="text-gray-400">To hunt bugs, verify releases, and ensure stability.</p>
                    </div>
                    <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
                        <h3 className="font-bold text-lg mb-2 text-amber-400">Shariah Analysts</h3>
                        <p className="text-gray-400">To help us verify financial logic and Zakat calculations.</p>
                    </div>
                </div>

                <div className="space-y-4 md:space-y-0 md:space-x-4">
                    <Button size="lg" className="bg-white text-black hover:bg-gray-200" asChild>
                        <Link href="https://github.com/azzaxp/digitaljamath" target="_blank">
                            <Github className="mr-2 h-5 w-5" /> Contribute on GitHub
                        </Link>
                    </Button>
                    {/* <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                Join Our Discord
            </Button> */}
                </div>
                <p className="mt-8 text-gray-400 text-sm">
                    Whether you write code, design UIs, or just understand the problems of a local Masjid, there is a place for you here.
                </p>
            </div>
        </section>
    );
}

export function FAQSection() {
    return (
        <section className="w-full py-12 md:py-24">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem value="item-1" className="border px-4 rounded-lg last:border-b">
                        <AccordionTrigger className="text-lg font-medium hover:no-underline text-left">Is my data secure?</AccordionTrigger>
                        <AccordionContent className="text-base text-gray-600">
                            Yes. We use industry-standard encryption for all data. Since DigitalJamath is self-hostable, you can also choose to keep all data on your own private servers for maximum privacy.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border px-4 rounded-lg last:border-b">
                        <AccordionTrigger className="text-lg font-medium hover:no-underline text-left">What AI features are available?</AccordionTrigger>
                        <AccordionContent className="text-base text-gray-600 space-y-3 pt-2">
                            <p>Currently, we offer AI-powered data entry assistance and smart search capabilities to help you manage records faster.</p>
                            <p className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800">
                                <span className="font-semibold text-blue-700 dark:text-blue-300">Coming Soon:</span> Our &quot;Basira&quot; Audit AI engine, which will analyze transaction patterns in real-time to flag anomalies and ensure compliance with Sharia and FCRA regulations.
                            </p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border px-4 rounded-lg last:border-b">
                        <AccordionTrigger className="text-lg font-medium hover:no-underline text-left">Is it really free?</AccordionTrigger>
                        <AccordionContent className="text-base text-gray-600">
                            Yes! The Community edition is 100% free and open source. You can download it from GitHub and host it yourself. We only charge for the Cloud Managed version where we handle the secure hosting, backups, and updates for you.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border px-4 rounded-lg last:border-b">
                        <AccordionTrigger className="text-lg font-medium hover:no-underline text-left">How do I migrate from Excel?</AccordionTrigger>
                        <AccordionContent className="text-base text-gray-600">
                            We provide bulk CSV import tools that allow you to easily upload your existing member lists and financial records directly into DigitalJamath.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5" className="border px-4 rounded-lg last:border-b">
                        <AccordionTrigger className="text-lg font-medium hover:no-underline text-left">Do you offer support?</AccordionTrigger>
                        <AccordionContent className="text-base text-gray-600">
                            Community support is available for free via our GitHub Discussions. Priority 24/7 support is exclusively available for our Cloud Managed subscribers.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    );
}
