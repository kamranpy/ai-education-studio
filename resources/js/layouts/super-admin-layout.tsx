import { Link, usePage } from '@inertiajs/react';
import {
    Bot,
    Building2,
    CreditCard,
    LayoutGrid,
    LogOut,
    Menu,
    Package,
    School,
    Settings,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { index as creditPackagesIndex } from '@/actions/App/Http/Controllers/SuperAdmin/CreditPackageController';
import { index as institutesIndex } from '@/actions/App/Http/Controllers/SuperAdmin/InstituteController';
import { index as billingIndex } from '@/actions/App/Http/Controllers/SuperAdmin/StripeSettingController';
import { ThemeDropdown } from '@/components/theme-dropdown';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserInfo } from '@/components/user-info';
import { logout } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';
import type { User } from '@/types';

const navItems = [
    { title: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutGrid },
    { title: 'Institutes', href: institutesIndex.url(), icon: Building2 },
    { title: 'LLM Provider', href: '/super-admin/llm', icon: Bot },
    { title: 'Billing', href: billingIndex.url(), icon: CreditCard },
    { title: 'Credit Packages', href: creditPackagesIndex.url(), icon: Package },
];

interface NavItemProps {
    item: typeof navItems[0];
    active: boolean;
    onClick?: () => void;
}

function NavItem({ item, active, onClick }: NavItemProps) {
    return (
        <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
            }`}
        >
            <item.icon className="size-5" />
            {item.title}
        </Link>
    );
}

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
    const { url, props } = usePage<{
        auth: { user: User } | null;
    }>();
    const user = props.auth?.user;

    return (
        <>
            {/* Logo / Header */}
            <div className="flex items-center gap-3 px-3 py-4 mb-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
                    <School className="size-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Admin Portal
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Super User</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <NavItem
                        key={item.href}
                        item={item}
                        active={url.startsWith(item.href)}
                        onClick={onItemClick}
                    />
                ))}
            </nav>

            {/* User footer */}
            <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                {user && (
                    <div className="mb-3 px-1">
                        <UserInfo user={user} showEmail />
                    </div>
                )}
                <div className="space-y-1">
                    <Link
                        href={profileEdit()}
                        onClick={onItemClick}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50"
                    >
                        <Settings className="size-5" />
                        Profile
                    </Link>
                    <Link
                        href={logout()}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                        <LogOut className="size-5" />
                        Logout
                    </Link>
                </div>
            </div>
        </>
    );
}

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage();
    const user = props.auth?.user as User | undefined;

    // Get current page title from URL
    const getPageTitle = () => {
        if (url.startsWith('/super-admin/dashboard')) {
            return 'Dashboard';
        }
        if (url.startsWith('/super-admin/institutes')) {
            return 'Institutes';
        }
        if (url.startsWith('/super-admin/llm')) {
            return 'LLM Provider';
        }
        if (url.startsWith('/super-admin/billing')) {
            return 'Billing';
        }
        if (url.startsWith('/super-admin/credit-packages')) {
            return 'Credit Packages';
        }
        return 'Super Admin';
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Desktop Sidebar */}
            <aside className="fixed inset-y-0 left-0 hidden w-[280px] flex-col border-r border-slate-200 bg-white p-4 lg:flex dark:border-slate-800 dark:bg-slate-900">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar (Sheet) */}
            <Sheet>
                <SheetTrigger asChild>
                    <button className="fixed left-4 top-4 z-50 flex size-10 items-center justify-center rounded-lg bg-white shadow-md lg:hidden dark:bg-slate-800">
                        <Menu className="size-5 text-slate-700 dark:text-slate-300" />
                    </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                    <div className="flex h-full flex-col p-4">
                        <SidebarContent onItemClick={() => document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click()} />
                    </div>
                </SheetContent>
            </Sheet>

            <main className="flex-1 lg:ml-[280px]">
                {/* Top Navigation Bar */}
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 lg:px-8">
                    <div className="flex items-center gap-4 lg:ml-0 ml-14">
                        {/* Breadcrumb */}
                        <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex dark:text-slate-400">
                            <span>Admin</span>
                            <span>/</span>
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                {getPageTitle()}
                            </span>
                        </div>
                        {/* Mobile Title */}
                        <h2 className="font-semibold text-slate-900 sm:hidden dark:text-slate-100">
                            {getPageTitle()}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                            <ThemeDropdown />
                        </div>

                        {/* User Avatar */}
                        {user && (
                            <div className="ml-2 flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-700">
                                <div className="hidden text-right sm:block">
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Super Admin
                                    </p>
                                </div>
                                <div className="size-10 overflow-hidden rounded-full border-2 border-indigo-100 dark:border-indigo-900">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`}
                                        alt={user.name}
                                        className="size-full object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <div className="p-4 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
