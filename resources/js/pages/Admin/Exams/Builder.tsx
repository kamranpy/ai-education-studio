import {
    index as examsIndex,
    store as examsStore,
    update as examsUpdate,
} from '@/actions/App/Http/Controllers/Admin/ExamController';
import InputError from '@/components/input-error';
import {
    type ChoiceData,
    type QuestionData,
    QuestionCard,
} from '@/components/exam/question-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    CircleCheck,
    ListChecks,
    Lock,
    PenLine,
    Plus,
} from 'lucide-react';

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
    status: string;
    time_limit_minutes: number | null;
    passing_score: number;
    questions: Question[];
};

type QuestionType = 'mcq' | 'true_false' | 'written_answer';

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

function defaultChoicesForType(type: QuestionType): ChoiceData[] {
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

function ExamBuilder({ exam }: { exam?: Exam }) {
    const isEditing = !!exam;
    const isLocked = exam?.status === 'locked';

    const { data, setData, post, put, processing, errors } = useForm({
        title: exam?.title ?? '',
        description: exam?.description ?? '',
        time_limit_minutes: exam?.time_limit_minutes ?? (null as number | null),
        passing_score: exam?.passing_score ?? 70,
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

    function removeQuestion(index: number) {
        setData(
            'questions',
            data.questions.filter((_, i) => i !== index),
        );
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
        if (to < 0 || to >= data.questions.length) return;
        const updated = [...data.questions];
        const [item] = updated.splice(index, 1);
        updated.splice(to, 0, item);
        setData('questions', updated);
    }

    function addChoice(questionIndex: number) {
        setData(
            'questions',
            data.questions.map((q, i) => {
                if (i !== questionIndex) return q;
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
                if (i !== questionIndex) return q;
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
                if (i !== questionIndex) return q;
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
                if (i !== questionIndex) return q;
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
        setData('status', status);

        if (isEditing && exam) {
            put(examsUpdate.url(exam.id), { preserveScroll: true });
        } else {
            post(examsStore.url(), { preserveScroll: true });
        }
    }

    const pageTitle = isEditing ? `Edit: ${exam.title}` : 'Create Exam';
    const breadcrumbLabel = isEditing ? exam.title : 'Create';

    return (
        <>
            <Head title={pageTitle} />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link
                                href={examsIndex.url()}
                                className="text-sm text-muted-foreground hover:underline"
                            >
                                Exams
                            </Link>
                            <span className="text-sm text-muted-foreground">
                                /
                            </span>
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                {breadcrumbLabel}
                            </span>
                        </div>
                        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                            {isEditing ? 'Edit Exam' : 'Create Exam'}
                        </h1>
                    </div>

                    {!isLocked && (
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={processing}
                                onClick={() => handleSubmit('draft')}
                            >
                                {processing ? 'Saving...' : 'Save Draft'}
                            </Button>
                            <Button
                                type="button"
                                disabled={
                                    processing ||
                                    data.questions.length === 0
                                }
                                onClick={() => handleSubmit('published')}
                            >
                                {processing
                                    ? 'Saving...'
                                    : 'Save & Publish'}
                            </Button>
                        </div>
                    )}
                </div>

                {isLocked && (
                    <Alert variant="destructive">
                        <Lock className="size-4" />
                        <AlertTitle>Exam Locked</AlertTitle>
                        <AlertDescription>
                            This exam has student attempts and cannot be
                            modified. You can still view questions and grading
                            guidelines.
                        </AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-1.5">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                                placeholder="e.g. Midterm Exam"
                                maxLength={255}
                                disabled={isLocked}
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Describe the exam content and objectives..."
                                rows={3}
                                disabled={isLocked}
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="time_limit_minutes">
                                    Time Limit (minutes)
                                </Label>
                                <Input
                                    id="time_limit_minutes"
                                    type="number"
                                    min={1}
                                    max={480}
                                    value={data.time_limit_minutes ?? ''}
                                    onChange={(e) =>
                                        setData(
                                            'time_limit_minutes',
                                            e.target.value
                                                ? parseInt(e.target.value)
                                                : null,
                                        )
                                    }
                                    placeholder="Optional"
                                    disabled={isLocked}
                                />
                                <InputError
                                    message={errors.time_limit_minutes}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="passing_score">
                                    Passing Score (%)
                                </Label>
                                <Input
                                    id="passing_score"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={data.passing_score}
                                    onChange={(e) =>
                                        setData(
                                            'passing_score',
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                    disabled={isLocked}
                                />
                                <InputError message={errors.passing_score} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                            Questions ({data.questions.length})
                        </h2>

                        {!isLocked && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Plus className="mr-1.5 size-4" />
                                        Add Question
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => addQuestion('mcq')}
                                    >
                                        <ListChecks className="mr-2 size-4" />
                                        Multiple Choice
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            addQuestion('true_false')
                                        }
                                    >
                                        <CircleCheck className="mr-2 size-4" />
                                        True / False
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            addQuestion('written_answer')
                                        }
                                    >
                                        <PenLine className="mr-2 size-4" />
                                        Written Answer
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <InputError message={errors.questions} />

                    {data.questions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                            <p className="text-sm text-muted-foreground">
                                No questions added yet. Click "Add Question"
                                to get started.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.questions.map((question, idx) => (
                                <QuestionCard
                                    key={idx}
                                    question={question}
                                    index={idx}
                                    errors={errors}
                                    isFirst={idx === 0}
                                    isLast={
                                        idx === data.questions.length - 1
                                    }
                                    disabled={isLocked}
                                    onUpdate={updateQuestion}
                                    onRemove={removeQuestion}
                                    onMove={moveQuestion}
                                    onUpdateChoice={updateChoice}
                                    onAddChoice={addChoice}
                                    onRemoveChoice={removeChoice}
                                    onSetCorrectChoice={setCorrectChoice}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {!isLocked && (
                    <div className="flex justify-end gap-2 border-t pt-6">
                        <Button variant="outline" asChild>
                            <Link href={examsIndex.url()}>Cancel</Link>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={processing}
                            onClick={() => handleSubmit('draft')}
                        >
                            {processing ? 'Saving...' : 'Save Draft'}
                        </Button>
                        <Button
                            type="button"
                            disabled={
                                processing || data.questions.length === 0
                            }
                            onClick={() => handleSubmit('published')}
                        >
                            {processing ? 'Saving...' : 'Save & Publish'}
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

ExamBuilder.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default ExamBuilder;
