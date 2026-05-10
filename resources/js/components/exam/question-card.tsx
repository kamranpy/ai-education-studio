import {
    ChevronDown,
    ChevronUp,
    CircleCheck,
    ListChecks,
    PenLine,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

type QuestionType = 'mcq' | 'true_false' | 'written_answer';

export type ChoiceData = {
    text: string;
    is_correct: boolean;
};

export type QuestionData = {
    type: QuestionType;
    text: string;
    points: number;
    choices: ChoiceData[];
    grading_guidelines: string;
};

type QuestionCardProps = {
    question: QuestionData;
    index: number;
    errors: Record<string, string>;
    isFirst: boolean;
    isLast: boolean;
    disabled?: boolean;
    onUpdate: (index: number, field: string, value: unknown) => void;
    onRemove: (index: number) => void;
    onMove: (index: number, direction: 'up' | 'down') => void;
    onUpdateChoice: (
        questionIndex: number,
        choiceIndex: number,
        field: string,
        value: unknown,
    ) => void;
    onAddChoice: (questionIndex: number) => void;
    onRemoveChoice: (
        questionIndex: number,
        choiceIndex: number,
    ) => void;
    onSetCorrectChoice: (
        questionIndex: number,
        choiceIndex: number,
    ) => void;
};

const typeConfig: Record<
    QuestionType,
    { label: string; icon: typeof ListChecks }
> = {
    mcq: { label: 'Multiple Choice', icon: ListChecks },
    true_false: { label: 'True/False', icon: CircleCheck },
    written_answer: { label: 'Written Answer', icon: PenLine },
};

function hasQuestionError(
    errors: Record<string, string>,
    index: number,
): boolean {
    const prefix = `questions.${index}`;

    return Object.keys(errors).some((key) => key.startsWith(prefix));
}

export function QuestionCard({
    question,
    index,
    errors,
    isFirst,
    isLast,
    disabled = false,
    onUpdate,
    onRemove,
    onMove,
    onUpdateChoice,
    onAddChoice,
    onRemoveChoice,
    onSetCorrectChoice,
}: QuestionCardProps) {
    const [open, setOpen] = useState(true);
    const config = typeConfig[question.type];
    const Icon = config.icon;
    const hasError = hasQuestionError(errors, index);
    const prefix = `questions.${index}`;

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <div
                className={`rounded-lg border ${hasError ? 'border-red-300 dark:border-red-800' : ''}`}
            >
                <div className="flex items-center gap-2 px-4 py-3">
                    <CollapsibleTrigger asChild>
                        <button
                            type="button"
                            className="flex flex-1 items-center gap-3 text-left"
                        >
                            <Icon className="size-4 shrink-0 text-muted-foreground" />
                            <span className="flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {question.text
                                    ? `Q${index + 1}: ${question.text}`
                                    : `Q${index + 1}: Untitled question`}
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                                {config.label} &middot; {question.points} pt
                                {question.points !== 1 ? 's' : ''}
                            </span>
                            <ChevronDown
                                className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
                            />
                        </button>
                    </CollapsibleTrigger>

                    {!disabled && (
                        <div className="flex shrink-0 items-center gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={isFirst}
                                onClick={() => onMove(index, 'up')}
                                className="size-7 p-0"
                            >
                                <ChevronUp className="size-3.5" />
                                <span className="sr-only">Move up</span>
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={isLast}
                                onClick={() => onMove(index, 'down')}
                                className="size-7 p-0"
                            >
                                <ChevronDown className="size-3.5" />
                                <span className="sr-only">Move down</span>
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemove(index)}
                                className="size-7 p-0 text-red-500 hover:text-red-700"
                            >
                                <Trash2 className="size-3.5" />
                                <span className="sr-only">
                                    Remove question
                                </span>
                            </Button>
                        </div>
                    )}
                </div>

                <CollapsibleContent>
                    <div className="space-y-4 border-t px-4 py-4">
                        <div className="space-y-1.5">
                            <Label htmlFor={`${prefix}.text`}>
                                Question Text
                            </Label>
                            <Textarea
                                id={`${prefix}.text`}
                                value={question.text}
                                onChange={(e) =>
                                    onUpdate(index, 'text', e.target.value)
                                }
                                placeholder="Enter your question..."
                                rows={2}
                                disabled={disabled}
                            />
                            <InputError message={errors[`${prefix}.text`]} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor={`${prefix}.points`}>Points</Label>
                            <Input
                                id={`${prefix}.points`}
                                type="number"
                                min={1}
                                max={100}
                                value={question.points}
                                onChange={(e) =>
                                    onUpdate(
                                        index,
                                        'points',
                                        parseInt(e.target.value) || 1,
                                    )
                                }
                                className="w-24"
                                disabled={disabled}
                            />
                            <InputError message={errors[`${prefix}.points`]} />
                        </div>

                        {question.type === 'mcq' && (
                            <McqFields
                                question={question}
                                index={index}
                                errors={errors}
                                disabled={disabled}
                                onUpdateChoice={onUpdateChoice}
                                onAddChoice={onAddChoice}
                                onRemoveChoice={onRemoveChoice}
                                onSetCorrectChoice={onSetCorrectChoice}
                            />
                        )}

                        {question.type === 'true_false' && (
                            <TrueFalseFields
                                question={question}
                                index={index}
                                errors={errors}
                                disabled={disabled}
                                onSetCorrectChoice={onSetCorrectChoice}
                            />
                        )}

                        {question.type === 'written_answer' && (
                            <WrittenFields
                                question={question}
                                index={index}
                                errors={errors}
                                disabled={disabled}
                                onUpdate={onUpdate}
                            />
                        )}
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}

