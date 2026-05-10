import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { index as usersIndex } from '@/actions/App/Http/Controllers/Admin/UserController';
import { create as usersInvite } from '@/actions/App/Http/Controllers/Admin/UserInviteController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';

type Role = {
    id: number;
    name: string;
    slug: string;
};

type UserRecord = {
    id: string;
    name: string;
    email: string;
    status: string;
    role: Role;
    created_at: string;
};

type PaginatedUsers = {
    data: UserRecord[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Filters = {
    search?: string;
    role?: string;
    status?: string;
};

function statusBadge(status: string) {
    switch (status) {
        case 'active':
            return (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    Active
                </Badge>
            );
        case 'invited':
            return (
                <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                    Invited
                </Badge>
            );
        case 'disabled':
            return (
                <Badge variant="secondary" className="text-zinc-500">
                    Disabled
                </Badge>
            );
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

function UsersIndex({
    users,
    filters,
}: {
    users: PaginatedUsers;
    filters: Filters;
}) {
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(value: string) {
        setSearch(value);
        router.get(
            usersIndex.url({
                query: {
                    search: value || undefined,
                    role: filters.role,
                    status: filters.status,
                },
            }),
            {},
            { preserveState: true, replace: true },
        );
    }

    function handleFilter(key: 'role' | 'status', value: string) {
        const params: Record<string, string | undefined> = {
            search: filters.search,
            role: filters.role,
            status: filters.status,
        };
        params[key] = value === 'all' ? undefined : value;
        router.get(
            usersIndex.url({ query: params }),
            {},
            { preserveState: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Users" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                        Users
                    </h1>
                    <Button asChild>
                        <Link href={usersInvite.url()}>+ Invite</Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select
                            value={filters.role ?? 'all'}
                            onValueChange={(v) => handleFilter('role', v)}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="institute_admin">
                                    Admin
                                </SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.status ?? 'all'}
                            onValueChange={(v) => handleFilter('status', v)}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="invited">Invited</SelectItem>
                                <SelectItem value="disabled">
                                    Disabled
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {users.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
                        <Users className="mb-4 size-12 text-muted-foreground" />
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                            No users yet
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Invite students to get started.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href={usersInvite.url()}>Invite User</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead scope="col">Name</TableHead>
                                        <TableHead scope="col">Email</TableHead>
                                        <TableHead scope="col">Role</TableHead>
                                        <TableHead scope="col">
                                            Status
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.name}
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.role?.name ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {statusBadge(user.status)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {users.last_page > 1 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Showing{' '}
                                    {(users.current_page - 1) * users.per_page +
                                        1}
                                    –
                                    {Math.min(
                                        users.current_page * users.per_page,
                                        users.total,
                                    )}{' '}
                                    of {users.total}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!users.prev_page_url}
                                        onClick={() =>
                                            users.prev_page_url &&
                                            router.get(users.prev_page_url)
                                        }
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!users.next_page_url}
                                        onClick={() =>
                                            users.next_page_url &&
                                            router.get(users.next_page_url)
                                        }
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

UsersIndex.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default UsersIndex;
