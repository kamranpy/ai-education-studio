import { Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Edit3,
    ListChecks,
    PenLine,
    Save,
    Sparkles,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { index as attemptsIndex } from '@/actions/App/Http/Controllers/Admin/ExamAttemptAdminController';
import { show as examsShow } from '@/actions/App/Http/Controllers/Admin/ExamController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';

interface Question {
    id: number;
    type: string;
    text: string;
    points: number;
    grading_guidelines: string | null;
    choices: Array<{ id: number; text: string; is_correct: boolean }>;
}

interface Override {
    id: number;
    from_score: number | null;
    to_score: number;
    comment: string | null;
    actor: { id: string; name: string };
    created_at: string;
}

interface Answer {
    id: number;
    question_id: number;
    question: Question;
    answer_data: Record<string, unknown> | null;
    ai_score: number | null;
    ai_confidence: number | null;
    ai_explanation: string | null;
    ai_axes: Record<string, number> | null;
    ai_provider: string | null;
    ai_model: string | null;
    tokens_in: number | null;
    tokens_out: number | null;
    override_score: number | null;
    override_comment: string | null;
    status: string;
    overrides: Override[];
    final_score: number | null;
}

interface Attempt {
    id: number;
    user: { id: string; name: string; email: string };
    status: string;
    submitted_at: string | null;
    answers: Answer[];
    total_points: number;
    final_score: number;
}

interface Props {
    exam: { id: number; title: string; passing_score: number };
    attempt: Attempt;
}

function questionTypeIcon(type: string) {
    switch (type) {
        case 'mcq':
            return <ListChecks className="size-4" />;
        case 'true_false':
            return <CheckCircle2 className="size-4" />;
        case 'written_answer':
            return <PenLine className="size-4" />;
        default:
            return null;
    }
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'grading':
            return (
                <Badge className="gap-1 bg-[#dec56f]/20 text-[#fbe188] border-[#fbe188]/30">
                    <Sparkles className="size-3 animate-pulse" />
                    AI Grading
                </Badge>
            );
        case 'needs_review':
            return (
                <Badge className="bg-[#ffb4ab]/20 text-[#ffb4ab] border-[#ffb4ab]/30">
                    <AlertTriangle className="mr-1 size-3" />
                    Needs Review
                </Badge>
            );
        case 'graded':
            return (
                <Badge className="bg-[#03b4a2]/20 text-[#4fdbc8] border-[#4fdbc8]/30">
                    <CheckCircle2 className="mr-1 size-3" />
                    Graded
                </Badge>
            );
        default:
            return <Badge className="bg-[#918fa1]/20 text-[#918fa1]">{status}</Badge>;
    }
}

function ConfidenceBadge({ confidence }: { confidence: number | null }) {
    if (confidence === null) {
        return null;
    }

    const value = typeof confidence === 'string' ? parseFloat(confidence) : confidence;

    if (isNaN(value)) {
        return null;
    }

    if (value >= 0.85) {
        return <span className="text-[#4fdbc8] text-sm font-medium">High Confidence ({Math.round(value * 100)}%)</span>;
    }

    if (value >= 0.6) {
        return <span className="text-[#fbe188] text-sm font-medium">Medium Confidence ({Math.round(value * 100)}%)</span>;
    }

    return <span className="text-[#ffb4ab] text-sm font-medium">Low Confidence ({Math.round(value * 100)}%)</span>;
}

