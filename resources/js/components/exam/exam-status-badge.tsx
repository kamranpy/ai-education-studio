import { Badge } from '@/components/ui/badge';

type ExamStatus = 'draft' | 'published' | 'locked';

const statusConfig: Record<
    ExamStatus,
    { label: string; className: string; variant: 'secondary' | 'default' | 'outline' }
> = {
    draft: {
        label: 'Draft',
        variant: 'secondary',
        className: '',
    },
    published: {
        label: 'Published',
        variant: 'default',
        className:
            'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    },
    locked: {
        label: 'Locked',
        variant: 'outline',
        className:
            'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-200',
    },
};

export function ExamStatusBadge({ status }: { status: string }) {
    const config = statusConfig[status as ExamStatus] ?? {
        label: status,
        variant: 'secondary' as const,
        className: '',
    };

    return (
        <Badge
            variant={config.variant}
            className={config.className}
            role="status"
        >
            {config.label}
        </Badge>
    );
}
