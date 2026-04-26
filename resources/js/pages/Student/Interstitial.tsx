import StudentLayout from '@/layouts/student-layout';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
    exam: { id: number; title: string };
    attempt: { id: number; status: string };
}

function Interstitial({ exam, attempt }: Props) {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(
        null,
    );

    useEffect(() => {
        // Poll every 5 seconds until status leaves 'grading'
        intervalRef.current = setInterval(() => {
            if (document.visibilityState === 'visible') {
                router.reload({ only: ['attempt'] });
            }
        }, 5000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Auto-redirect when grading completes
    useEffect(() => {
        if (attempt.status !== 'grading') {
            router.visit(
                `/student/exams/${exam.id}/attempts/${attempt.id}/results`,
            );
        }
    }, [attempt.status, exam.id, attempt.id]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <Card className="w-full max-w-md text-center">
                <CardContent className="space-y-6 py-12">
                    <Loader2 className="mx-auto size-12 animate-spin text-muted-foreground" />

                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Exam submitted
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            We're grading your answers now. Your results
                            will appear in a moment.
                        </p>
                    </div>

                    {/* Skeleton placeholder for results */}
                    <div className="space-y-3 pt-4">
                        <Skeleton className="mx-auto h-4 w-3/4" />
                        <Skeleton className="mx-auto h-4 w-1/2" />
                        <Skeleton className="mx-auto h-4 w-2/3" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

Interstitial.layout = (page: React.ReactNode) => (
    <StudentLayout>{page}</StudentLayout>
);

export default Interstitial;
