import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

type StaffFormProps = {
    staff?: any;
    onSuccess: () => void;
    onCancel: () => void;
};

type Role = {
    id: number;
    name: string;
};

export function StaffForm({ staff, onSuccess, onCancel }: StaffFormProps) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>(staff ? String(staff.user) : "");
    const [selectedRoleId, setSelectedRoleId] = useState<string>(staff ? String(staff.role) : "");
    const [designation, setDesignation] = useState(staff?.designation || "");
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch Roles
                const rolesRes = await fetchWithAuth('/api/jamath/staff-roles/');
                const rolesData = await rolesRes.json();
                setRoles(rolesData);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingData(false);
            }
        }
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const url = staff
                ? `/api/jamath/staff-members/${staff.id}/`
                : '/api/jamath/staff-members/';

            const method = staff ? 'PUT' : 'POST';

            const payload: any = {
                role: selectedRoleId,
                designation,
            };

            if (!staff) {
                // Creating new assignment
                payload.user = selectedUserId; // Expecting ID
            }

            const res = await fetchWithAuth(url, {
                method,
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                onSuccess();
            } else {
                const data = await res.json();
                setError(JSON.stringify(data));
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {!staff && (
                <div className="space-y-2">
                    <Label htmlFor="user_id">User ID</Label>
                    <Input
                        id="user_id"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        placeholder="Enter User ID (Temporary)"
                        required
                    />
                    <p className="text-xs text-gray-500">
                        In Beta: Please enter the database ID of the user to assign.
                    </p>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="designation">Designation / Title</Label>
                <Input
                    id="designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Treasurer"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                {isLoadingData ? (
                    <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />
                ) : (
                    <Select value={selectedRoleId} onValueChange={setSelectedRoleId} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map(role => (
                                <SelectItem key={role.id} value={String(role.id)}>
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {error && (
                <div className="text-sm text-red-500 font-medium break-words">
                    {error}
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {staff ? "Update Assignment" : "Assign Role"}
                </Button>
            </div>
        </form>
    );
}
