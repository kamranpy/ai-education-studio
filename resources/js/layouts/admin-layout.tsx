import { Link, usePage } from '@inertiajs/react';
import { CreditCard, FileText, LayoutGrid, LogOut, Settings, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { index as examsIndex } from '@/actions/App/Http/Controllers/Admin/ExamController';
import { index as usersIndex } from '@/actions/App/Http/Controllers/Admin/UserController';
import { index as billingIndex } from '@/actions/App/Http/Controllers/Institute/BillingController';
import { ThemeDropdown } from '@/components/theme-dropdown';
import { UserInfo } from '@/components/user-info';
import { logout } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { edit as profileEdit } from '@/routes/profile';
import type { User } from '@/types';

const navItems = [
    { title: 'Dashboard', href: adminDashboard.url(), icon: LayoutGrid },
    { title: 'Users', href: usersIndex.url(), icon: Users },
    { title: 'Exams', href: examsIndex.url(), icon: FileText },
    { title: 'Billing', href: billingIndex.url(), icon: CreditCard },
    { title: 'Settings', href: profileEdit.url(), icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage();
    const user = props.auth?.user as User | undefined;

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-zinc-200 bg-white p-6 lg:flex dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Institute Admin
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
            </aside>
            <main className="flex-1 lg:ml-64">
                <div className="flex h-12 items-center justify-end border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
                    <ThemeDropdown />
                </div>
                <div className="p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
