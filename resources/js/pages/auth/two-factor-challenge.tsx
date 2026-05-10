import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Recovery code',
                description:
                    'Please confirm access to your account by entering one of your emergency recovery codes.',
                toggleText: 'login using an authentication code',
            };
        }

        return {
            title: 'Authentication code',
            description:
                'Enter the authentication code provided by your authenticator application.',
            toggleText: 'login using a recovery code',
        };
    }, [showRecoveryInput]);

    setLayoutProps({
        title: authConfigContent.title,
        description: authConfigContent.description,
    });

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <>
            <Head title="Two-factor authentication" />

            <div className="bg-[#131313] border border-[#464555] rounded-xl p-6 shadow-xl">
                <div className="flex flex-col gap-2 mb-6 text-center">
                    <svg className="h-10 w-10 text-[#4fdbc8] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h1 className="text-3xl font-bold text-[#e5e2e1]">Two-factor authentication</h1>
                    <p className="text-[#c7c4d8]">Enter the 6-digit code from your authenticator app.</p>
                </div>

                <Form
                    {...store.form()}
                    className="space-y-6"
                    resetOnError
                    resetOnSuccess={!showRecoveryInput}
                >
                    {({ errors, processing, clearErrors }) => (
                        <>
                            {showRecoveryInput ? (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="recovery_code" className="text-[#c7c4d8]">
                                            Recovery Code
                                        </Label>
                                        <Input
                                            name="recovery_code"
                                            type="text"
                                            placeholder="Enter recovery code"
                                            autoFocus={showRecoveryInput}
                                            required
                                            className="bg-[#0e0e0e] border-[#464555] text-[#e5e2e1] placeholder:text-[#464555] focus:border-[#c3c0ff] focus:ring-[#c3c0ff]/20"
                                        />
                                        <InputError message={errors.recovery_code} />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                    <div className="flex w-full items-center justify-center gap-2">
                                        <InputOTP
                                            name="code"
                                            maxLength={OTP_MAX_LENGTH}
                                            value={code}
                                            onChange={(value) => setCode(value)}
                                            disabled={processing}
                                            pattern={REGEXP_ONLY_DIGITS}
                                            className="flex gap-2"
                                        >
                                            <InputOTPGroup>
                                                {Array.from(
                                                    { length: OTP_MAX_LENGTH },
                                                    (_, index) => (
                                                        <InputOTPSlot
                                                            key={index}
                                                            index={index}
                                                            className="w-12 h-14 bg-[#0e0e0e] border-[#464555] text-center text-2xl text-[#c3c0ff] focus:border-[#c3c0ff] focus:ring-[#c3c0ff]/20"
                                                        />
                                                    ),
                                                )}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <InputError message={errors.code} />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-[#c3c0ff] text-[#1d00a5] font-semibold hover:bg-[#d0bcff] active:scale-[0.98] transition-all"
                                disabled={processing}
                            >
                                Verify
                            </Button>

                            <div className="text-center text-sm text-[#c7c4d8]">
                                <span>Lost your device? </span>
                                <button
                                    type="button"
                                    className="cursor-pointer text-[#c3c0ff] hover:text-[#d0bcff] underline decoration-[#c3c0ff]/30 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current"
                                    onClick={() => toggleRecoveryMode(clearErrors)}
                                >
                                    {authConfigContent.toggleText}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
