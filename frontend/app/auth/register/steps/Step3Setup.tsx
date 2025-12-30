import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Check, Briefcase, ChevronRight, SkipForward } from "lucide-react";

interface Step3Props {
    onNext: (setupData?: any) => void;
    taskId: string; // To potentially link setup to the task
}

export default function Step3Setup({ onNext, taskId }: Step3Props) {
    const [accountType, setAccountType] = useState('standard');

    const handleSkip = () => {
        onNext(); // Pass nothing
    };

    const handleFinish = () => {
        onNext({
            accountType
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center gap-3 border border-blue-100 dark:border-blue-900">
                <div className="relative">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute opacity-75"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full relative"></div>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-semibold">Building your workspace...</p>
                    <p className="text-xs opacity-80">You can configure these settings while we wait.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-base">Chart of Accounts</Label>
                    <p className="text-xs text-gray-500 mb-2">How would you like to track finances?</p>
                    <RadioGroup defaultValue="standard" onValueChange={setAccountType} className="grid grid-cols-2 gap-4">
                        <div>
                            <RadioGroupItem value="standard" id="standard" className="peer sr-only" />
                            <Label
                                htmlFor="standard"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-blue-50/50 cursor-pointer"
                            >
                                <Briefcase className="mb-3 h-6 w-6 text-gray-500" />
                                Standard
                                <span className="text-xs text-center text-gray-500 mt-1">Pre-built ledger suitable for most Masjids</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="custom" id="custom" className="peer sr-only" />
                            <Label
                                htmlFor="custom"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-blue-50/50 cursor-pointer"
                            >
                                <Check className="mb-3 h-6 w-6 text-gray-500" />
                                Custom
                                <span className="text-xs text-center text-gray-500 mt-1">Start from scratch (Admin Config)</span>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button variant="outline" type="button" onClick={handleSkip} className="w-1/3 text-gray-500">
                    Skip <SkipForward className="ml-2 h-3 w-3" />
                </Button>
                <Button onClick={handleFinish} className="w-2/3">
                    Save & Finish <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
