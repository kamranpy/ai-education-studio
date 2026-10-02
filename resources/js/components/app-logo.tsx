import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { SiteConfig } from '@/types/global';

export default function AppLogo() {
    const { site } = usePage<{ site: SiteConfig }>().props;

    return (
        <>
            {site?.logo_url ? (
                <img
                    src={site.logo_url}
                    alt={site.name}
                    className="h-8 w-auto object-contain"
                />
            ) : (
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                </div>
            )}
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {site?.name || 'AI Education Studio'}
                </span>
            </div>
        </>
    );
}
