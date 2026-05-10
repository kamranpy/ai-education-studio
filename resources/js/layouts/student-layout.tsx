import { Link, usePage } from '@inertiajs/react';
import { Award, LayoutGrid, LogOut, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { index as resultsIndex } from '@/actions/App/Http/Controllers/Student/ResultsController';
import { UserInfo } from '@/components/user-info';
import { logout } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';
import type { User } from '@/types';

const navItems = [
    { title: 'Dashboard', href: '/student/dashboard', icon: LayoutGrid },
    { title: 'Results', href: resultsIndex.url(), icon: Award },
];

export default function StudentLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage();
    const user = props.auth?.user as User | undefined;

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-zinc-200 bg-white p-6 lg:flex dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Student Portal
                </h2>
                <nav className="mt-6 flex-1 space-y-1">
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

                {/* User footer */}
                <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                    {user && (
                        <div className="mb-3 px-1">
                            <UserInfo user={user} showEmail />
                        </div>
                    )}
                    <div className="space-y-1">
                        <Link
                            href={profileEdit()}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                        >
                            <Settings className="size-4" />
                            Settings
                        </Link>
                        <Link
                            href={logout()}
                            method="post"
                            as="button"
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                        >
                            <LogOut className="size-4" />
                            Log out
                        </Link>
                    </div>
                </div>
            </aside>
            <main className="flex-1 p-6 lg:p-8 lg:ml-64">{children}</main>
        </div>
    );
}