function AttemptsShow({ exam, attempt }: Props) {
    const [editingAnswer, setEditingAnswer] = useState<number | null>(null);
    const { data, setData, processing } = useForm({
        answer_id: 0,
        override_score: 0,
        override_comment: '',
    });

    const passed = attempt.final_score >= exam.passing_score;

    function startEdit(answer: Answer) {
        setEditingAnswer(answer.id);
        const currentScore = answer.final_score ?? answer.ai_score ?? 0;
        const percentage = answer.question.points > 0 ? (currentScore / answer.question.points) * 100 : 0;
        setData({
            answer_id: answer.id,
            override_score: Math.round(percentage),
            override_comment: answer.override_comment ?? '',
        });
    }

    function saveOverride(answer: Answer) {
        const points = answer.question.points;
        const percentage = data.override_score;
        const pointScore = (percentage / 100) * points;

        // Use Inertia's router directly with properly formatted data
        router.post(`/admin/exams/${exam.id}/attempts/${attempt.id}/override`, {
            answer_id: data.answer_id,
            override_score: pointScore,
            override_comment: data.override_comment,
        }, {
            onSuccess: () => {
                setEditingAnswer(null);
            },
            onError: (errors) => {
                console.error('Override failed:', errors);
            },
            preserveScroll: true,
        });
    }

    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#918fa1] mb-3">
                    <Link href={examsShow.url(exam.id)} className="hover:text-[#c3c0ff] transition-colors">
                        {exam.title}
                    </Link>
                    <span className="text-[#c3c0ff]">/</span>
                    <Link href={attemptsIndex.url({ exam: exam.id })} className="hover:text-[#c3c0ff] transition-colors">
                        Attempts
                    </Link>
                    <span className="text-[#c3c0ff]">/</span>
                    <span className="text-[#c3c0ff]">Review</span>
                </nav>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#c3c0ff]/20 to-[#4fdbc8]/20 flex items-center justify-center">
                            <User className="size-7 text-[#c3c0ff]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-[#e5e2e1]">{attempt.user.name}</h1>
                            <p className="text-[#918fa1]">{attempt.user.email}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <StatusBadge status={attempt.status} />
                                {attempt.submitted_at && (
                                    <span className="text-sm text-[#918fa1] flex items-center gap-1">
                                        <Clock className="size-3" />
                                        {new Date(attempt.submitted_at).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div
                        className="rounded-xl px-6 py-4 text-center"
                        style={{
                            background: passed
                                ? 'rgba(3, 180, 162, 0.15)'
                                : 'rgba(255, 180, 171, 0.15)',
                            border: `1px solid ${passed ? 'rgba(79, 219, 200, 0.3)' : 'rgba(255, 180, 171, 0.3)'}`,
                        }}
                    >
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: passed ? '#4fdbc8' : '#ffb4ab' }}>
                            {passed ? 'PASSED' : 'FAILED'}
                        </p>
                        <p className="text-3xl font-bold" style={{ color: passed ? '#4fdbc8' : '#ffb4ab' }}>
                            {attempt.final_score.toFixed(1)}%
                        </p>
                        <p className="text-xs text-[#918fa1] mt-1">
                            Passing: {exam.passing_score}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Answers List */}
            <div className="space-y-6">
                {attempt.answers.map((answer, idx) => (
                    <AnswerCard
                        key={answer.id}
                        answer={answer}
                        index={idx}
                        passingScore={exam.passing_score}
                        isEditing={editingAnswer === answer.id}
                        onStartEdit={() => startEdit(answer)}
                        onSave={() => saveOverride(answer)}
                        onCancel={() => setEditingAnswer(null)}
                        editData={data}
                        setEditData={setData}
                        processing={processing}
                    />
                ))}
            </div>

            {/* Back Button */}
            <div className="mt-8 flex justify-center">
                <Button
                    asChild
                    className="bg-transparent border border-[#918fa1]/30 text-[#918fa1] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]"
                >
                    <Link href={attemptsIndex.url({ exam: exam.id })}>
                        <ArrowLeft className="mr-2 size-4" />
                        Back to Attempts
                    </Link>
                </Button>
            </div>
        </>
    );
}

