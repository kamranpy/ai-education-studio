import { Head, Link, useForm } from '@inertiajs/react';
import {
    ChevronDown,
    Clock,
    GripVertical,
    ListChecks,
    Loader2,
    Lock,
    PenLine,
    Plus,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
    index as examsIndex,
    store as examsStore,
    update as examsUpdate,
} from '@/actions/App/Http/Controllers/Admin/ExamController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';

type QuestionChoice = {
    id: number;
    text: string;
    is_correct: boolean;
};

type Question = {
    id: number;
    type: 'mcq' | 'true_false' | 'written_answer';
    text: string;
    points: number;
    grading_guidelines: string | null;
    order: number;
    choices: QuestionChoice[];
};

type Exam = {
    id: number;
    title: string;
    description: string | null;
    class_name: string | null;
    subject_name: string | null;
    status: string;
    time_limit_minutes: number | null;
    passing_score: number;
    evaluation_strategy: 'instant' | 'manual';
    questions: Question[];
};

type QuestionType = 'mcq' | 'true_false' | 'written_answer';

type QuestionData = {
    type: QuestionType;
    text: string;
    points: number;
    choices: { text: string; is_correct: boolean }[];
    grading_guidelines: string;
};

function transformExamQuestions(questions: Question[]): QuestionData[] {
    return questions.map((q) => ({
        type: q.type,
        text: q.text,
        points: q.points,
        choices: q.choices.map((c) => ({
            text: c.text,
            is_correct: c.is_correct,
        })),
        grading_guidelines: q.grading_guidelines ?? '',
    }));
}

function defaultChoicesForType(type: QuestionType): { text: string; is_correct: boolean }[] {
    if (type === 'mcq') {
        return [
            { text: '', is_correct: true },
            { text: '', is_correct: false },
        ];
    }

    if (type === 'true_false') {
        return [
            { text: 'True', is_correct: true },
            { text: 'False', is_correct: false },
        ];
    }

    return [];
}

function questionTypeLabel(type: string) {
    switch (type) {
        case 'mcq':
            return 'Multiple Choice';
        case 'true_false':
            return 'True/False';
        case 'written_answer':
            return 'Written Response';
        default:
            return type;
    }
}

function questionTypeColor(type: string) {
    switch (type) {
        case 'mcq':
        case 'true_false':
            return 'bg-[#03b4a2]/20 text-[#4fdbc8] border-[#4fdbc8]/30';
        case 'written_answer':
            return 'bg-[#dec56f]/20 text-[#fbe188] border-[#fbe188]/30';
        default:
            return 'bg-muted text-muted-foreground';
    }
}

// Status pulse animation style
const statusPulseStyle = `
@keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 219, 200, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(79, 219, 200, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 219, 200, 0); }
}
.status-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4fdbc8;
    box-shadow: 0 0 0 0 rgba(79, 219, 200, 0.7);
    animation: pulse 2s infinite;
}
`;

