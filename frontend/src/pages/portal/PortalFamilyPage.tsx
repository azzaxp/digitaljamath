import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Users, User, Calendar, Briefcase, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Member {
    id: number;
    full_name: string;
    relationship_to_head: string;
    gender: string;
    age?: number;
    dob?: string;
    marital_status: string;
    profession?: string;
    education?: string;
    is_head_of_family: boolean;
}

interface Household {
    id: number;
    membership_id: string;
    address: string;
    phone_number: string;
    members: Member[];
}

export function PortalFamilyPage() {
    const navigate = useNavigate();
    const [household, setHousehold] = useState<Household | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchFamily();
    }, []);

    const fetchFamily = async () => {
        try {
            const token = localStorage.getItem('portal_token');
            const res = await fetch('/api/portal/profile/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const data = await res.json();
                setHousehold(data);
            } else if (res.status === 401) {
                navigate('/portal/login');
            }
        } catch (err) {
            console.error("Failed to fetch family", err);
        } finally {
            setIsLoading(false);
        }
    };

    const getRelationshipLabel = (rel: string) => {
        const labels: Record<string, string> = {
            'SELF': '👤 Head',
            'SPOUSE': '💑 Spouse',
            'SON': '👦 Son',
            'DAUGHTER': '👧 Daughter',
            'FATHER': '👴 Father',
            'MOTHER': '👵 Mother',
            'BROTHER': '👨 Brother',
            'SISTER': '👩 Sister',
            'OTHER': 'Other'
        };
        return labels[rel] || rel;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/portal">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Family Profile</h1>
                        <p className="text-sm text-gray-500">View your household information</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                ) : household ? (
                    <>
                        {/* Household Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    Household #{household.membership_id}
                                </CardTitle>
                                <CardDescription>{household.address}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Phone:</span>
                                        <span className="ml-2 font-medium">{household.phone_number}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Members:</span>
                                        <span className="ml-2 font-medium">{household.members?.length || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Members List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Family Members</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Relation</TableHead>
                                            <TableHead>Age</TableHead>
                                            <TableHead>Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {household.members?.map((member) => (
                                            <TableRow key={member.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium">{member.full_name}</span>
                                                        {member.is_head_of_family && (
                                                            <Badge variant="outline" className="text-xs">Head</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getRelationshipLabel(member.relationship_to_head)}
                                                </TableCell>
                                                <TableCell>
                                                    {member.age ? `${member.age} yrs` : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                                                        {member.profession && (
                                                            <span className="flex items-center gap-1">
                                                                <Briefcase className="h-3 w-3" />
                                                                {member.profession}
                                                            </span>
                                                        )}
                                                        {member.education && (
                                                            <span className="flex items-center gap-1">
                                                                <GraduationCap className="h-3 w-3" />
                                                                {member.education}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="text-center text-sm text-gray-500">
                            <p>To update family information, please contact the Jamath office.</p>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        Household not found
                    </div>
                )}
            </div>
        </div>
    );
}
