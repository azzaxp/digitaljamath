import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, HelpCircle, BarChart3, Bot, Construction, BarChart } from "lucide-react";

import { DataAgentChat } from "@/components/chat/DataAgentChat";
import { BasiraHelpChat } from "@/components/chat/BasiraHelpChat";

export function BasiraPage() {
    const [activeTab, setActiveTab] = useState("data");

    return (
        <div className="h-[calc(100vh-7rem)] flex flex-col -m-6">
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b flex justify-between items-center bg-gray-50/50">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Basira AI</h1>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Your intelligent assistant for data insights and support
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                <div className="px-6 border-b bg-white">
                    <TabsList className="bg-transparent p-0 h-12 w-full justify-start gap-6 rounded-none">
                        <TabsTrigger
                            value="data"
                            className="bg-transparent shadow-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-full px-2"
                        >
                            <BarChart className="mr-2 h-4 w-4" />
                            Data Insights
                        </TabsTrigger>
                        <TabsTrigger
                            value="help"
                            className="bg-transparent shadow-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 rounded-none h-full px-2"
                        >
                            <HelpCircle className="mr-2 h-4 w-4" />
                            Help & Support
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 bg-gray-50/50 min-h-0 relative">
                    <TabsContent value="data" className="absolute inset-0 m-0 data-[state=inactive]:hidden text-sm">
                        <DataAgentChat />
                    </TabsContent>
                    <TabsContent value="help" className="absolute inset-0 m-0 data-[state=inactive]:hidden text-sm">
                        <BasiraHelpChat />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
