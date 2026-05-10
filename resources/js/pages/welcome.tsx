import { Head, Link } from '@inertiajs/react';
import { login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    return (
        <>
            <Head title="AI Education Studio" />
            <div className="min-h-screen bg-[#131313] text-[#e5e2e1] font-sans overflow-x-hidden">
                {/* Navbar */}
                <nav className="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-md shadow-sm border-b border-[#464555]/20 h-16">
                    <div className="flex justify-between items-center h-full px-6 max-w-[1280px] mx-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-semibold text-[#c3c0ff] tracking-tight">
                                AI Education Studio
                            </span>
                        </div>
                        <div className="hidden md:flex items-center gap-10">
                            <a href="#features" className="text-[#c3c0ff] font-bold border-b-2 border-[#c3c0ff] pb-1 text-base">Features</a>
                            <a href="#pricing" className="text-[#c7c4d8] font-medium hover:text-[#c3c0ff] transition-colors text-base">Pricing</a>
                            <a href="#solutions" className="text-[#c7c4d8] font-medium hover:text-[#c3c0ff] transition-colors text-base">Solutions</a>
                            <a href="#faq" className="text-[#c7c4d8] font-medium hover:text-[#c3c0ff] transition-colors text-base">FAQ</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href={login()} className="text-[#c7c4d8] font-medium hover:text-[#c3c0ff] px-4 py-2 transition-colors text-base">
                                Login
                            </Link>
                            {canRegister && (
                                <Link href={register()} className="bg-[#4f46e5] text-[#dad7ff] px-6 py-2 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all text-base">
                                    Sign Up
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative pt-32 pb-16 px-6 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.15),transparent_50%)]" />
                    <div className="max-w-[1280px] mx-auto relative z-10 flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#c3c0ff]/10 border border-[#c3c0ff]/20 rounded-full mb-10">
                            <span className="material-symbols-outlined text-[#c3c0ff] text-sm">auto_awesome</span>
                            <span className="text-[#c3c0ff] text-sm font-medium">AI-Powered Exam Platform for Institutes</span>
                        </div>
                        <h1 className="font-bold text-5xl md:text-6xl max-w-[900px] mb-6 text-[#e5e2e1] leading-tight tracking-tight">
                            The{' '}
                            <span className="bg-gradient-to-r from-[#c3c0ff] to-[#4fdbc8] bg-clip-text text-transparent">
                                Smarter Way
                            </span>{' '}
                            to Run Exams
                        </h1>
                        <p className="text-lg text-[#c7c4d8] max-w-[700px] mb-16 leading-relaxed">
                            Automate assessment creation, grading, and anti-cheat proctoring with the world's first AI-native education engine. Designed for institutions that demand precision and scale.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 mb-16">
                            <Link href={register()} className="bg-[#4f46e5] text-white px-10 py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all text-lg">
                                Start Free Trial
                            </Link>
                            <a href="#" className="bg-[#131313] border border-[#464555] hover:border-[#c3c0ff]/50 text-[#e5e2e1] px-10 py-4 rounded-xl font-bold active:scale-95 transition-all text-lg">
                                See a Demo
                            </a>
                        </div>

                        {/* Dashboard Mockup */}
                        <div className="w-full max-w-[1100px] mt-4 relative">
                            <div className="glass-card rounded-xl p-2 shadow-2xl">
                                <div className="bg-[#0e0e0e] rounded-lg border border-[#464555]/30 overflow-hidden">
                                    {/* Window chrome */}
                                    <div className="flex items-center justify-between px-5 py-3 border-b border-[#464555]/30 bg-[#131313]">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#464555]" />
                                            <div className="w-3 h-3 rounded-full bg-[#464555]" />
                                            <div className="w-3 h-3 rounded-full bg-[#464555]" />
                                        </div>
                                        <div className="h-4 w-48 bg-[#201f1f] rounded-full" />
                                        <div className="h-6 w-16 bg-[#4f46e5]/40 rounded text-[10px] text-[#c3c0ff] flex items-center justify-center font-medium">
                                            Live
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col gap-5">
                                        {/* Stat cards row */}
                                        <div className="grid grid-cols-4 gap-3">
                                            {[
                                                { label: 'Total Exams', value: '1,284', color: '#c3c0ff' },
                                                { label: 'Students', value: '8,420', color: '#4fdbc8' },
                                                { label: 'Avg Score', value: '78.4%', color: '#d0bcff' },
                                                { label: 'AI Graded', value: '96.2%', color: '#c3c0ff' },
                                            ].map((stat) => (
                                                <div key={stat.label} className="bg-[#1c1b1b] rounded-lg p-3 border border-[#464555]/20">
                                                    <div className="text-[10px] text-[#c7c4d8] mb-1">{stat.label}</div>
                                                    <div className="text-base font-bold" style={{ color: stat.color }}>{stat.value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Chart area */}
                                        <div className="bg-[#131313] rounded-lg p-4 border border-[#464555]/20">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-xs text-[#c7c4d8] font-medium">Exam Attempts — Last 12 Weeks</span>
                                                <div className="flex gap-3">
                                                    <span className="flex items-center gap-1 text-[10px] text-[#c7c4d8]">
                                                        <span className="w-2 h-2 rounded-sm bg-[#c3c0ff] inline-block" /> Submitted
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[10px] text-[#c7c4d8]">
                                                        <span className="w-2 h-2 rounded-sm bg-[#4fdbc8] inline-block" /> Graded
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Bar chart */}
                                            <div className="flex items-end gap-2 h-28">
                                                {[
                                                    { a: 55, b: 70 }, { a: 80, b: 90 }, { a: 40, b: 50 },
                                                    { a: 85, b: 95 }, { a: 65, b: 75 }, { a: 50, b: 60 },
                                                    { a: 75, b: 85 }, { a: 60, b: 70 }, { a: 90, b: 100 },
                                                    { a: 45, b: 55 }, { a: 70, b: 80 }, { a: 82, b: 92 },
                                                ].map((bar, i) => (
                                                    <div key={i} className="flex-1 flex items-end gap-0.5">
                                                        <div
                                                            className="flex-1 rounded-t-sm"
                                                            style={{
                                                                height: `${bar.a}%`,
                                                                background: 'linear-gradient(to top, #4f46e5, #c3c0ff)',
                                                                opacity: 0.85,
                                                            }}
                                                        />
                                                        <div
                                                            className="flex-1 rounded-t-sm"
                                                            style={{
                                                                height: `${bar.b}%`,
                                                                background: 'linear-gradient(to top, #0d9488, #4fdbc8)',
                                                                opacity: 0.85,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            {/* X-axis labels */}
                                            <div className="flex gap-2 mt-2">
                                                {['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12'].map((w) => (
                                                    <div key={w} className="flex-1 text-center text-[9px] text-[#464555]">{w}</div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Student rows with progress bars */}
                                        <div className="flex flex-col gap-2">
                                            {[
                                                { name: 'Mathematics Final', score: 92, color: '#4fdbc8', pct: '92%' },
                                                { name: 'Physics Mid-Term', score: 76, color: '#c3c0ff', pct: '76%' },
                                                { name: 'English Literature', score: 58, color: '#464555', pct: '58%' },
                                            ].map((row) => (
                                                <div key={row.name} className="flex items-center gap-3 bg-[#1c1b1b] rounded-lg px-4 py-2.5 border border-[#464555]/20">
                                                    <div className="w-6 h-6 rounded-full bg-[#2a2a2a] border border-[#464555]/40 flex items-center justify-center">
                                                        <span className="text-[8px] text-[#c7c4d8]">✓</span>
                                                    </div>
                                                    <span className="text-xs text-[#c7c4d8] w-36 shrink-0">{row.name}</span>
                                                    <div className="flex-1 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{ width: row.pct, background: row.color }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold ml-2" style={{ color: row.color }}>{row.pct}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Bar */}
                <section className="py-16 border-y border-[#464555]/10 bg-[#0e0e0e]/50">
                    <div className="max-w-[1280px] mx-auto px-6 text-center">
                        <p className="text-[#c7c4d8] text-sm font-medium mb-10 uppercase tracking-widest">
                            Trusted by leading institutions
                        </p>
                        <div className="flex flex-wrap justify-center gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="h-8 w-32 bg-[#464555]/40 rounded" />
                            <div className="h-8 w-24 bg-[#464555]/40 rounded" />
                            <div className="h-8 w-36 bg-[#464555]/40 rounded" />
                            <div className="h-8 w-28 bg-[#464555]/40 rounded" />
                            <div className="h-8 w-32 bg-[#464555]/40 rounded" />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-16 px-6 max-w-[1280px] mx-auto">
                    <div className="mb-16 text-center">
                        <h2 className="font-semibold text-3xl text-[#e5e2e1] mb-4">
                            Everything you need for High-Stakes Assessments
                        </h2>
                        <p className="text-[#c7c4d8] text-base">
                            Professional tools designed for speed, security, and scalability.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: 'auto_awesome', color: '#c3c0ff', bg: 'rgba(195,192,255,0.1)', title: 'AI Grading', desc: 'Auto-grade subjective answers with semantic understanding that matches human examiners.' },
                            { icon: 'domain', color: '#4fdbc8', bg: 'rgba(79,219,200,0.1)', title: 'Multi-Tenant', desc: 'Isolated environments for departments, campuses, or sub-organizations with central control.' },
                            { icon: 'quiz', color: '#d0bcff', bg: 'rgba(208,188,255,0.1)', title: 'Flexible Questions', desc: 'Support for coding, math, video-response, and adaptive multiple-choice questions.' },
                            { icon: 'timer', color: '#c3c0ff', bg: 'rgba(195,192,255,0.1)', title: 'Real-Time Timer', desc: 'Dynamic time allocation and auto-submission protocols for synchronous exams.' },
                            { icon: 'gpp_maybe', color: '#ffb4ab', bg: 'rgba(255,180,171,0.1)', title: 'Anti-Cheat Tracking', desc: 'AI-powered face tracking, tab-lock, and behavior analysis to ensure exam integrity.' },
                            { icon: 'bar_chart', color: '#4fdbc8', bg: 'rgba(79,219,200,0.1)', title: 'Result Analytics', desc: 'Deep insights into student performance, question difficulty, and cohort trends.' },
                        ].map((f) => (
                            <div key={f.title} className="glass-card p-10 rounded-xl flex flex-col items-start gap-6 hover:border-[#918fa1] transition-all group">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:opacity-80 transition-opacity"
                                    style={{ background: f.bg }}
                                >
                                    <span className="material-symbols-outlined" style={{ color: f.color }}>{f.icon}</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-xl mb-2 text-[#e5e2e1]">{f.title}</h3>
                                    <p className="text-[#c7c4d8] text-base">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-16 bg-[#1c1b1b]">
                    <div className="max-w-[1280px] mx-auto px-6">
                        <div className="mb-16 text-center">
                            <h2 className="font-semibold text-3xl text-[#e5e2e1] mb-4">Three Steps to Modern Exams</h2>
                            <p className="text-[#c7c4d8] text-base">Streamlined workflow from registration to results.</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-16 items-start relative">
                            <div className="absolute top-8 left-0 w-full h-px bg-[#464555]/30 hidden md:block" />
                            {[
                                { n: '1', title: 'Register', desc: 'Onboard your institution and students in minutes with bulk imports or LMS sync.' },
                                { n: '2', title: 'Create & Publish', desc: 'Build exams using our AI bank or your questions. Schedule with one click.' },
                                { n: '3', title: 'AI Grades', desc: 'Instant grading for objective answers and AI-assisted reviews for essays.' },
                            ].map((step) => (
                                <div key={step.n} className="flex-1 text-center relative z-10">
                                    <div className="w-16 h-16 rounded-full bg-[#4f46e5] text-white flex items-center justify-center mx-auto mb-10 text-2xl font-bold border-4 border-[#1c1b1b]">
                                        {step.n}
                                    </div>
                                    <h3 className="font-semibold text-xl text-[#e5e2e1] mb-4">{step.title}</h3>
                                    <p className="text-[#c7c4d8] text-base">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* For Institutes */}
                <section id="solutions" className="py-16 px-6 max-w-[1280px] mx-auto">
                    <div className="mb-16 text-center">
                        <h2 className="font-semibold text-3xl text-[#e5e2e1] mb-4">Tailored Solutions for Every Learner</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                title: 'K-12 Schools',
                                items: ['Gamified assessments', 'Parent progress tracking', 'Curriculum alignment'],
                            },
                            {
                                title: 'Universities',
                                items: ['Massive scale handling', 'Advanced proctoring', 'Research data export'],
                            },
                            {
                                title: 'Corporate Training',
                                items: ['Skills-based certification', 'Employee performance KPIs', 'White-label portal'],
                            },
                        ].map((s) => (
                            <div key={s.title} className="p-10 bg-[#201f1f] rounded-xl border border-[#464555]">
                                <h3 className="font-semibold text-xl text-[#c3c0ff] mb-6">{s.title}</h3>
                                <ul className="space-y-4 text-[#c7c4d8] text-base">
                                    {s.items.map((item) => (
                                        <li key={item} className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#4fdbc8] text-sm">check_circle</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-16 bg-[#0e0e0e]">
                    <div className="max-w-[1280px] mx-auto px-6">
                        <div className="mb-16 text-center">
                            <h2 className="font-semibold text-3xl text-[#e5e2e1] mb-4">Predictable Credit-Based Pricing</h2>
                            <p className="text-[#c7c4d8] text-base">Pay for what you grade, not for who you host.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                            {/* Free */}
                            <div className="glass-card p-10 rounded-xl flex flex-col h-full">
                                <div className="mb-10">
                                    <span className="text-[#c7c4d8] text-sm font-medium uppercase">Free</span>
                                    <div className="text-5xl font-bold text-[#e5e2e1] mt-2">
                                        $0<span className="text-base font-normal text-[#c7c4d8]">/mo</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-16 flex-grow text-[#c7c4d8] text-base">
                                    {['50 Free Credits /mo', 'Basic Proctoring', 'MCQ Support'].map((f) => (
                                        <li key={f} className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#c3c0ff] text-sm">done</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={register()} className="w-full py-4 border border-[#464555] text-[#e5e2e1] font-bold rounded-lg hover:bg-[#353534]/20 transition-all text-center block">
                                    Get Started
                                </Link>
                            </div>

                            {/* Starter — highlighted */}
                            <div className="ai-border p-10 rounded-xl flex flex-col h-full shadow-2xl scale-105 z-10 bg-[#131313]">
                                <div className="mb-10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#c3c0ff] font-bold text-sm uppercase">Starter</span>
                                        <span className="bg-[#c3c0ff]/10 text-[#c3c0ff] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Popular</span>
                                    </div>
                                    <div className="text-5xl font-bold text-[#e5e2e1] mt-2">
                                        $49<span className="text-base font-normal text-[#c7c4d8]">/mo</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-16 flex-grow text-[#c7c4d8] text-base">
                                    {['500 Credits Included', 'AI-Assisted Grading', 'Subjective Questions', 'Detailed Analytics'].map((f) => (
                                        <li key={f} className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#c3c0ff] text-sm">done</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={register()} className="w-full py-4 bg-[#4f46e5] text-white font-bold rounded-lg hover:opacity-90 transition-all text-center block">
                                    Choose Plan
                                </Link>
                            </div>

                            {/* Pro */}
                            <div className="glass-card p-10 rounded-xl flex flex-col h-full">
                                <div className="mb-10">
                                    <span className="text-[#c7c4d8] text-sm font-medium uppercase">Pro</span>
                                    <div className="text-5xl font-bold text-[#e5e2e1] mt-2">
                                        $199<span className="text-base font-normal text-[#c7c4d8]">/mo</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-16 flex-grow text-[#c7c4d8] text-base">
                                    {['2500 Credits Included', '24/7 Priority Support', 'Custom Integrations', 'White-label Branding'].map((f) => (
                                        <li key={f} className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#c3c0ff] text-sm">done</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <a href="#" className="w-full py-4 border border-[#464555] text-[#e5e2e1] font-bold rounded-lg hover:bg-[#353534]/20 transition-all text-center block">
                                    Contact Sales
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-16 px-6 max-w-[1280px] mx-auto">
                    <div className="mb-16 text-center">
                        <h2 className="font-semibold text-3xl text-[#e5e2e1] mb-4">What institutes are saying</h2>
                        <p className="text-[#c7c4d8] text-base">Trusted by educators and administrators worldwide.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                quote: '"The AI grading component saved our faculty over 40 hours per week during the finals season. The conceptual scoring is incredibly accurate."',
                                name: 'Dr. Sarah Jenkins',
                                role: 'Dean of Sciences, Metro University',
                                initials: 'SJ',
                                avatarBg: 'linear-gradient(135deg, #4f46e5, #c3c0ff)',
                            },
                            {
                                quote: '"We switched for the anti-cheat tracking and stayed for the analytics. The per-student performance data we get is unparalleled."',
                                name: 'Marcus Thorne',
                                role: 'Director of L&D, TechCorp',
                                initials: 'MT',
                                avatarBg: 'linear-gradient(135deg, #0d9488, #4fdbc8)',
                            },
                            {
                                quote: '"Setting up AI Education Studio took less than a day. The multi-tenant architecture is solid and the API is well-documented for our dev team."',
                                name: 'Elena Rodriguez',
                                role: 'CTO, Global Learnings Institute',
                                initials: 'ER',
                                avatarBg: 'linear-gradient(135deg, #6f3dd9, #d0bcff)',
                            },
                        ].map((t) => (
                            <div key={t.name} className="p-10 rounded-xl bg-[#2a2a2a] relative flex flex-col justify-between min-h-[220px]">
                                <span className="material-symbols-outlined text-[#c3c0ff] text-5xl absolute top-4 right-4 opacity-10">
                                    format_quote
                                </span>
                                <p className="text-[#e5e2e1] text-base mb-8 italic relative z-10 leading-relaxed">{t.quote}</p>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                                        style={{ background: t.avatarBg }}
                                    >
                                        {t.initials}
                                    </div>
                                    <div>
                                        <div className="font-bold text-[#e5e2e1] text-sm">{t.name}</div>
                                        <div className="text-[#c7c4d8] text-xs">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="py-16 max-w-3xl mx-auto px-6">
                    <div className="mb-16 text-center">
                        <h2 className="font-semibold text-3xl text-[#e5e2e1]">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            'How accurate is the AI grading?',
                            'Can it detect ChatGPT-generated answers?',
                            'What happens if a student loses internet?',
                            'Does it integrate with Canvas or Moodle?',
                            'Is data stored securely?',
                            'Are there volume discounts for large schools?',
                        ].map((q) => (
                            <div
                                key={q}
                                className="p-6 bg-[#201f1f] rounded-lg border border-[#464555]/30 flex justify-between items-center cursor-pointer hover:bg-[#353534]/50 transition-all"
                            >
                                <span className="font-semibold text-xl text-[#e5e2e1]">{q}</span>
                                <span className="material-symbols-outlined text-[#c7c4d8]">expand_more</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final CTA Banner */}
                <section className="py-16 px-6 max-w-[1280px] mx-auto">
                    <div className="rounded-2xl p-16 text-center bg-gradient-to-br from-[#4f46e5] to-[#6f3dd9] relative overflow-hidden">
                        <h2 className="font-bold text-5xl text-white mb-6 relative z-10">
                            Ready to modernize your exams?
                        </h2>
                        <p className="text-[#dad7ff] text-lg mb-16 max-w-2xl mx-auto relative z-10">
                            Join 500+ institutions already using AI Education Studio to streamline their assessment workflows.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
                            <Link href={register()} className="bg-white text-[#4f46e5] px-10 py-4 rounded-xl font-bold shadow-xl hover:scale-105 transition-all">
                                Get Started Free
                            </Link>
                            <a href="#" className="bg-[#4f46e5]/20 backdrop-blur-md border border-white/30 text-white px-10 py-4 rounded-xl font-bold hover:bg-[#4f46e5]/30 transition-all">
                                Book a Demo
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="w-full py-16 bg-[#0e0e0e] border-t border-[#464555]">
                    <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
                        <div className="col-span-1">
                            <div className="font-semibold text-2xl text-[#c3c0ff] mb-6">AI Education Studio</div>
                            <p className="text-[#c7c4d8] text-base">
                                Empowering education through ethical AI and seamless assessment tools.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-xl text-[#e5e2e1] mb-6">Product</h4>
                            <ul className="space-y-4 text-[#c7c4d8] text-base">
                                {['Features', 'Pricing', 'API Docs', 'LMS Sync'].map((l) => (
                                    <li key={l}><a href="#" className="hover:text-[#c3c0ff] transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-xl text-[#e5e2e1] mb-6">Company</h4>
                            <ul className="space-y-4 text-[#c7c4d8] text-base">
                                {['About Us', 'Contact', 'Success Stories', 'Security'].map((l) => (
                                    <li key={l}><a href="#" className="hover:text-[#c3c0ff] transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-xl text-[#e5e2e1] mb-6">Legal</h4>
                            <ul className="space-y-4 text-[#c7c4d8] text-base">
                                {['Privacy Policy', 'Terms of Service', 'GDPR', 'Cookie Policy'].map((l) => (
                                    <li key={l}><a href="#" className="hover:text-[#c3c0ff] transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="max-w-[1280px] mx-auto px-6 mt-16 pt-6 border-t border-[#464555]/10 text-center text-[#c7c4d8] text-base">
                        © 2024 AI Education Studio. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}
