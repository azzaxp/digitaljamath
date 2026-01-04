

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";

interface Config {
    cycle: string;
    minimum_fee: number;
    currency: string;
    membership_id_prefix: string;
    masjid_name: string;
    household_label: string;
    member_label: string;
}

interface ConfigContextType {
    config: Config | null;
    isLoading: boolean;
    refreshConfig: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<Config | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setIsLoading(false);
                return;
            }

            const res = await fetchWithAuth("/api/admin/membership-config/");

            if (res.ok) {
                const data = await res.json();
                setConfig(data);
            }
        } catch (error) {
            console.error("Failed to fetch config", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    return (
        <ConfigContext.Provider value={{ config, isLoading, refreshConfig: fetchConfig }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error("useConfig must be used within a ConfigProvider");
    }
    return context;
}
