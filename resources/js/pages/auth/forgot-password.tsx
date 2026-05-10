// Components
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot password" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-500">
                    {status}
                </div>
            )}

            <div className="bg-[#131313] border border-[#464555] rounded-xl p-6 shadow-xl">
                <div className="flex flex-col gap-2 mb-6">
                    <svg className="h-10 w-10 text-[#c3c0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0-2.879h7" />
                    </svg>
                    <h1 className="text-3xl font-bold text-[#e5e2e1]">Forgot your password?</h1>
                    <p className="text-[#c7c4d8]">Enter your email and we'll send you instructions to reset your password.</p>
                </div>

                <Form {...email.form()} className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[#c7c4d8]">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="name@institution.edu"
                                    className="bg-[#0e0e0e] border-[#464555] text-[#e5e2e1] placeholder:text-[#464555] focus:border-[#c3c0ff] focus:ring-[#c3c0ff]/20"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <Button
                                className="w-full bg-[#c3c0ff] text-[#1d00a5] font-semibold hover:bg-[#d0bcff] active:scale-[0.98] transition-all"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Send Reset Link
                            </Button>
                        </>
                    )}
                </Form>

                <div className="mt-6 text-center">
                    <TextLink href={login()} className="text-sm text-[#c3c0ff] hover:text-[#d0bcff]">
                        Back to login
                    </TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Forgot password',
    description: 'Enter your email to receive a password reset link',
};
