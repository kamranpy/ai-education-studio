import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Filter,
    MoreVertical,
    Search,
    UserPlus,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { index as usersIndex } from '@/actions/App/Http/Controllers/Admin/UserController';
import { create as usersInvite } from '@/actions/App/Http/Controllers/Admin/UserInviteController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

function getUserInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function getRoleBadgeClasses(roleSlug: string): string {
    switch (roleSlug) {
        case 'institute_admin':
            return 'bg-[#c3c0ff]/10 text-[#e2dfff] border-[#c3c0ff]/20';
        case 'student':
            return 'bg-[#353439] text-[#c8c5d0] border-white/5';
        default:
            return 'bg-[#03b4a2]/10 text-[#4fdbc8] border-[#4fdbc8]/20';
    }
}

function getStatusIndicator(status: string): { color: string; label: string } {
    switch (status) {
        case 'active':
            return { color: 'bg-[#4fdbc8]', label: 'Active' };
        case 'invited':
            return { color: 'bg-[#928f9a]', label: 'Pending' };
        case 'disabled':
            return { color: 'bg-[#ffb4ab]', label: 'Inactive' };
        default:
            return { color: 'bg-[#928f9a]', label: status };
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
    const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'instructor' | 'student'>('all');

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

    function handleTabChange(tab: 'all' | 'admin' | 'instructor' | 'student') {
        setActiveTab(tab);
        const roleMap: Record<string, string | undefined> = {
            all: undefined,
            admin: 'institute_admin',
            instructor: 'instructor',
            student: 'student',
        };
        router.get(
            usersIndex.url({
                query: {
                    search: filters.search,
                    role: roleMap[tab],
                    status: filters.status,
                },
            }),
            {},
            { preserveState: true, replace: true },
        );
    }

    const activeUsers = users.data.filter((u) => u.status === 'active').length;
    const pendingUsers = users.data.filter((u) => u.status === 'invited').length;
    const inactiveUsers = users.data.filter((u) => u.status === 'disabled').length;

    return (
        <>
            <Head title="User Management" />

            <div className="space-y-8">
                {/* Page Header */}
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="font-headline-lg text-headline-lg text-[#e4e1e7]">
                            User Management
                        </h1>
                        <p className="font-body-md text-body-md text-[#c8c5d0] mt-1">
                            Manage access permissions, track engagement, and invite new members to the workspace.
                        </p>
                    </div>
                    <Button
                        asChild
                        className="bg-[#c3c0ff] text-[#161349] hover:bg-[#a9a4ff] font-semibold px-6 py-3 rounded-xl flex items-center gap-2"
                    >
                        <Link href={usersInvite.url()}>
                            <UserPlus className="size-5" />
                            Invite User
                        </Link>
                    </Button>
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        className="rounded-xl p-6 flex flex-col justify-between"
                        style={{
                            background: 'rgba(32, 31, 35, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                    >
                        <div>
                            <p className="font-label-md text-label-md text-[#928f9a] mb-2">Active Licenses</p>
                            <h3 className="font-headline-lg text-headline-lg text-[#e4e1e7]">
                                {activeUsers} <span className="text-[#4fdbc8] text-body-md font-normal">/ {users.total}</span>
                            </h3>
                        </div>
                        <div className="mt-4">
                            <div className="w-full h-2 bg-[#353439] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#4fdbc8] rounded-full"
                                    style={{ width: `${users.total > 0 ? (activeUsers / users.total) * 100 : 0}%` }}
                                />
                            </div>
                            <p className="font-body-sm text-body-sm text-[#928f9a] mt-2">
                                {users.total > 0 ? Math.round((activeUsers / users.total) * 100) : 0}% capacity utilized
                            </p>
                        </div>
                    </div>

                    <div
                        className="rounded-xl p-6 flex flex-col justify-between border-[#c3c0ff]/20 bg-[#c3c0ff]/5"
                        style={{
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(195, 192, 255, 0.2)',
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-label-md text-label-md text-[#c3c0ff] mb-2">Pending Invites</p>
                                <h3 className="font-headline-md text-headline-md text-[#e4e1e7]">{pendingUsers}</h3>
                            </div>
                            <span className="material-symbols-outlined text-[#c3c0ff] text-3xl">mail</span>
                        </div>
                        <button className="w-full mt-4 py-2 bg-[#c3c0ff]/10 border border-[#c3c0ff]/30 text-[#c3c0ff] font-bold rounded-lg text-body-sm hover:bg-[#c3c0ff]/20 transition-colors">
                            Review Invites
                        </button>
                    </div>

                    <div
                        className="rounded-xl p-6 flex flex-col justify-between"
                        style={{
                            background: 'rgba(32, 31, 35, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                    >
                        <p className="font-label-md text-label-md text-[#928f9a] mb-4">Quick Summary</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[#4fdbc8] font-bold text-headline-md">{activeUsers}</p>
                                <p className="font-body-sm text-body-sm text-[#928f9a]">Active Users</p>
                            </div>
                            <div>
                                <p className="text-[#ffb4ab] font-bold text-headline-md">{inactiveUsers}</p>
                                <p className="font-body-sm text-body-sm text-[#928f9a]">Inactive Seats</p>
                            </div>
                        </div>
                    </div>
                </div>

                {users.data.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center rounded-xl py-16"
                        style={{
                            background: 'rgba(32, 31, 35, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                    >
                        <Users className="mb-4 size-12 text-[#928f9a]" />
                        <h2 className="font-headline-md text-headline-md text-[#e4e1e7]">
                            No users found
                        </h2>
                        <p className="mt-1 font-body-sm text-body-sm text-[#928f9a]">
                            Invite your first team member to get started.
                        </p>
                        <Button
                            asChild
                            className="mt-4 bg-[#c3c0ff] text-[#161349] hover:bg-[#a9a4ff]"
                        >
                            <Link href={usersInvite.url()}>Invite User</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Data Table Card */}
                        <div
                            className="rounded-xl overflow-hidden"
                            style={{
                                background: 'rgba(32, 31, 35, 0.8)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                            }}
                        >
                            {/* Tabs */}
                            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex gap-6">
                                    {(['all', 'admin', 'instructor', 'student'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => handleTabChange(tab)}
                                            className={`font-label-md text-label-md pb-4 capitalize transition-colors ${
                                                activeTab === tab
                                                    ? 'text-[#c3c0ff] border-b-2 border-[#c3c0ff]'
                                                    : 'text-[#928f9a] hover:text-[#e4e1e7]'
                                            }`}
                                        >
                                            {tab === 'all' ? 'All Users' : tab + 's'}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#928f9a]" />
                                        <Input
                                            placeholder="Search users..."
                                            value={search}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="pl-9 bg-[#131317] border-white/10 text-[#e4e1e7] placeholder:text-[#928f9a]/50 focus:border-[#c3c0ff]/50 w-64"
                                        />
                                    </div>
                                    <button className="flex items-center gap-2 text-[#928f9a] font-label-md text-label-md hover:text-[#e4e1e7]">
                                        <Filter className="size-4" />
                                        Filters
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.02] border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 font-label-md text-label-md text-[#928f9a] uppercase tracking-wider">User Profile</th>
                                        <th className="px-6 py-4 font-label-md text-label-md text-[#928f9a] uppercase tracking-wider">Email Address</th>
                                        <th className="px-6 py-4 font-label-md text-label-md text-[#928f9a] uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 font-label-md text-label-md text-[#928f9a] uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.05]">
                                    {users.data.map((user) => {
                                    const status = getStatusIndicator(user.status);

                                    return (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-[#c3c0ff]/10 flex items-center justify-center text-[#c3c0ff] font-bold text-sm">
                                                            {getUserInitials(user.name)}
                                                        </div>
                                                        <div>
                                                            <p className="font-label-md text-label-md text-[#e4e1e7]">{user.name}</p>
                                                            <p className="font-body-sm text-body-sm text-[#928f9a]">ID: {user.id.slice(-8).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-body-sm text-body-sm text-[#c8c5d0]">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeClasses(user.role?.slug || '')}`}>
                                                        {user.role?.name || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${status.color}`} />
                                                        <span className="font-label-sm text-label-sm text-[#e4e1e7]">{status.label}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-[#928f9a] opacity-0 group-hover:opacity-100 hover:text-[#c3c0ff] transition-all">
                                                        <MoreVertical className="size-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="px-6 py-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
                                <p className="font-body-sm text-body-sm text-[#928f9a]">
                                    Showing {(users.current_page - 1) * users.per_page + 1}–
                                    {Math.min(users.current_page * users.per_page, users.total)} of {users.total} users
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-2 rounded-lg border border-white/5 text-[#928f9a] hover:bg-[#2a292e] transition-colors disabled:opacity-50"
                                        disabled={!users.prev_page_url}
                                        onClick={() => users.prev_page_url && router.get(users.prev_page_url)}
                                    >
                                        <ChevronLeft className="size-5" />
                                    </button>
                                    {Array.from({ length: Math.min(3, users.last_page) }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                                                page === users.current_page
                                                    ? 'bg-[#c3c0ff] text-[#161349]'
                                                    : 'border border-white/5 text-[#928f9a] hover:bg-[#2a292e]'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    {users.last_page > 3 && (
                                        <>
                                            <span className="text-[#928f9a] px-2">...</span>
                                            <button className="w-10 h-10 rounded-lg border border-white/5 text-[#928f9a] hover:bg-[#2a292e] transition-colors font-bold">
                                                {users.last_page}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        className="p-2 rounded-lg border border-white/5 text-[#928f9a] hover:bg-[#2a292e] transition-colors disabled:opacity-50"
                                        disabled={!users.next_page_url}
                                        onClick={() => users.next_page_url && router.get(users.next_page_url)}
                                    >
                                        <ChevronRight className="size-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
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
