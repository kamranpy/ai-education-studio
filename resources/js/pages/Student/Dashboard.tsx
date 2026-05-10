import { router } from '@inertiajs/react';
import { useState } from 'react';
import StudentLayout from '@/layouts/student-layout';

// ─── Icons ────────────────────────────────────────────────────────────────────

function AssignmentIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
    );
}

function PendingIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-4h2v2h-2zm0-10h2v8h-2z" />
        </svg>
    );
}

function TaskAltIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 5.18L10.59 16.6l-4.24-4.24 1.41-1.41 2.83 2.83 10-10L22 5.18zm-2.21 5.04c.13.57.21 1.17.21 1.78 0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8c1.58 0 3.04.46 4.28 1.25l1.44-1.44C16.1 2.67 14.13 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-1.19-.22-2.33-.6-3.39l-1.61 1.61z" />
        </svg>
    );
}

function QuizIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 9h-3v3h-2v-3H10V9h3V6h2v3h3v2z" />
        </svg>
    );
}

function ScheduleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
    );
}

function ChevronLeftIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
    );
}

function HistoryIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
        </svg>
    );
}

function CheckCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
    );
}

function SentimentDissatisfiedIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm5-6c-.55 0-1 .45-1 1 0 .55.45 1 1 1s1-.45 1-1c0-.55-.45-1-1-1zm-10 0c-.55 0-1 .45-1 1 0 .55.45 1 1 1s1-.45 1-1c0-.55-.45-1-1-1zm5 2c-2.33 0-4.32 1.45-5.12 3.5h1.67c.69-1.19 1.97-2 3.45-2s2.75.81 3.45 2h1.67c-.8-2.05-2.79-3.5-5.12-3.5z" />
        </svg>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Exam {
    id: number;
    title: string;
    description: string | null;
    time_limit_minutes: number | null;
    questions_count: number;
    subject_name?: string | null;
    class_name?: string | null;
}

interface PaginatedExams {
    data: Exam[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Props {
    exams: PaginatedExams;
    inProgressExamIds: number[];
    submittedExamIds: number[];
}

// ─── Subject colour palette ───────────────────────────────────────────────────

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    mathematics: { bg: 'rgba(79, 70, 229, 0.12)', text: '#c3c0ff', border: 'rgba(79, 70, 229, 0.5)' },
    physics:     { bg: 'rgba(79, 219, 200, 0.12)', text: '#4fdbc8', border: 'rgba(79, 219, 200, 0.5)' },
    chemistry:   { bg: 'rgba(255, 182, 149, 0.12)', text: '#ffb695', border: 'rgba(255, 182, 149, 0.5)' },
    biology:     { bg: 'rgba(113, 248, 228, 0.12)', text: '#71f8e4', border: 'rgba(113, 248, 228, 0.5)' },
    default:     { bg: 'rgba(195, 192, 255, 0.12)', text: '#c3c0ff', border: 'rgba(195, 192, 255, 0.5)' },
};

function getSubjectColor(subject: string | null | undefined) {
    if (!subject) {
return SUBJECT_COLORS.default;
}

    const key = subject.toLowerCase();

    return SUBJECT_COLORS[key] ?? SUBJECT_COLORS.default;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    valueColor: string;
    iconBg: string;
    iconColor: string;
}

function StatCard({ label, value, icon, valueColor, iconBg, iconColor }: StatCardProps) {
    return (
        <div
            className="rounded-xl p-6 flex items-center justify-between"
            style={{
                background: 'linear-gradient(180deg, #1C1B1B 0%, #161515 100%)',
                border: '1px solid rgba(70, 69, 85, 0.3)',
            }}
        >
            <div>
                <p
                    className="text-xs font-medium uppercase tracking-wider mb-1"
                    style={{ color: '#c7c4d8' }}
                >
                    {label}
                </p>
                <p
                    className="text-5xl font-bold"
                    style={{ color: valueColor, letterSpacing: '-0.02em' }}
                >
                    {String(value).padStart(2, '0')}
                </p>
            </div>
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: iconBg, color: iconColor }}
            >
                {icon}
            </div>
        </div>
    );
}

// ─── Exam Card ────────────────────────────────────────────────────────────────

interface ExamCardProps {
    exam: Exam;
    isInProgress: boolean;
    isSubmitted: boolean;
    onStart: (id: number) => void;
}

