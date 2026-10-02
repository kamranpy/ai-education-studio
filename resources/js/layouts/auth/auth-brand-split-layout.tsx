import { Link } from '@inertiajs/react';
import { CheckCircle, Stars } from '@material-symbols-svg/react';
import { login, register } from '@/routes';

interface AuthBrandSplitLayoutProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

export default function AuthBrandSplitLayout({
    title,
    description,
    children,
}: AuthBrandSplitLayoutProps) {
    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* Left Panel — brand / value prop (hidden on mobile) */}
            <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden bg-gradient-to-br from-[#0f0069] via-[#1d00a5] to-[#4f46e5]">
                {/* Top: logo + tagline */}
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-16">
                        <Stars className="text-[#c3c0ff] size-10" />
                        <h1 className="text-[#c3c0ff] font-semibold text-2xl tracking-tight">
                            AI Education Studio
                        </h1>
                    </div>

                    <div className="max-w-md space-y-10">
                        <h2 className="text-[#dad7ff] font-bold text-4xl leading-tight">
                            Empowering educators with AI
                        </h2>

                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <CheckCircle className="text-[#4fdbc8] bg-[#4fdbc8]/10 p-1 rounded-full flex-shrink-0 size-6" />
                                <div>
                                    <p className="font-semibold text-[#dad7ff] text-base">
                                        Smart Question Generation
                                    </p>
                                    <p className="text-[#dad7ff]/70 text-sm mt-0.5">
                                        Instantly create rigorous exam questions
                                        from your curriculum materials.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <CheckCircle className="text-[#4fdbc8] bg-[#4fdbc8]/10 p-1 rounded-full flex-shrink-0 size-6" />
                                <div>
                                    <p className="font-semibold text-[#dad7ff] text-base">
                                        Automated Grading
                                    </p>
                                    <p className="text-[#dad7ff]/70 text-sm mt-0.5">
                                        Save hundreds of hours with
                                        high-precision AI-driven assessment
                                        tools.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <CheckCircle className="text-[#4fdbc8] bg-[#4fdbc8]/10 p-1 rounded-full flex-shrink-0 size-6" />
                                <div>
                                    <p className="font-semibold text-[#dad7ff] text-base">
                                        Insightful Analytics
                                    </p>
                                    <p className="text-[#dad7ff]/70 text-sm mt-0.5">
                                        Identify student knowledge gaps with
                                        deep-dive performance data.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom: version tag */}
                <div className="relative z-10">
                    <p className="text-[#dad7ff]/50 text-xs font-medium uppercase tracking-widest">
                        Advanced Academic Assessment System v2.4
                    </p>
                </div>
            </section>

            {/* Right Panel — form */}
            <section className="w-full lg:w-1/2 bg-[#0e0e0e] flex flex-col overflow-y-auto">
                {/* Mobile top bar */}
                <div className="lg:hidden flex items-center h-16 px-6 border-b border-[#464555]/20">
                    <Stars className="text-[#c3c0ff] mr-2 size-5" />
                    <span className="text-[#c3c0ff] font-semibold text-xl tracking-tight">
                        AI Education Studio
                    </span>
                </div>

                {/* Centered form area */}
                <div className="flex-grow flex flex-col justify-center items-center px-6 py-16">
                    <div className="w-full max-w-md">
                        {/* Header */}
                        <div className="mb-8">
                            <h2 className="font-semibold text-3xl text-[#e5e2e1] tracking-tight">
                                {title}
                            </h2>
                            <p className="text-[#c7c4d8] text-base mt-2">
                                {description}
                            </p>
                        </div>

                        {children}
                    </div>
                </div>

                {/* Footer links */}
                <footer className="p-6 flex justify-center gap-6 text-[#c7c4d8] text-xs">
                    <Link
                        href={login()}
                        className="hover:text-[#c3c0ff] transition-colors"
                    >
                        Log in
                    </Link>
                    <Link
                        href={register()}
                        className="hover:text-[#c3c0ff] transition-colors"
                    >
                        Register
                    </Link>
                    <a href="#" className="hover:text-[#c3c0ff] transition-colors">
                        Contact Support
                    </a>
                </footer>
            </section>
        </div>
    );
}
