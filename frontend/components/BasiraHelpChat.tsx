"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Bot, RefreshCw } from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const SUGGESTED_PROMPTS = [
    "How do I record a donation?",
    "How do I add a new household?",
    "What are fund types?",
    "How do I create an announcement?",
    "How do I export for Tally?",
    "What is Zakat eligibility?",
];

export default function BasiraHelpChat() {
    const [messages, setMessages] = useState<Message[]>([{
        role: "assistant",
        content: "Assalamu Alaikum! I'm Basira, your DigitalJamath guide. Ask me anything about using the system — households, finance, surveys, or troubleshooting."
    }]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetchWithAuth("/api/basira/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.slice(-4).map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = "";

            setMessages(prev => [...prev, { role: "assistant", content: "" }]);

            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                assistantMessage += parsed.content;
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    newMessages[newMessages.length - 1] = {
                                        role: "assistant",
                                        content: assistantMessage
                                    };
                                    return newMessages;
                                });
                            }
                        } catch {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "I'm having trouble connecting. Please check your API key configuration and try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestedPrompt = (prompt: string) => {
        setInput(prompt);
    };

    const handleClearChat = () => {
        setMessages([{
            role: "assistant",
            content: "Chat cleared. How can I help you with DigitalJamath?"
        }]);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-3xl mx-auto space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] p-4 rounded-2xl ${msg.role === "user"
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
                                    }`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Bot className="h-3 w-3 text-green-500" />
                                        <span>Basira Help</span>
                                    </div>
                                )}
                                <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                    {msg.role === "assistant" ? (
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow-sm">
                                <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Fixed Bottom Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-4">
                <div className="max-w-3xl mx-auto space-y-3">
                    {/* Suggested Prompts */}
                    {messages.length <= 2 && (
                        <div>
                            <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestedPrompt(prompt)}
                                        className="text-xs px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Bar */}
                    <div className="flex gap-2 items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClearChat}
                            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                            title="Clear chat"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 relative">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                placeholder="Ask about using DigitalJamath..."
                                className="pr-12 py-6 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg h-8 w-8"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
