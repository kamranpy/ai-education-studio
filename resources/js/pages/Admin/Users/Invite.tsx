import { Head, Link, useForm } from '@inertiajs/react';
import { Check, GraduationCap, Shield, User, X } from 'lucide-react';
import { useState } from 'react';
import { index as usersIndex } from '@/actions/App/Http/Controllers/Admin/UserController';
import { store as usersInviteStore } from '@/actions/App/Http/Controllers/Admin/UserInviteController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AdminLayout from '@/layouts/admin-layout';

type Role = {
    id: number;
    name: string;
    slug: string;
};

const ROLE_OPTIONS = [
    {
        id: 'institute_admin',
        name: 'Admin',
        description: 'Full system control and user management.',
        icon: Shield,
    },
    {
        id: 'instructor',
        name: 'Instructor',
        description: 'Manage curriculum and review AI performance.',
        icon: GraduationCap,
    },
    {
        id: 'student',
        name: 'Student',
        description: 'Limited access to learning modules and results.',
        icon: User,
    },
];

function InviteUser({ roles }: { roles: Role[] }) {
    const [inviteAnother, setInviteAnother] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role_id: '',
        send_email: true,
    });

    // Map role IDs to slugs for display
    const selectedRoleSlug = roles.find((r) => String(r.id) === data.role_id)?.slug || '';

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(usersInviteStore.url(), {
            preserveScroll: true,
            onSuccess: () => {
                if (inviteAnother) {
                    reset();
                }
            },
        });
    }

    return (
        <>
            <Head title="Invite New User" />

            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
                {/* Modal Card */}
                <div
                    className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0px_40px_40px_0px_rgba(0,0,0,0.4)]"
                    style={{
                        background: 'rgba(22, 18, 30, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <form onSubmit={submit}>
                        {/* Modal Header */}
                        <div className="p-8 border-b border-white/5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="font-headline-md text-headline-md text-[#e4e1e7]">
                                        Invite New User
                                    </h2>
                                    <p className="font-body-sm text-body-sm text-[#928f9a] mt-1">
                                        Grant access to the management portal and curriculum tools.
                                    </p>
                                </div>
                                <Link
                                    href={usersIndex.url()}
                                    className="text-[#928f9a] hover:text-[#e4e1e7] transition-colors"
                                >
                                    <X className="size-6" />
                                </Link>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 space-y-8">
                            {/* Form Fields - 2 Column Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="font-label-md text-label-md text-[#928f9a]">
                                        Full Name
                                    </Label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Dr. Helena Vance"
                                        className="w-full bg-[#0e0e12] border border-white/10 rounded-xl py-3 px-4 text-[#e4e1e7] placeholder:text-[#928f9a]/50 focus:border-[#c3c0ff] focus:ring-1 focus:ring-[#c3c0ff]"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2 relative">
                                    <Label className="font-label-md text-label-md text-[#928f9a]">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="user@organization.edu"
                                            className="w-full bg-[#0e0e12] border border-white/10 rounded-xl py-3 px-4 text-[#e4e1e7] placeholder:text-[#928f9a]/50 focus:border-[#c3c0ff] focus:ring-1 focus:ring-[#c3c0ff]"
                                        />
                                        {data.email && !errors.email && (
                                            <Check className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-[#4fdbc8]" />
                                        )}
                                    </div>
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-4">
                                <h3 className="font-label-md text-label-md text-[#928f9a] uppercase tracking-wider">
                                    Select Access Role
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {ROLE_OPTIONS.map((role) => {
                                        const isSelected = selectedRoleSlug === role.id;
                                        const roleData = roles.find((r) => r.slug === role.id);

                                        if (!roleData) {
                                            return null;
                                        }

                                        const Icon = role.icon;

                                        return (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setData('role_id', String(roleData.id))}
                                                className={`group relative cursor-pointer rounded-xl p-5 border transition-all active:scale-[0.98] text-left ${
                                                    isSelected
                                                        ? 'bg-[#c3c0ff]/10 border-[#c3c0ff]/40'
                                                        : 'bg-[#1f1f23] border-white/5 hover:border-[#c3c0ff]/50'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                            isSelected
                                                                ? 'bg-[#c3c0ff]/20 text-[#c3c0ff]'
                                                                : 'bg-[#c3c0ff]/10 text-[#c3c0ff]'
                                                        }`}
                                                    >
                                                        <Icon className="size-5" />
                                                    </div>
                                                    <div
                                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                            isSelected
                                                                ? 'border-[#c3c0ff] bg-[#c3c0ff]'
                                                                : 'border-white/20 group-hover:border-[#c3c0ff]'
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <div className="w-2 h-2 rounded-full bg-[#161349]" />
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="font-label-md text-label-md text-[#e4e1e7] mb-1">
                                                    {role.name}
                                                </p>
                                                <p className="font-body-sm text-body-sm text-[#928f9a] leading-tight">
                                                    {role.description}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.role_id} />
                            </div>

                            {/* Options */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="send_email"
                                        checked={data.send_email}
                                        onCheckedChange={(checked) =>
                                            setData('send_email', checked === true)
                                        }
                                        className="border-white/20 data-[state=checked]:bg-[#c3c0ff] data-[state=checked]:border-[#c3c0ff]"
                                    />
                                    <Label
                                        htmlFor="send_email"
                                        className="cursor-pointer font-body-sm text-body-sm text-[#c8c5d0]"
                                    >
                                        Send invitation email
                                    </Label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="invite_another"
                                        checked={inviteAnother}
                                        onCheckedChange={(checked) =>
                                            setInviteAnother(checked === true)
                                        }
                                        className="border-white/20 data-[state=checked]:bg-[#c3c0ff] data-[state=checked]:border-[#c3c0ff]"
                                    />
                                    <Label
                                        htmlFor="invite_another"
                                        className="cursor-pointer font-body-sm text-body-sm text-[#c8c5d0]"
                                    >
                                        Invite another after sending
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 bg-[#0e0e12]/50 border-t border-white/5 flex justify-end gap-4">
                            <Button
                                variant="outline"
                                asChild
                                className="px-6 py-3 font-label-md text-label-md text-[#928f9a] hover:text-[#e4e1e7] hover:bg-[#2a292e] border-white/10 rounded-xl"
                            >
                                <Link href={usersIndex.url()}>Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-[#c3c0ff] text-[#161349] px-8 py-3 font-label-md text-label-md rounded-xl font-bold hover:bg-[#a9a4ff] active:scale-95 transition-all shadow-lg shadow-[#c3c0ff]/20"
                            >
                                {processing && <Spinner className="mr-2 size-4" />}
                                Send Invite
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

InviteUser.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default InviteUser;
