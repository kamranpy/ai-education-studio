import { Link, usePage } from '@inertiajs/react';
import { Bot, LayoutGrid } from 'lucide-react';
import type { ReactNode } from 'react';

const navItems = [
    { title: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutGrid },
    { title: 'LLM Provider', href: '/super-admin/llm', icon: Bot },
];

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
    const { url } = usePage();

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <aside className="hidden w-64 border-r border-zinc-200 bg-white p-6 lg:block dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Super Admin
                </h2>
                <nav className="mt-6 space-y-1">
                    {navItems.map((item) => {
                        const active = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                                }`}
                            >
                                <item.icon className="size-4" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
            <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
    );
}
