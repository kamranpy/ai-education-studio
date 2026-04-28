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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    class_name: string | null;
    subject_name: string | null;
    status: string;
    time_limit_minutes: number | null;
    passing_score: number;
    evaluation_strategy: 'instant' | 'manual';
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
        class_name: exam?.class_name ?? '',
        subject_name: exam?.subject_name ?? '',
        time_limit_minutes: exam?.time_limit_minutes ?? (null as number | null),
        passing_score: exam?.passing_score ?? 70,
        evaluation_strategy: exam?.evaluation_strategy ?? ('instant' as 'instant' | 'manual'),
        status: 'draft' as 'draft' | 'published',
        questions: exam ? transformExamQuestions(exam.questions) : ([] as QuestionData[]),
    });

    // Filter questions by type for each tab
    const tfQuestions = data.questions
        .map((q, i) => ({ question: q, originalIndex: i }))
        .filter((item) => item.question.type === 'true_false');

    const mcqQuestions = data.questions
        .map((q, i) => ({ question: q, originalIndex: i }))
        .filter((item) => item.question.type === 'mcq');

    const writtenQuestions = data.questions
        .map((q, i) => ({ question: q, originalIndex: i }))
        .filter((item) => item.question.type === 'written_answer');

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

    function renderQuestionList(
        items: { question: QuestionData; originalIndex: number }[],
        emptyMessage: string,
        addType: QuestionType,
        addLabel: string,
        addIcon: React.ReactNode,
    ) {
        return (
            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                        <p className="mb-3 text-sm text-muted-foreground">
                            {emptyMessage}
                        </p>
                        {!isLocked && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addQuestion(addType)}
                            >
                                {addIcon}
                                <span className="ml-1.5">{addLabel}</span>
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {items.map(({ question, originalIndex }) => (
                                <QuestionCard
                                    key={originalIndex}
                                    question={question}
                                    index={originalIndex}
                                    errors={errors}
                                    isFirst={originalIndex === 0}
                                    isLast={
                                        originalIndex ===
                                        data.questions.length - 1
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
                        {!isLocked && (
                            <div className="flex justify-center pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addQuestion(addType)}
                                >
                                    <Plus className="mr-1.5 size-4" />
                                    Add {addLabel}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }

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

                {/* Exam Details Card */}
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
                                <Label htmlFor="class_name">Class Name</Label>
                                <Input
                                    id="class_name"
                                    value={data.class_name}
                                    onChange={(e) =>
                                        setData('class_name', e.target.value)
                                    }
                                    placeholder="e.g. Grade 10-A"
                                    maxLength={255}
                                    disabled={isLocked}
                                />
                                <InputError message={errors.class_name} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="subject_name">
                                    Subject Name
                                </Label>
                                <Input
                                    id="subject_name"
                                    value={data.subject_name}
                                    onChange={(e) =>
                                        setData(
                                            'subject_name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. Mathematics"
                                    maxLength={255}
                                    disabled={isLocked}
                                />
                                <InputError message={errors.subject_name} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

                            <div className="space-y-1.5">
                                <Label htmlFor="evaluation_strategy">
                                    Evaluation Strategy
                                </Label>
                                <Select
                                    value={data.evaluation_strategy}
                                    onValueChange={(val: 'instant' | 'manual') =>
                                        setData('evaluation_strategy', val)
                                    }
                                    disabled={isLocked}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select strategy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="instant">
                                            Instant — Show results immediately
                                        </SelectItem>
                                        <SelectItem value="manual">
                                            Manual — Admin announces results
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={errors.evaluation_strategy}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Questions Section — Tabbed */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                            Questions ({data.questions.length})
                        </h2>
                    </div>

                    <InputError message={errors.questions} />

                    <Tabs defaultValue="true_false" className="w-full">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="true_false" className="gap-1.5">
                                <CircleCheck className="size-4" />
                                True/False
                                <span className="ml-1 rounded-full bg-zinc-200 px-1.5 text-xs dark:bg-zinc-700">
                                    {tfQuestions.length}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="mcq" className="gap-1.5">
                                <ListChecks className="size-4" />
                                MCQs
                                <span className="ml-1 rounded-full bg-zinc-200 px-1.5 text-xs dark:bg-zinc-700">
                                    {mcqQuestions.length}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="written_answer"
                                className="gap-1.5"
                            >
                                <PenLine className="size-4" />
                                Written
                                <span className="ml-1 rounded-full bg-zinc-200 px-1.5 text-xs dark:bg-zinc-700">
                                    {writtenQuestions.length}
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="true_false" className="mt-4">
                            {renderQuestionList(
                                tfQuestions,
                                'No True/False questions added yet.',
                                'true_false',
                                'True/False Question',
                                <CircleCheck className="size-4" />,
                            )}
                        </TabsContent>

                        <TabsContent value="mcq" className="mt-4">
                            {renderQuestionList(
                                mcqQuestions,
                                'No Multiple Choice questions added yet.',
                                'mcq',
                                'MCQ Question',
                                <ListChecks className="size-4" />,
                            )}
                        </TabsContent>

                        <TabsContent value="written_answer" className="mt-4">
                            {renderQuestionList(
                                writtenQuestions,
                                'No Written Answer questions added yet.',
                                'written_answer',
                                'Written Question',
                                <PenLine className="size-4" />,
                            )}
                        </TabsContent>
                    </Tabs>
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