function ExamCard({ exam, isInProgress, isSubmitted, onStart }: ExamCardProps) {
    const subjectColor = getSubjectColor(exam.subject_name);

    return (
        <div
            className="rounded-xl p-6 flex flex-col group transition-colors duration-200"
            style={{
                background: 'linear-gradient(180deg, #1C1B1B 0%, #161515 100%)',
                border: '1px solid rgba(70, 69, 85, 0.3)',
                opacity: isSubmitted ? 0.75 : 1,
            }}
            onMouseEnter={(e) => {
                if (!isSubmitted) {
                    (e.currentTarget as HTMLElement).style.borderColor =
                        isInProgress ? 'rgba(255, 182, 149, 0.5)' : subjectColor.border;
                }
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                    'rgba(70, 69, 85, 0.3)';
            }}
        >
            {/* Header row: badges + status */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-wrap gap-2">
                    {exam.subject_name && (
                        <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                                background: subjectColor.bg,
                                color: subjectColor.text,
                            }}
                        >
                            {exam.subject_name}
                        </span>
                    )}
                    {exam.class_name && (
                        <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                                background: '#35343e',
                                color: '#c7c4d8',
                            }}
                        >
                            {exam.class_name}
                        </span>
                    )}
                </div>

                {isSubmitted && (
                    <span
                        className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: '#71f8e4' }}
                    >
                        <CheckCircleIcon />
                        Done
                    </span>
                )}
                {isInProgress && !isSubmitted && (
                    <span
                        className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: '#ffb695' }}
                    >
                        <HistoryIcon />
                        In Progress
                    </span>
                )}
                {!isInProgress && !isSubmitted && (
                    <span
                        className="text-xs font-medium"
                        style={{ color: '#4fdbc8' }}
                    >
                        New
                    </span>
                )}
            </div>

            {/* Title */}
            <h3
                className="text-base font-semibold mb-2 transition-colors duration-200"
                style={{ color: isSubmitted ? '#c7c4d8' : '#e4e1ee' }}
            >
                {exam.title}
            </h3>

            {/* Description */}
            {exam.description && (
                <p
                    className="text-sm mb-4 line-clamp-2"
                    style={{ color: '#c7c4d8' }}
                >
                    {exam.description}
                </p>
            )}

            {/* Meta */}
            <div
                className="flex items-center gap-4 text-sm mb-6"
                style={{ color: isSubmitted ? 'rgba(199, 196, 216, 0.6)' : '#c7c4d8' }}
            >
                <span className="flex items-center gap-1">
                    <QuizIcon />
                    {exam.questions_count} Questions
                </span>
                {exam.time_limit_minutes && (
                    <span className="flex items-center gap-1">
                        <ScheduleIcon />
                        {exam.time_limit_minutes} Min
                    </span>
                )}
            </div>

            {/* CTA */}
            <div className="mt-auto">
                {isSubmitted ? (
                    <button
                        disabled
                        className="w-full py-3 px-4 rounded-lg text-sm font-bold cursor-not-allowed"
                        style={{
                            background: '#2a2933',
                            color: 'rgba(199, 196, 216, 0.5)',
                        }}
                    >
                        Completed
                    </button>
                ) : isInProgress ? (
                    <>
                        <div className="flex justify-between items-center text-xs font-medium mb-2">
                            <span style={{ color: '#c7c4d8' }}>Progress</span>
                            <span style={{ color: '#ffb695' }}>In Progress</span>
                        </div>
                        <div
                            className="w-full rounded-full h-1.5 mb-4"
                            style={{ background: '#35343e' }}
                        >
                            <div
                                className="h-1.5 rounded-full"
                                style={{ width: '30%', background: '#ffb695' }}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => onStart(exam.id)}
                            className="w-full py-3 px-4 rounded-lg text-sm font-bold transition-all active:scale-[0.98]"
                            style={{
                                border: '1px solid #ffb695',
                                color: '#ffb695',
                                background: 'transparent',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background =
                                    'rgba(255, 182, 149, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background =
                                    'transparent';
                            }}
                        >
                            Resume Exam
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => onStart(exam.id)}
                        className="w-full py-3 px-4 rounded-lg text-sm font-bold transition-all active:scale-[0.98]"
                        style={{
                            background: '#4f46e5',
                            color: '#dad7ff',
                            boxShadow: '0px 4px 20px rgba(79, 70, 229, 0.25)',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                                '#4338ca';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                                '#4f46e5';
                        }}
                    >
                        Start Exam
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

