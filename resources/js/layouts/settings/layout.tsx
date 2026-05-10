import type { PropsWithChildren } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
    return (
        <div className="py-6 max-w-2xl">
            <h1 className="mb-8 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                Settings
            </h1>
            {children}
        </div>
    );
}
