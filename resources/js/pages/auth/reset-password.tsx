import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <>
            <Head title="Reset password" />

            <div className="bg-[#131313] border border-[#464555] rounded-xl p-6 shadow-xl">
                <div className="flex flex-col gap-2 mb-6">
                    <svg className="h-10 w-10 text-[#c3c0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h1 className="text-3xl font-bold text-[#e5e2e1]">Set a new password</h1>
                    <p className="text-[#c7c4d8]">
                        Create a strong password for <span className="text-[#e5e2e1] font-medium">{email}</span>
                    </p>
                </div>

                <Form
                    {...update.form()}
                    transform={(data) => ({ ...data, token, email })}
                    resetOnSuccess={['password', 'password_confirmation']}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[#c7c4d8]">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    className="mt-1 block w-full bg-[#0e0e0e] border-[#464555] text-[#e5e2e1] placeholder:text-[#464555]"
                                    readOnly
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-[#c7c4d8]">
                                    New Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    autoComplete="new-password"
                                    className="mt-1 block w-full bg-[#0e0e0e] border-[#464555] text-[#e5e2e1] placeholder:text-[#464555] focus:border-[#c3c0ff] focus:ring-[#c3c0ff]/20"
                                    autoFocus
                                    placeholder="••••••••"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-[#c7c4d8]">
                                    Confirm Password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    className="mt-1 block w-full bg-[#0e0e0e] border-[#464555] text-[#e5e2e1] placeholder:text-[#464555] focus:border-[#c3c0ff] focus:ring-[#c3c0ff]/20"
                                    placeholder="••••••••"
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#c3c0ff] text-[#1d00a5] font-semibold hover:bg-[#d0bcff] active:scale-[0.98] transition-all"
                                disabled={processing}
                                data-test="reset-password-button"
                            >
                                {processing && <Spinner />}
                                Reset Password
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ResetPassword.layout = {
    title: 'Reset password',
    description: 'Please enter your new password below',
};
