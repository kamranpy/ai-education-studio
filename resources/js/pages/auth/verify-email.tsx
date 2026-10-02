// Components
import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-500">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <div className="bg-[#131313] border border-[#464555] rounded-xl p-6 shadow-xl text-center">
                <div className="w-16 h-16 bg-[#c3c0ff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="h-8 w-8 text-[#c3c0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-[#e5e2e1] mb-2">Verify your email</h1>
                <p className="text-[#c7c4d8] mb-6">
                    We sent a verification link to your email. Please click the link to confirm your account and access the console.
                </p>
                <div className="space-y-3">
                    <Form {...send.form()} className="space-y-3">
                        {({ processing }) => (
                            <Button
                                disabled={processing}
                                variant="secondary"
                                className="w-full bg-[#c3c0ff] text-[#1d00a5] font-semibold hover:bg-[#d0bcff] active:scale-[0.98] transition-all"
                            >
                                {processing && <Spinner />}
                                Resend Verification Email
                            </Button>
                        )}
                    </Form>
                    <TextLink
                        href={logout()}
                        className="mx-auto block text-sm text-[#c7c4d8] hover:text-[#e5e2e1]"
                    >
                        Log out
                    </TextLink>
                </div>
            </div>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verify email',
    description: 'Please verify your email address by clicking on the link we just emailed to you.',
};