function McqFields({
    question,
    index,
    errors,
    disabled,
    onUpdateChoice,
    onAddChoice,
    onRemoveChoice,
    onSetCorrectChoice,
}: {
    question: QuestionData;
    index: number;
    errors: Record<string, string>;
    disabled: boolean;
    onUpdateChoice: QuestionCardProps['onUpdateChoice'];
    onAddChoice: QuestionCardProps['onAddChoice'];
    onRemoveChoice: QuestionCardProps['onRemoveChoice'];
    onSetCorrectChoice: QuestionCardProps['onSetCorrectChoice'];
}) {
    const prefix = `questions.${index}`;

    return (
        <div className="space-y-3">
            <Label>Answer Choices</Label>
            <InputError message={errors[`${prefix}.choices`]} />

            <div className="space-y-2">
                {question.choices.map((choice, ci) => (
                    <div key={ci} className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onSetCorrectChoice(index, ci)}
                            disabled={disabled}
                            className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                choice.is_correct
                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                    : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-600'
                            }`}
                            aria-label={
                                choice.is_correct
                                    ? 'Correct answer'
                                    : 'Mark as correct'
                            }
                        >
                            {choice.is_correct && (
                                <CircleCheck className="size-3" />
                            )}
                        </button>
                        <span className="w-6 text-center text-xs font-mono text-muted-foreground">
                            {String.fromCharCode(65 + ci)}.
                        </span>
                        <Input
                            value={choice.text}
                            onChange={(e) =>
                                onUpdateChoice(
                                    index,
                                    ci,
                                    'text',
                                    e.target.value,
                                )
                            }
                            placeholder={`Option ${String.fromCharCode(65 + ci)}`}
                            disabled={disabled}
                            className="flex-1"
                        />
                        {question.choices.length > 2 && !disabled && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveChoice(index, ci)}
                                className="size-7 shrink-0 p-0 text-muted-foreground hover:text-red-500"
                            >
                                <X className="size-3.5" />
                                <span className="sr-only">Remove option</span>
                            </Button>
                        )}
                        <InputError
                            message={
                                errors[`${prefix}.choices.${ci}.text`]
                            }
                        />
                    </div>
                ))}
            </div>

            {question.choices.length < 6 && !disabled && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onAddChoice(index)}
                >
                    <Plus className="mr-1.5 size-3.5" />
                    Add Option
                </Button>
            )}
        </div>
    );
}

function TrueFalseFields({
    question,
    index,
    errors,
    disabled,
    onSetCorrectChoice,
}: {
    question: QuestionData;
    index: number;
    errors: Record<string, string>;
    disabled: boolean;
    onSetCorrectChoice: QuestionCardProps['onSetCorrectChoice'];
}) {
    const prefix = `questions.${index}`;
    const correctIndex = question.choices.findIndex((c) => c.is_correct);
    const value = correctIndex === 0 ? 'true' : 'false';

    return (
        <div className="space-y-1.5">
            <Label>Correct Answer</Label>
            <InputError message={errors[`${prefix}.choices`]} />
            <RadioGroup
                value={value}
                onValueChange={(v) =>
                    onSetCorrectChoice(index, v === 'true' ? 0 : 1)
                }
                disabled={disabled}
                className="flex gap-6"
            >
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="true" id={`${prefix}.tf.true`} />
                    <Label
                        htmlFor={`${prefix}.tf.true`}
                        className="font-normal"
                    >
                        True
                    </Label>
                </div>
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="false" id={`${prefix}.tf.false`} />
                    <Label
                        htmlFor={`${prefix}.tf.false`}
                        className="font-normal"
                    >
                        False
                    </Label>
                </div>
            </RadioGroup>
        </div>
    );
}

function WrittenFields({
    question,
    index,
    errors,
    disabled,
    onUpdate,
}: {
    question: QuestionData;
    index: number;
    errors: Record<string, string>;
    disabled: boolean;
    onUpdate: QuestionCardProps['onUpdate'];
}) {
    const prefix = `questions.${index}`;

    return (
        <div className="space-y-1.5">
            <Label htmlFor={`${prefix}.grading_guidelines`}>
                Grading Guidelines / Ideal Answer
            </Label>
            <Textarea
                id={`${prefix}.grading_guidelines`}
                value={question.grading_guidelines}
                onChange={(e) =>
                    onUpdate(index, 'grading_guidelines', e.target.value)
                }
                placeholder="Describe the key points the AI should look for when grading..."
                rows={4}
                disabled={disabled}
            />
            <InputError
                message={errors[`${prefix}.grading_guidelines`]}
            />
        </div>
    );
}
