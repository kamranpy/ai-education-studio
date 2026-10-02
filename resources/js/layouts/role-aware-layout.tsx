import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import StudentLayout from '@/layouts/student-layout';
import SuperAdminLayout from '@/layouts/super-admin-layout';

/**
 * Renders the correct role-specific sidebar layout based on the
 * authenticated user's role slug. Used to wrap settings pages so
 * they share the same sidebar as the rest of the app.
 */
export default function RoleAwareLayout({ children }: { children: ReactNode }) {
    const { props } = usePage();
    const role = (props.auth?.user as any)?.role?.slug as string | undefined;

    if (role === 'super_admin') {
        return <SuperAdminLayout>{children}</SuperAdminLayout>;
    }

    if (role === 'student') {
        return <StudentLayout>{children}</StudentLayout>;
    }

    // Default: institute admin
    return <AdminLayout>{children}</AdminLayout>;
}
