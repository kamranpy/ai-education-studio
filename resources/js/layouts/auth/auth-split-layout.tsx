import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Panel: Brand & Value Prop */}
            <div className="relative hidden h-full flex-col bg-[#0f0069] via-[#1d00a5] to-[#4f46e5] bg-gradient-to-br p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqMbNeJbiMQTRcaqddihXl2yddGGkR41mV19MD7W0oUx_sm-t4FUJJ4R0g5sRnziscgbfTOR_Q1_iUaD1ErqpQa1tnD0l1b4tW-deJ90ISME263pN-lDkM5aHNqnAUxZehW22dVyZY4qMIjQqSS36c6ruPgoCVjfdVGr4wSRR2QvcxkIGdrvxMSpmYkiLvdAOuaROExv5FWhgEpzRKjawJ3MgvzkezlQku_c4f4JxLicm_MVOcVYOui0SyOSHIbxjdSeXT7gfDI-1w')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                <Link
                    href={home()}
                    className="relative z-10 flex items-center gap-2 text-2xl font-bold tracking-tight"
                >
                    <AppLogoIcon className="size-8 fill-current text-[#c3c0ff]" />
                    <span className="font-headline-lg text-[#c3c0ff] tracking-tight">AI Education Studio</span>
                </Link>
                <div className="relative z-10 mt-auto">
                    <h2 className="mb-6 text-4xl font-bold leading-tight text-[#e3d5ff]">
                        Empowering educators with AI
                    </h2>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#71f8e4]/10 text-[#71f8e4]">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                            <div>
                                <p className="font-semibold text-[#e3d5ff]">Smart Question Generation</p>
                                <p className="text-[#e3d5ff]/70 text-sm">Instantly create rigorous exam questions from your curriculum materials.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#71f8e4]/10 text-[#71f8e4]">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                            <div>
                                <p className="font-semibold text-[#e3d5ff]">Automated Grading</p>
                                <p className="text-[#e3d5ff]/70 text-sm">Save hundreds of hours with high-precision AI-driven assessment tools.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#71f8e4]/10 text-[#71f8e4]">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                            <div>
                                <p className="font-semibold text-[#e3d5ff]">Insightful Analytics</p>
                                <p className="text-[#e3d5ff]/70 text-sm">Identify student knowledge gaps with deep-dive performance data.</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="relative z-10 mt-auto pt-6">
                    <p className="text-[#e3d5ff]/50 text-xs uppercase tracking-widest">Advanced Academic Assessment System v2.4</p>
                </div>
            </div>
            {/* Right Panel: Login Form */}
            <div className="w-full bg-[#0e0e0e] lg:w-1/2 lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-10 fill-current text-[#c3c0ff] sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-3xl font-bold text-[#e5e2e1]">Welcome back</h1>
                        <p className="text-sm text-[#c7c4d8]">Enter your credentials to access the admin console.</p>
                    </div>
                    {children}
                </div>
                {/* Footer Small Print */}
                <div className="absolute bottom-4 left-0 right-0 text-center px-6">
                    <p className="text-[#c7c4d8]/40 text-xs uppercase tracking-tighter">
                        © 2024 AI Education Studio • Secure Encryption Active
                    </p>
                </div>
            </div>
        </div>
    );
}
