import { Head, usePage } from '@inertiajs/react';
import { Cog } from 'lucide-react';
import type { SiteConfig } from '@/types/global';

export default function Maintenance() {
    const { props } = usePage();
    const site = props.site as SiteConfig | undefined;
    const siteName = site?.name ?? 'AI Education Studio';

    return (
        <>
            <Head title={`Maintenance · ${siteName}`} />
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131313]">
                <div className="flex flex-col items-center gap-6 px-6 text-center">
                    {/* Animated gears */}
                    <div className="relative flex items-center justify-center">
                        <Cog
                            className="size-20 text-[#c3c0ff]/40"
                            style={{ animation: 'spin 8s linear infinite' }}
                        />
                        <Cog
                            className="absolute -right-6 -bottom-4 size-12 text-[#c3c0ff]/25"
                            style={{ animation: 'spin 6s linear infinite reverse' }}
                        />
                        <Cog
                            className="absolute -left-5 -bottom-3 size-10 text-[#c3c0ff]/20"
                            style={{ animation: 'spin 10s linear infinite' }}
                        />
                    </div>

                    {/* Site name */}
                    {site?.logo_url ? (
                        <img
                            src={site.logo_url}
                            alt={siteName}
                            className="h-10 w-auto object-contain opacity-80"
                        />
                    ) : (
                        <h1 className="text-xl font-semibold tracking-tight text-[#e5e2e1]">
                            {siteName}
                        </h1>
                    )}

                    {/* Message */}
                    <div className="max-w-sm space-y-2">
                        <h2 className="text-lg font-semibold text-[#e5e2e1]">
                            We&apos;ll be back soon
                        </h2>
                        <p className="text-sm leading-relaxed text-[#c7c4d8]">
                            We&apos;re currently performing scheduled maintenance.
                            Please check back in a little while.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

// Prevent any layout wrapper — render full-screen standalone
Maintenance.layout = undefined;
