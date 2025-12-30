"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";

type Permissions = Record<string, string>; // e.g., { 'finance': 'admin', 'welfare': 'read' }

interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_superuser: boolean;
}

interface RbacContextType {
    permissions: Permissions;
    isLoading: boolean;
    hasPermission: (module: string, minLevel?: 'read' | 'write' | 'admin') => boolean;
    refreshPermissions: () => Promise<void>;
    isStaff: boolean;
    user: UserProfile | null;
}

const RbacContext = createContext<RbacContextType | undefined>(undefined);

export function RbacProvider({ children }: { children: React.ReactNode }) {
    const [permissions, setPermissions] = useState<Permissions>({});
    const [isStaff, setIsStaff] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserProfile | null>(null);

    const refreshPermissions = async () => {
        try {
            // Step 1: Get My Profile to get ID.
            const profileRes = await fetchWithAuth('/api/user/profile/');
            if (!profileRes.ok) throw new Error("Not logged in");
            const profile = await profileRes.json();
            setUser(profile);

            // Superuser Override: Admins see everything
            if (profile.is_superuser) {
                // Grant all permissions
                setPermissions({
                    'finance': 'admin',
                    'welfare': 'admin',
                    'settings': 'admin',
                    'households': 'admin',
                    'surveys': 'admin',
                    'announcements': 'admin',
                    'reports': 'admin'
                });
                setIsStaff(true);
                return;
            }

            // Step 2: Get Staff Entry for this user
            const staffRes = await fetchWithAuth('/api/jamath/staff-members/');
            if (staffRes.ok) {
                const staffList = await staffRes.json();
                const myStaffEntry = staffList.find((s: any) => s.user === profile.id);

                if (myStaffEntry) {
                    setIsStaff(true);
                    const roleId = myStaffEntry.role;
                    const roleRes = await fetchWithAuth(`/api/jamath/staff-roles/${roleId}/`);
                    if (roleRes.ok) {
                        const roleData = await roleRes.json();
                        setPermissions(roleData.permissions || {});
                    }
                }
            }
        } catch (err) {
            console.warn("RBAC: Failed to load permissions", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshPermissions();
    }, []);

    const hasPermission = (module: string, minLevel: 'read' | 'write' | 'admin' = 'read') => {
        // Since we blindly trust 'permissions' state which we just populated for superuser,
        // we can just stick to the check below.

        const userLevel = permissions[module];
        if (!userLevel) return false;

        if (minLevel === 'read') return true;
        if (minLevel === 'write') return ['write', 'admin'].includes(userLevel);
        if (minLevel === 'admin') return userLevel === 'admin';

        return false;
    };

    return (
        <RbacContext.Provider value={{ permissions, isLoading, hasPermission, refreshPermissions, isStaff, user }}>
            {children}
        </RbacContext.Provider>
    );
}

export function useRbac() {
    const context = useContext(RbacContext);
    if (context === undefined) {
        throw new Error("useRbac must be used within a RbacProvider");
    }
    return context;
}