function AnswerCard({
    answer,
    index,
    passingScore,
    isEditing,
    onStartEdit,
    onSave,
    onCancel,
    editData,
    setEditData,
    processing,
}: {
    answer: Answer;
    index: number;
    passingScore: number;
    isEditing: boolean;
    onStartEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    editData: { override_score: number; override_comment: string };
    setEditData: (data: { override_score: number; override_comment: string }) => void;
    processing: boolean;
}) {
    const [showDetails, setShowDetails] = useState(false);

    const answerText = answer.answer_data?.answer_text as string | undefined;
    const selectedChoice = answer.answer_data?.selected_choice as number | undefined;
    const isCorrect = answer.answer_data?.is_correct as boolean | undefined;

    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{
                background: 'rgba(26, 26, 26, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(146, 143, 154, 0.25)',
            }}
        >
            {/* Answer Header */}
            <div className="px-6 py-4 border-b border-[#918fa1]/20">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <span className="flex items-center gap-2 text-[#918fa1] mt-1">
                            {questionTypeIcon(answer.question.type)}
                        </span>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-[#918fa1]">Q{index + 1}</span>
                                <StatusBadge status={answer.status} />
                                <ConfidenceBadge confidence={answer.ai_confidence} />
                            </div>
                            <p className="text-[#e5e2e1] font-medium">{answer.question.text}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        {(() => {
                            const score = answer.final_score ?? answer.ai_score ?? answer.override_score ?? 0;
                            const percentage = answer.question.points > 0 ? (score / answer.question.points) * 100 : 0;

                            return (
                                <>
                                    <p className="text-2xl font-bold" style={{ color: percentage >= passingScore ? '#4fdbc8' : '#ffb4ab' }}>
                                        {percentage.toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-[#918fa1]">of {answer.question.points} points</p>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Answer Content */}
            <div className="px-6 py-4">
                {/* Student Answer */}
                <div className="mb-4">
                    <h4 className="text-xs font-semibold text-[#918fa1] uppercase tracking-wider mb-2 flex items-center gap-2">
                        <User className="size-3" />
                        Student Answer
                    </h4>
                    {answer.question.type === 'written_answer' ? (
                        <div className="bg-[#201f1f] rounded-lg p-4 border border-[#918fa1]/20">
                            <p className="text-[#e5e2e1] whitespace-pre-wrap">{answerText || 'No answer provided'}</p>
                        </div>
                    ) : (
                        <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                            isCorrect
                                ? 'bg-[#03b4a2]/10 border-[#4fdbc8]/30 text-[#4fdbc8]'
                                : 'bg-[#93000a]/10 border-[#ffb4ab]/30 text-[#ffb4ab]'
                        }`}>
                            {isCorrect ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                            <span className="font-medium">
                                {answer.question.choices.find(c => c.id === selectedChoice)?.text || 'No answer selected'}
                            </span>
                        </div>
                    )}
                </div>

                {/* AI Evaluation (for written answers) */}
                {answer.question.type === 'written_answer' && answer.ai_explanation && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold text-[#c3c0ff] uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Sparkles className="size-3" />
                            AI Evaluation
                        </h4>
                        <div className="bg-[#201f1f]/50 rounded-lg p-4 border border-[#c3c0ff]/20">
                            <p className="text-sm text-[#c7c4d8] mb-3">{answer.ai_explanation}</p>
                            {answer.ai_axes && Object.keys(answer.ai_axes).length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {Object.entries(answer.ai_axes).map(([axis, score]) => (
                                        <div key={axis} className="bg-[#0e0e0e] rounded-lg p-2 text-center">
                                            <p className="text-xs text-[#918fa1] capitalize">{axis.replace('_', ' ')}</p>
                                            <p className="text-sm font-semibold" style={{ color: score >= 0.7 ? '#4fdbc8' : score >= 0.4 ? '#fbe188' : '#ffb4ab' }}>
                                                {Math.round(score * 100)}%
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Grading Guidelines */}
                {answer.question.grading_guidelines && (
                    <div className="mb-4">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-xs font-semibold text-[#918fa1] uppercase tracking-wider mb-2 hover:text-[#c3c0ff] transition-colors"
                        >
                            {showDetails ? '▼' : '▶'} Grading Guidelines
                        </button>
                        {showDetails && (
                            <div className="bg-[#201f1f] rounded-lg p-4 border border-[#918fa1]/20">
                                <p className="text-sm text-[#c7c4d8] whitespace-pre-wrap">{answer.question.grading_guidelines}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Override Section */}
                <div className="border-t border-[#918fa1]/20 pt-4">
                    {answer.overrides.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-[#918fa1] uppercase tracking-wider mb-2">
                                Override History
                            </h4>
                            <div className="space-y-2">
                                {answer.overrides.map((override) => {
                                    const questionPoints = answer.question.points;
                                    const fromPoints = override.from_score !== null ? Number(override.from_score) : null;
                                    const toPoints = Number(override.to_score);
                                    const fromPercentage = fromPoints !== null && questionPoints > 0 ? (fromPoints / questionPoints) * 100 : null;
                                    const toPercentage = questionPoints > 0 ? (toPoints / questionPoints) * 100 : 0;

                                    return (
                                        <div key={override.id} className="flex items-center gap-3 text-sm">
                                            <span className="text-[#918fa1]">{override.actor.name}</span>
                                            <span className="text-[#c7c4d8]">
                                                {fromPercentage !== null ? fromPercentage.toFixed(1) : '—'}% → {toPercentage.toFixed(1)}%
                                            </span>
                                            {override.comment && (
                                                <span className="text-[#918fa1] italic">"{override.comment}"</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {isEditing ? (
                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs font-semibold text-[#918fa1] uppercase tracking-wider">
                                    Override Score (%)
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={editData.override_score}
                                    onChange={(e) => setEditData({ ...editData, override_score: parseFloat(e.target.value) || 0 })}
                                    className="w-32 bg-[#201f1f] border-[#918fa1]/30 text-[#e5e2e1] focus:border-[#c3c0ff]"
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-semibold text-[#918fa1] uppercase tracking-wider">
                                    Comment (Optional)
                                </Label>
                                <Textarea
                                    value={editData.override_comment}
                                    onChange={(e) => setEditData({ ...editData, override_comment: e.target.value })}
                                    placeholder="Reason for override..."
                                    rows={2}
                                    className="!bg-[#201f1f] border-[#918fa1]/30 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:border-[#c3c0ff] focus:!bg-[#201f1f]"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={onSave}
                                    disabled={processing}
                                    className="bg-[#c3c0ff] text-[#161349] hover:opacity-90"
                                >
                                    <Save className="mr-2 size-4" />
                                    {processing ? 'Saving...' : 'Save Override'}
                                </Button>
                                <Button
                                    onClick={onCancel}
                                    className="bg-transparent border border-[#918fa1]/30 text-[#918fa1] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            onClick={onStartEdit}
                            className="bg-transparent border border-[#c3c0ff]/40 text-[#c3c0ff] hover:bg-[#c3c0ff]/10"
                        >
                            <Edit3 className="mr-2 size-4" />
                            Override Score
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

AttemptsShow.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default AttemptsShow;
