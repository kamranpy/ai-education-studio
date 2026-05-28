import type { Auth } from '@/types/auth';

export interface SiteConfig {
    name: string;
    tagline: string;
    logo_url: string | null;
    favicon_url: string | null;
    support_email: string;
    social_facebook: string;
    social_twitter: string;
    social_linkedin: string;
    social_instagram: string;
    footer_text: string;
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            site: SiteConfig;
            canRegister: boolean;
            [key: string]: unknown;
        };
    }
}
