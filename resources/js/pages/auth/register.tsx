import { Form, Head, usePage } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const { props } = usePage();
    const canRegister = (props.canRegister as boolean | undefined) ?? true;

    if (!canRegister) {
        return (
            <>
                <Head title="Registration Closed" />
                <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-[#464555]/30">
                        <Lock className="size-8 text-[#c3c0ff]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-[#e5e2e1]">
                            Registration is closed
                        </h2>
                        <p className="mt-2 max-w-sm text-sm text-[#c7c4d8]">
                            New registrations are currently not being accepted.
                            Contact the administrator for more information.
                        </p>
                    </div>
                    <TextLink
                        href={login()}
                        className="text-[#c3c0ff] font-semibold hover:text-[#d0bcff]"
                    >
                        Back to log in
                    </TextLink>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="institute_name" className="text-[#c7c4d8]">
                                    Institute Name
                                </Label>
                                <Input
                                    id="institute_name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    name="institute_name"
                                    placeholder="Your school or organization"
                                    className="bg-[#131313] border-[#464555] text-[#e5e2e1] placeholder:text-[#464555] focus:border-[#c3c0ff] focus:ring-[#c3c0ff]/20"
                                />
                                <InputError message={errors.institute_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-[#c7c4d8]">
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                    className="bg-[#131313] border-[#464555] text-[#e5e2e1] placeholder:text-[#464555] focus:border-[#c3c0ff] focus:ring-[#c3c0ff]/20"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[#c7c4d8]">
                                    Work Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={3}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="name@institute.edu"
                                    className="bg-[#131313] border-[#464555] text-[#e5e2e1] placeholder:text-[#464555] focus:border-[#c3c0ff] focus:ring-[#c3c0ff]/20"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-[#c7c4d8]">
                                    Password
                                </Label>
                                <div className="relative">
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="••••••••"
                                        className="bg-[#131313] border-[#464555] text-[#e5e2e1] placeholder:text-[#464555] focus:border-[#c3c0ff] focus:ring-[#c3c0ff]/20"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c7c4d8] cursor-pointer">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </span>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-[#c7c4d8]">
                                    Confirm Password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="••••••••"
                                    className="bg-[#131313] border-[#464555] text-[#e5e2e1] placeholder:text-[#464555] focus:border-[#c3c0ff] focus:ring-[#c3c0ff]/20"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#c3c0ff] text-[#1d00a5] font-semibold hover:bg-[#d0bcff] active:scale-[0.98] transition-all shadow-lg shadow-[#c3c0ff]/20"
                                tabIndex={6}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create Account
                            </Button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-[#c7c4d8]">
                                Already have an account?{' '}
                                <TextLink href={login()} tabIndex={7} className="text-[#c3c0ff] font-semibold hover:text-[#d0bcff]">
                                    Log in
                                </TextLink>
                            </p>
                        </div>

                        <div className="pt-4 border-t border-[#464555]/10">
                            <p className="text-center text-xs text-[#c7c4d8]/60 leading-relaxed">
                                By creating an account, you agree to AI Education Studio's{' '}
                                <a href="#" className="underline hover:text-[#c3c0ff]">Terms of Service</a> and{' '}
                                <a href="#" className="underline hover:text-[#c3c0ff]">Privacy Policy</a>.
                                Data processing is compliant with academic standards.
                            </p>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Register your institute',
    description: 'Get started with your administrative console.',
};
