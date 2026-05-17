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
        <div className="relative grid h-dvh flex-col items-center justify-center bg-[#0e0e0e] px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Panel: Brand & Value Prop */}
            <div className="relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f0069 0%, #1d00a5 50%, #4f46e5 100%)' }}
            >
                {/* Decorative radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,219,200,0.15),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(195,192,255,0.1),transparent_60%)]" />

                {/* Logo */}
                <Link
                    href={home()}
                    className="relative z-10 flex items-center gap-2 text-xl font-bold tracking-tight"
                >
                    <AppLogoIcon className="size-8 fill-current text-[#c3c0ff]" />
                    <span className="text-[#c3c0ff] tracking-tight">AI Education Studio</span>
                </Link>

                {/* Main content */}
                <div className="relative z-10 mt-auto">
                    <h2 className="mb-8 text-4xl font-bold leading-tight text-[#e3d5ff]">
                        Empowering educators with AI
                    </h2>
                    <ul className="space-y-5">
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#71f8e4]/10 text-[#71f8e4]">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                            <div>
                                <p className="font-semibold text-[#e3d5ff]">AI-Assisted Grading</p>
                                <p className="text-[#e3d5ff]/70 text-sm">Written answers graded by AI based on concept and logic, not exact wording.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#71f8e4]/10 text-[#71f8e4]">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                            <div>
                                <p className="font-semibold text-[#e3d5ff]">Multi-Tenant Architecture</p>
                                <p className="text-[#e3d5ff]/70 text-sm">Each institute gets a fully isolated environment with its own data and users.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#71f8e4]/10 text-[#71f8e4]">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                            <div>
                                <p className="font-semibold text-[#e3d5ff]">Flexible Exam Builder</p>
                                <p className="text-[#e3d5ff]/70 text-sm">Create MCQ, True/False, and Written Answer exams with a timer and auto-save.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Bottom tagline */}
                <div className="relative z-10 mt-auto pt-8">
                    <p className="text-[#e3d5ff]/40 text-xs uppercase tracking-widest">
                        © {new Date().getFullYear()} AI Education Studio
                    </p>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div className="relative w-full bg-[#0e0e0e] flex items-center justify-center min-h-dvh lg:min-h-0 p-8">
                <div className="w-full max-w-[380px] space-y-6">
                    {/* Mobile logo */}
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center gap-2 lg:hidden mb-4"
                    >
                        <AppLogoIcon className="h-8 fill-current text-[#c3c0ff]" />
                        <span className="text-[#c3c0ff] font-semibold text-lg">AI Education Studio</span>
                    </Link>

                    {/* Title from page layout props */}
                    {title && (
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold text-[#e5e2e1]">{title}</h1>
                            {description && (
                                <p className="text-sm text-[#c7c4d8]">{description}</p>
                            )}
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}