function ExamBuilder({ exam }: { exam?: Exam }) {
    const isEditing = !!exam;
    const isLocked = exam?.status === 'locked';
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, transform } = useForm({
        title: exam?.title ?? '',
        description: exam?.description ?? '',
        class_name: exam?.class_name ?? '',
        subject_name: exam?.subject_name ?? '',
        time_limit_minutes: exam?.time_limit_minutes ?? (null as number | null),
        passing_score: exam?.passing_score ?? 70,
        evaluation_strategy: exam?.evaluation_strategy ?? ('instant' as 'instant' | 'manual'),
        status: 'draft' as 'draft' | 'published',
        questions: exam ? transformExamQuestions(exam.questions) : ([] as QuestionData[]),
    });

    function addQuestion(type: QuestionType) {
        setData('questions', [
            ...data.questions,
            {
                type,
                text: '',
                points: type === 'written_answer' ? 5 : 1,
                choices: defaultChoicesForType(type),
                grading_guidelines: '',
            },
        ]);
    }

    function confirmDeleteQuestion(index: number) {
        setQuestionToDelete(index);
        setDeleteDialogOpen(true);
    }

    function executeDelete() {
        if (questionToDelete !== null) {
            setData(
                'questions',
                data.questions.filter((_, i) => i !== questionToDelete),
            );
            setDeleteDialogOpen(false);
            setQuestionToDelete(null);
        }
    }

    function updateQuestion(index: number, field: string, value: unknown) {
        setData(
            'questions',
            data.questions.map((q, i) =>
                i === index ? { ...q, [field]: value } : q,
            ),
        );
    }

    function moveQuestion(index: number, direction: 'up' | 'down') {
        const to = direction === 'up' ? index - 1 : index + 1;

        if (to < 0 || to >= data.questions.length) {
            return;
        }

        const updated = [...data.questions];
        const [item] = updated.splice(index, 1);
        updated.splice(to, 0, item);
        setData('questions', updated);
    }

    function addChoice(questionIndex: number) {
        setData(
            'questions',
            data.questions.map((q, i) => {
                if (i !== questionIndex) {
                    return q;
                }

                return {
                    ...q,
                    choices: [
                        ...q.choices,
                        { text: '', is_correct: false },
                    ],
                };
            }),
        );
    }

    function removeChoice(questionIndex: number, choiceIndex: number) {
        setData(
            'questions',
            data.questions.map((q, i) => {
                if (i !== questionIndex) {
                    return q;
                }

                const newChoices = q.choices.filter(
                    (_, ci) => ci !== choiceIndex,
                );
                const hasCorrect = newChoices.some((c) => c.is_correct);

                if (!hasCorrect && newChoices.length > 0) {
                    newChoices[0] = { ...newChoices[0], is_correct: true };
                }

                return { ...q, choices: newChoices };
            }),
        );
    }

    function updateChoice(
        questionIndex: number,
        choiceIndex: number,
        field: string,
        value: unknown,
    ) {
        setData(
            'questions',
            data.questions.map((q, i) => {
                if (i !== questionIndex) {
                    return q;
                }

                return {
                    ...q,
                    choices: q.choices.map((c, ci) =>
                        ci === choiceIndex ? { ...c, [field]: value } : c,
                    ),
                };
            }),
        );
    }

    function setCorrectChoice(questionIndex: number, choiceIndex: number) {
        setData(
            'questions',
            data.questions.map((q, i) => {
                if (i !== questionIndex) {
                    return q;
                }

                return {
                    ...q,
                    choices: q.choices.map((c, ci) => ({
                        ...c,
                        is_correct: ci === choiceIndex,
                    })),
                };
            }),
        );
    }

    function handleSubmit(status: 'draft' | 'published') {
        transform((data) => ({ ...data, status }));
        setData('status', status);

        if (isEditing && exam) {
            put(examsUpdate.url(exam.id), { preserveScroll: true });
        } else {
            post(examsStore.url(), { preserveScroll: true });
        }
    }

    const pageTitle = isEditing ? `Edit: ${exam.title}` : 'Create Exam';

    return (
        <>
            <style>{statusPulseStyle}</style>
            <Head title={pageTitle} />

            <div className="grid grid-cols-12 gap-6 items-start">
                {/* Left Column: Exam Builder (60%) */}
                <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-semibold text-[#c3c0ff]">Exam Builder</h3>
                            <p className="text-sm text-[#c7c4d8]">
                                {isEditing ? `Editing: ${exam.title}` : 'Constructing assessment with Aegis AI Grading Engine'}
                            </p>
                        </div>
                        {!isLocked && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="bg-[#c3c0ff] text-[#131313] hover:opacity-90 flex items-center gap-2">
                                        <Plus className="size-4" />
                                        Add Question
                                        <ChevronDown className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => addQuestion('true_false')}>
                                        <ListChecks className="mr-2 size-4" />
                                        True/False Question
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => addQuestion('mcq')}>
                                        <ListChecks className="mr-2 size-4" />
                                        Multiple Choice Question
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => addQuestion('written_answer')}>
                                        <PenLine className="mr-2 size-4" />
                                        Written Response Question
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Locked Alert */}
                    {isLocked && (
                        <div className="rounded-xl border border-[#ffb4ab]/30 bg-[#93000a]/20 p-4 flex items-start gap-3">
                            <Lock className="size-5 text-[#ffb4ab] shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-[#ffb4ab]">Exam Locked</h4>
                                <p className="text-sm text-[#c7c4d8]">
                                    This exam has student attempts and cannot be modified. You can still view questions and grading guidelines.
                                </p>
                            </div>
                        </div>
                    )}

                    <InputError message={errors.questions} />

                    {/* Question List */}
                    <div className="space-y-4">
                        {data.questions.length === 0 ? (
                            /* Empty State */
                            <button
                                onClick={() => addQuestion('mcq')}
                                disabled={isLocked}
                                className="w-full py-16 border-2 border-dashed border-[#918fa1]/30 rounded-xl text-[#c7c4d8] hover:border-[#c3c0ff] hover:text-[#c3c0ff] transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="size-10" />
                                <span className="text-xs font-semibold uppercase tracking-widest">Drop a new component here</span>
                            </button>
                        ) : (
                            <>
                                {data.questions.map((question, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl p-5 flex gap-3 group"
                                        style={{
                                            background: 'rgba(26, 26, 26, 0.6)',
                                            backdropFilter: 'blur(12px)',
                                            border: '1px solid rgba(146, 143, 154, 0.25)',
                                        }}
                                    >
                                        {/* Drag Handle & Number */}
                                        <div className="flex flex-col items-center gap-1 text-[#c7c4d8]">
                                            <button
                                                className="hover:text-[#c3c0ff] transition-colors cursor-grab active:cursor-grabbing disabled:opacity-30"
                                                disabled={isLocked}
                                            >
                                                <GripVertical className="size-5" />
                                            </button>
                                            <span className="text-xs font-semibold opacity-50">Q{index + 1}</span>
                                        </div>

                                        {/* Question Content */}
                                        <div className="flex-1 space-y-4">
                                            {/* Type Badge & Delete */}
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold uppercase border ${questionTypeColor(question.type)}`}>
                                                    {questionTypeLabel(question.type)}
                                                </span>
                                                {!isLocked && (
                                                    <button
                                                        onClick={() => confirmDeleteQuestion(index)}
                                                        className="text-[#918fa1] hover:text-[#ffb4ab] transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Question Text */}
                                            <input
                                                type="text"
                                                value={question.text}
                                                onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                                                placeholder="Enter question text..."
                                                disabled={isLocked}
                                                className="w-full bg-transparent border-b border-[#918fa1]/30 focus:border-[#c3c0ff] focus:outline-none py-1 text-lg text-[#e5e2e1] placeholder:text-[#918fa1]/50 disabled:opacity-50"
                                            />

                                            {/* MCQ/TrueFalse Choices */}
                                            {(question.type === 'mcq' || question.type === 'true_false') && (
                                                <div className={`grid gap-3 pt-2 ${question.type === 'mcq' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'}`}>
                                                    {question.choices.map((choice, choiceIndex) => (
                                                        <div
                                                            key={choiceIndex}
                                                            className="flex items-center gap-2 bg-[#201f1f] rounded-lg px-4 py-3 border border-[#918fa1]/20"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`q${index}`}
                                                                checked={choice.is_correct}
                                                                onChange={() => setCorrectChoice(index, choiceIndex)}
                                                                disabled={isLocked}
                                                                className="accent-[#c3c0ff]"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={choice.text}
                                                                onChange={(e) => updateChoice(index, choiceIndex, 'text', e.target.value)}
                                                                placeholder={`Option ${String.fromCharCode(65 + choiceIndex)}`}
                                                                disabled={isLocked || question.type === 'true_false'}
                                                                className="bg-transparent w-full border-none focus:ring-0 text-sm text-[#e5e2e1] placeholder:text-[#918fa1]/50 disabled:opacity-50"
                                                            />
                                                            {question.type === 'mcq' && !isLocked && question.choices.length > 2 && (
                                                                <button
                                                                    onClick={() => removeChoice(index, choiceIndex)}
                                                                    className="text-[#918fa1] hover:text-[#ffb4ab] transition-colors"
                                                                >
                                                                    <Trash2 className="size-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {question.type === 'mcq' && !isLocked && (
                                                        <button
                                                            onClick={() => addChoice(index)}
                                                            className="flex items-center justify-center gap-2 py-3 border border-dashed border-[#918fa1]/30 rounded-lg text-[#918fa1] hover:border-[#c3c0ff] hover:text-[#c3c0ff] transition-all"
                                                        >
                                                            <Plus className="size-4" />
                                                            <span className="text-sm">Add Option</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Written Answer Guidelines */}
                                            {question.type === 'written_answer' && (
                                                <div className="space-y-1 pt-2">
                                                    <label className="text-xs font-semibold text-[#918fa1] uppercase tracking-wide flex items-center gap-2">
                                                        <Sparkles className="size-3" />
                                                        AI Grading Guidelines
                                                    </label>
                                                    <textarea
                                                        value={question.grading_guidelines}
                                                        onChange={(e) => updateQuestion(index, 'grading_guidelines', e.target.value)}
                                                        placeholder="Define expected key points for AI grading..."
                                                        rows={3}
                                                        disabled={isLocked}
                                                        className="w-full bg-[#1c1b1b] border border-[#918fa1]/30 rounded-lg p-3 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#c3c0ff] transition-all placeholder:text-[#918fa1]/50 disabled:opacity-50"
                                                    />
                                                </div>
                                            )}

                                            {/* Points & Move Controls */}
                                            <div className="flex items-center gap-4 pt-2">
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-xs text-[#918fa1] uppercase">Points</Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={question.points}
                                                        onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 1)}
                                                        disabled={isLocked}
                                                        className="w-20 h-8 bg-[#201f1f] border-[#918fa1]/30 text-sm text-[#e5e2e1] focus:border-[#c3c0ff] disabled:opacity-50"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1 ml-auto">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => moveQuestion(index, 'up')}
                                                        disabled={isLocked || index === 0}
                                                        className="text-[#918fa1] hover:text-[#c3c0ff] disabled:opacity-30"
                                                    >
                                                        ↑
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => moveQuestion(index, 'down')}
                                                        disabled={isLocked || index === data.questions.length - 1}
                                                        className="text-[#918fa1] hover:text-[#c3c0ff] disabled:opacity-30"
                                                    >
                                                        ↓
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Question Button at bottom */}
                                {!isLocked && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="w-full py-8 border-2 border-dashed border-[#918fa1]/30 rounded-xl text-[#918fa1] hover:border-[#c3c0ff] hover:text-[#c3c0ff] transition-all flex flex-col items-center justify-center gap-2">
                                                <Plus className="size-8" />
                                                <span className="text-xs font-semibold uppercase tracking-widest">Add another question</span>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="center">
                                            <DropdownMenuItem onClick={() => addQuestion('true_false')}>
                                                <ListChecks className="mr-2 size-4" />
                                                True/False Question
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addQuestion('mcq')}>
                                                <ListChecks className="mr-2 size-4" />
                                                Multiple Choice Question
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addQuestion('written_answer')}>
                                                <PenLine className="mr-2 size-4" />
                                                Written Response Question
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Right Column: Settings (40%) */}
                <div className="col-span-12 lg:col-span-5 xl:col-span-4 lg:sticky lg:top-[88px] space-y-6">
                    {/* Exam Settings Card */}
                    <div
                        className="rounded-2xl p-6 space-y-6"
                        style={{
                            background: 'rgba(26, 26, 26, 0.6)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(195, 192, 255, 0.2)',
                            boxShadow: '0 0 40px rgba(195, 192, 255, 0.05)',
                        }}
                    >
                        {/* Settings Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="text-xl font-semibold text-[#e5e2e1]">Exam Settings</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="status-pulse" />
                                    <span className="text-xs font-semibold text-[#4fdbc8] uppercase tracking-wider">
                                        {data.status === 'published' ? 'Published Live' : 'Drafting Live'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-[#918fa1] uppercase tracking-wide">
                                    Exam Title
                                </Label>
                                <Input
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Advanced Deep Learning Midterm"
                                    disabled={isLocked}
                                    className="bg-[#201f1f] border-[#918fa1]/30 text-[#e5e2e1] focus:border-[#c3c0ff] focus:ring-1 focus:ring-[#c3c0ff] placeholder:text-[#918fa1]/50 disabled:opacity-50"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-[#918fa1] uppercase tracking-wide">
                                    Description
                                </Label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe the exam content and objectives..."
                                    rows={2}
                                    disabled={isLocked}
                                    className="w-full bg-[#201f1f] border border-[#918fa1]/30 rounded-lg px-3 py-2 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#c3c0ff] focus:ring-1 focus:ring-[#c3c0ff] placeholder:text-[#918fa1]/50 disabled:opacity-50"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-[#918fa1] uppercase tracking-wide">
                                        Class/Subject
                                    </Label>
                                    <Input
                                        value={data.class_name}
                                        onChange={(e) => setData('class_name', e.target.value)}
                                        placeholder="e.g. CS501-DL"
                                        disabled={isLocked}
                                        className="bg-[#201f1f] border-[#918fa1]/30 text-sm text-[#e5e2e1] focus:border-[#c3c0ff] placeholder:text-[#918fa1]/50 disabled:opacity-50 h-10"
                                    />
                                    <InputError message={errors.class_name} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-[#918fa1] uppercase tracking-wide">
                                        Passing Score
                                    </Label>
                                    <div className="flex items-center gap-2 bg-[#201f1f] border border-[#918fa1]/30 rounded-lg px-3 h-10">
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={data.passing_score}
                                            onChange={(e) => setData('passing_score', parseInt(e.target.value) || 0)}
                                            disabled={isLocked}
                                            className="bg-transparent border-none focus:ring-0 text-sm text-[#e5e2e1] p-0 disabled:opacity-50"
                                        />
                                        <span className="text-[#918fa1] text-sm">%</span>
                                    </div>
                                    <InputError message={errors.passing_score} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-[#918fa1] uppercase tracking-wide">
                                        Time Limit
                                    </Label>
                                    <div className="flex items-center gap-2 bg-[#201f1f] border border-[#918fa1]/30 rounded-lg px-3 h-10">
                                        <Clock className="size-4 text-[#918fa1]" />
                                        <Input
                                            type="number"
                                            min={1}
                                            value={data.time_limit_minutes ?? ''}
                                            onChange={(e) => setData('time_limit_minutes', e.target.value ? parseInt(e.target.value) : null)}
                                            placeholder="Optional"
                                            disabled={isLocked}
                                            className="bg-transparent border-none focus:ring-0 text-sm text-[#e5e2e1] p-0 disabled:opacity-50"
                                        />
                                        <span className="text-[#918fa1] text-xs uppercase">mins</span>
                                    </div>
                                    <InputError message={errors.time_limit_minutes} />
                                </div>
                            </div>

                            {/* Evaluation Strategy Toggle */}
                            <div className="space-y-2 pt-2 border-t border-[#918fa1]/20">
                                <Label className="text-xs font-semibold text-[#918fa1] uppercase tracking-wide">
                                    Grading Strategy
                                </Label>
                                <div className="flex p-1 bg-[#0e0e0e] rounded-xl gap-1">
                                    <button
                                        onClick={() => setData('evaluation_strategy', 'instant')}
                                        disabled={isLocked}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                                            data.evaluation_strategy === 'instant'
                                                ? 'bg-[#2a2a2a] text-[#e5e2e1] border border-[#918fa1]/30'
                                                : 'text-[#918fa1] hover:text-[#e5e2e1]'
                                        } disabled:opacity-50`}
                                    >
                                        <Sparkles className="size-3" />
                                        Instant Results
                                    </button>
                                    <button
                                        onClick={() => setData('evaluation_strategy', 'manual')}
                                        disabled={isLocked}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                                            data.evaluation_strategy === 'manual'
                                                ? 'bg-[#2a2a2a] text-[#e5e2e1] border border-[#918fa1]/30'
                                                : 'text-[#918fa1] hover:text-[#e5e2e1]'
                                        } disabled:opacity-50`}
                                    >
                                        <PenLine className="size-3" />
                                        Manual Review
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 pt-4 border-t border-[#918fa1]/20">
                            {!isLocked && (
                                <Button
                                    onClick={() => handleSubmit('published')}
                                    disabled={processing || data.questions.length === 0}
                                    className="w-full bg-[#c3c0ff] text-[#161349] hover:bg-[#a9a4ff] font-semibold text-lg py-5 rounded-xl shadow-lg shadow-[#c3c0ff]/20 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Publishing...
                                        </>
                                    ) : (
                                        'Publish Exam'
                                    )}
                                </Button>
                            )}
                            {!isLocked && (
                                <Button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => handleSubmit('draft')}
                                    className="w-full bg-transparent border border-[#c3c0ff]/40 text-[#c3c0ff] hover:bg-[#c3c0ff]/10 py-5 rounded-xl font-medium disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save as Draft'
                                    )}
                                </Button>
                            )}
                            <Button
                                asChild
                                className="w-full bg-transparent border border-[#918fa1]/30 text-[#918fa1] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]"
                            >
                                <Link href={examsIndex.url()}>Cancel</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div
                        className="rounded-xl p-4 flex items-center gap-4"
                        style={{
                            background: 'rgba(26, 26, 26, 0.6)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(146, 143, 154, 0.25)',
                        }}
                    >
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#4fdbc8]/20 to-[#c3c0ff]/20 flex items-center justify-center">
                            <ListChecks className="size-6 text-[#4fdbc8]" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-[#c3c0ff] uppercase tracking-wide">Questions</p>
                            <p className="text-lg font-semibold text-[#e5e2e1]">{data.questions.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-[#1c1b1b] border-[#918fa1]/30 text-[#e5e2e1]">
                    <DialogHeader>
                        <DialogTitle>Delete Question</DialogTitle>
                        <DialogDescription className="text-[#918fa1]">
                            Are you sure you want to delete this question? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className="bg-transparent border border-[#918fa1]/30 text-[#918fa1] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={executeDelete}
                            className="bg-[#93000a] text-[#ffdad6] hover:bg-[#93000a]/80"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ExamBuilder.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default ExamBuilder;
