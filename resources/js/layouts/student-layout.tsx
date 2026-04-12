import type { ReactNode } from 'react';

export default function StudentLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-zinc-50">
            <aside className="hidden w-64 border-r border-zinc-200 bg-white p-6 lg:block">
                <h2 className="text-lg font-semibold text-zinc-900">Student Portal</h2>
                <nav className="mt-6 space-y-1">
                    <span className="block rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900">
                        Dashboard
                    </span>
                </nav>
            </aside>
            <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
    );
}