function Dashboard({ exams, inProgressExamIds, submittedExamIds }: Props) {
    const [search, setSearch] = useState('');

    const handleStartExam = (examId: number) => {
        router.post(`/student/exams/${examId}/attempts`);
    };

    const filteredExams = exams.data.filter((exam) => {
        if (!search.trim()) {
return true;
}

        const q = search.toLowerCase();

        return (
            exam.title.toLowerCase().includes(q) ||
            (exam.subject_name ?? '').toLowerCase().includes(q) ||
            (exam.class_name ?? '').toLowerCase().includes(q)
        );
    });

    const availableCount = exams.total;
    const inProgressCount = inProgressExamIds.length;
    const completedCount = submittedExamIds.length;

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1
                        className="text-3xl font-semibold"
                        style={{ color: '#e4e1ee', letterSpacing: '-0.01em' }}
                    >
                        Available Exams
                    </h1>
                    <p className="mt-1 text-base" style={{ color: '#c7c4d8' }}>
                        Select an exam to begin your assessment.
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <span
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: '#c7c4d8' }}
                    >
                        <SearchIcon />
                    </span>
                    <input
                        type="text"
                        placeholder="Search exams..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
                        style={{
                            background: '#0e0d16',
                            border: '1px solid rgba(70, 69, 85, 0.3)',
                            color: '#e4e1ee',
                        }}
                        onFocus={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor =
                                '#4f46e5';
                        }}
                        onBlur={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor =
                                'rgba(70, 69, 85, 0.3)';
                        }}
                    />
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Exams Available"
                    value={availableCount}
                    icon={<AssignmentIcon />}
                    valueColor="#4fdbc8"
                    iconBg="rgba(79, 219, 200, 0.1)"
                    iconColor="#4fdbc8"
                />
                <StatCard
                    label="In Progress"
                    value={inProgressCount}
                    icon={<PendingIcon />}
                    valueColor="#ffb695"
                    iconBg="rgba(255, 182, 149, 0.1)"
                    iconColor="#ffb695"
                />
                <StatCard
                    label="Completed"
                    value={completedCount}
                    icon={<TaskAltIcon />}
                    valueColor="#71f8e4"
                    iconBg="rgba(113, 248, 228, 0.1)"
                    iconColor="#71f8e4"
                />
            </div>

            {/* Exam grid */}
            {filteredExams.length === 0 ? (
                <div
                    className="rounded-xl p-12 flex flex-col items-center justify-center text-center"
                    style={{
                        border: '2px dashed rgba(70, 69, 85, 0.3)',
                    }}
                >
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                        style={{ background: '#35343e', color: '#c7c4d8' }}
                    >
                        <SentimentDissatisfiedIcon />
                    </div>
                    <p
                        className="text-base font-medium"
                        style={{ color: '#c7c4d8' }}
                    >
                        {search ? 'No exams match your search' : 'No exams available'}
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'rgba(199, 196, 216, 0.6)' }}>
                        {search ? 'Try a different search term.' : 'Check back later for new assignments.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExams.map((exam) => (
                        <ExamCard
                            key={exam.id}
                            exam={exam}
                            isInProgress={inProgressExamIds.includes(exam.id)}
                            isSubmitted={submittedExamIds.includes(exam.id)}
                            onStart={handleStartExam}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {exams.last_page > 1 && (
                <div
                    className="flex items-center justify-between pt-8 mt-4"
                    style={{ borderTop: '1px solid rgba(70, 69, 85, 0.2)' }}
                >
                    <p className="text-sm" style={{ color: '#c7c4d8' }}>
                        Showing {(exams.current_page - 1) * exams.per_page + 1} to{' '}
                        {Math.min(exams.current_page * exams.per_page, exams.total)} of{' '}
                        {exams.total} exams
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={!exams.prev_page_url}
                            onClick={() =>
                                exams.prev_page_url &&
                                router.get(exams.prev_page_url)
                            }
                            className="p-2 rounded-lg transition-colors disabled:opacity-30"
                            style={{
                                border: '1px solid rgba(70, 69, 85, 0.3)',
                                color: '#c7c4d8',
                            }}
                        >
                            <ChevronLeftIcon />
                        </button>

                        {Array.from({ length: exams.last_page }, (_, i) => i + 1).map(
                            (page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() =>
                                        router.get(
                                            `/student/dashboard?page=${page}`,
                                        )
                                    }
                                    className="w-10 h-10 rounded-lg text-sm font-bold transition-colors"
                                    style={
                                        page === exams.current_page
                                            ? {
                                                  background: '#c3c0ff',
                                                  color: '#1d00a5',
                                              }
                                            : {
                                                  border: '1px solid rgba(70, 69, 85, 0.3)',
                                                  color: '#c7c4d8',
                                              }
                                    }
                                >
                                    {page}
                                </button>
                            ),
                        )}

                        <button
                            type="button"
                            disabled={!exams.next_page_url}
                            onClick={() =>
                                exams.next_page_url &&
                                router.get(exams.next_page_url)
                            }
                            className="p-2 rounded-lg transition-colors disabled:opacity-30"
                            style={{
                                border: '1px solid rgba(70, 69, 85, 0.3)',
                                color: '#c7c4d8',
                            }}
                        >
                            <ChevronRightIcon />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <StudentLayout>{page}</StudentLayout>
);

export default Dashboard;
