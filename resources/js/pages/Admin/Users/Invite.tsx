import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { index as usersIndex } from '@/actions/App/Http/Controllers/Admin/UserController';
import { store as usersInviteStore } from '@/actions/App/Http/Controllers/Admin/UserInviteController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AdminLayout from '@/layouts/admin-layout';

type Role = {
    id: number;
    name: string;
    slug: string;
};

function InviteUser({ roles }: { roles: Role[] }) {
    const [inviteAnother, setInviteAnother] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role_id: '',
        send_email: true,
    });

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
            <Head title="Invite User" />

            <div className="mx-auto max-w-lg">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Invite User</CardTitle>
                    </CardHeader>

                    <form onSubmit={submit}>
                        <CardContent className="space-y-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="John Doe"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    placeholder="john@university.edu"
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={data.role_id}
                                    onValueChange={(v) => setData('role_id', v)}
                                >
                                    <SelectTrigger id="role" className="w-full">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem
                                                key={role.id}
                                                value={String(role.id)}
                                            >
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role_id} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="send_email"
                                    checked={data.send_email}
                                    onCheckedChange={(checked) =>
                                        setData('send_email', checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="send_email"
                                    className="cursor-pointer"
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
                                />
                                <Label
                                    htmlFor="invite_another"
                                    className="cursor-pointer"
                                >
                                    Invite another
                                </Label>
                            </div>
                        </CardContent>

                        <CardFooter className="justify-end gap-2">
                            <Button variant="outline" asChild>
                                <Link href={usersIndex.url()}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && (
                                    <Spinner className="mr-2 size-4" />
                                )}
                                Send Invite
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </>
    );
}

InviteUser.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default InviteUser;
