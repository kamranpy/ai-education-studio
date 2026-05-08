import SuperAdminLayout from '@/layouts/super-admin-layout';
import { useForm, router } from '@inertiajs/react';
import { Bot, Eye, EyeOff, KeyRound, Loader2, Server } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Provider {
    value: string;
    label: string;
}

interface Setting {
    id: number;
    provider: string;
    model: string;
    has_api_key: boolean;
    masked_api_key: string | null;
    base_url: string | null;
    extra: Record<string, unknown> | null;
}

interface Props {
    setting: Setting | null;
    providers: Provider[];
}

const recommendedModels: Record<string, string[]> = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1-mini'],
    anthropic: ['claude-3-7-sonnet-latest', 'claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
    google: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    'openai-compatible': ['deepseek-chat', 'llama-3.3-70b-versatile', 'qwen-max'],
};

function Llm({ setting, providers }: Props) {
    const [showKey, setShowKey] = useState(false);
    const [replacingKey, setReplacingKey] = useState(!setting?.has_api_key);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const [isCustomModel, setIsCustomModel] = useState(() => {
        const currentProvider = setting?.provider || 'openai';
        const currentModel = setting?.model || '';
        const suggested = recommendedModels[currentProvider] || [];
        return currentModel !== '' && !suggested.includes(currentModel);
    });

    const form = useForm({
        provider: setting?.provider || 'openai',
        model: setting?.model || '',
        api_key: '',
        base_url: setting?.base_url || '',
    });

    const isOpenAICompatible = form.data.provider === 'openai-compatible';
    const suggestedModels = recommendedModels[form.data.provider] || [];

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        form.post('/super-admin/llm', {
            preserveScroll: true,
        });
    }

    async function handleTestConnection() {
        setTesting(true);
        setTestResult(null);

        try {
            const response = await fetch('/super-admin/llm/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    provider: form.data.provider,
                    model: form.data.model,
                    api_key:
                        form.data.api_key ||
                        (setting?.has_api_key ? '__EXISTING__' : ''),
                    base_url: form.data.base_url || null,
                }),
            });

            const data = await response.json();
            setTestResult({
                success: data.success,
                message: data.message,
            });
        } catch {
            setTestResult({
                success: false,
                message:
                    'Network error. Check your connection and try again.',
            });
        } finally {
            setTesting(false);
        }
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    LLM Provider Settings
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Configure the AI model used to grade written answers
                    across all institutes.
                </p>
            </div>

            <form onSubmit={handleSave}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="size-5" />
                            Provider Configuration
                        </CardTitle>
                        <CardDescription>
                            Select your AI provider and enter the
                            credentials. Only one provider can be active at
                            a time.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Provider */}
                        <div className="space-y-2">
                            <Label htmlFor="provider">Provider</Label>
                            <Select
                                value={form.data.provider}
                                onValueChange={(value) => {
                                    const isDifferentProvider = value !== setting?.provider;
                                    form.setData((data) => ({
                                        ...data,
                                        provider: value,
                                        model: '',
                                        api_key: isDifferentProvider ? '' : data.api_key,
                                    }));
                                    if (isDifferentProvider) {
                                        setReplacingKey(true);
                                    } else if (setting?.has_api_key) {
                                        setReplacingKey(false);
                                    }
                                    setIsCustomModel(false);
                                }}
                            >
                                <SelectTrigger id="provider">
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    {providers.map((p) => (
                                        <SelectItem
                                            key={p.value}
                                            value={p.value}
                                        >
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.provider && (
                                <p className="text-sm text-destructive">
                                    {form.errors.provider}
                                </p>
                            )}
                        </div>

                        {/* Model */}
                        <div className="space-y-2">
                            <Label htmlFor="model">Model</Label>

                            {!isCustomModel && suggestedModels.length > 0 ? (
                                <Select
                                    value={form.data.model}
                                    onValueChange={(val) => {
                                        if (val === '__custom__') {
                                            setIsCustomModel(true);
                                            form.setData('model', '');
                                        } else {
                                            form.setData('model', val);
                                        }
                                    }}
                                >
                                    <SelectTrigger id="model" className="font-mono text-sm">
                                        <SelectValue placeholder="Select a recommended model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suggestedModels.map((m) => (
                                            <SelectItem key={m} value={m}>
                                                {m}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="__custom__" className="font-sans font-medium text-primary">
                                            Other (Type custom model)...
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="space-y-1">
                                    <Input
                                        id="model"
                                        value={form.data.model}
                                        onChange={(e) =>
                                            form.setData('model', e.target.value)
                                        }
                                        placeholder="Type custom model string..."
                                        className="font-mono text-sm"
                                    />
                                    {suggestedModels.length > 0 && (
                                        <button 
                                            type="button" 
                                            onClick={() => setIsCustomModel(false)}
                                            className="text-xs text-primary hover:underline transition-colors"
                                        >
                                            ← Back to recommended list
                                        </button>
                                    )}
                                </div>
                            )}

                            {form.errors.model && (
                                <p className="text-sm text-destructive">
                                    {form.errors.model}
                                </p>
                            )}
                        </div>

                        {/* API Key */}
                        <div className="space-y-2">
                            <Label htmlFor="api_key">
                                <span className="flex items-center gap-1.5">
                                    <KeyRound className="size-3.5" />
                                    API key
                                </span>
                            </Label>

                            {setting?.has_api_key && !replacingKey ? (
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 flex-1 items-center rounded-md border border-input bg-muted px-3 font-mono text-xs text-muted-foreground">
                                        {setting.masked_api_key ||
                                            'sk-•••••••'}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setReplacingKey(true)
                                        }
                                    >
                                        Replace key
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Input
                                        id="api_key"
                                        type={
                                            showKey ? 'text' : 'password'
                                        }
                                        value={form.data.api_key}
                                        onChange={(e) =>
                                            form.setData(
                                                'api_key',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="sk-..."
                                        className="pr-10 font-mono text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                                        onClick={() =>
                                            setShowKey(!showKey)
                                        }
                                    >
                                        {showKey ? (
                                            <EyeOff className="size-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="size-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            )}

                            {form.errors.api_key && (
                                <p className="text-sm text-destructive">
                                    {form.errors.api_key}
                                </p>
                            )}
                        </div>

                        {/* Base URL — only for openai-compatible */}
                        {isOpenAICompatible && (
                            <div className="space-y-2">
                                <Label htmlFor="base_url">Base URL</Label>
                                <Input
                                    id="base_url"
                                    value={form.data.base_url}
                                    onChange={(e) =>
                                        form.setData(
                                            'base_url',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://api.deepseek.com"
                                    className="font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Used for OpenAI-compatible providers
                                    (DeepSeek, Qwen, Together, OpenRouter,
                                    Groq, Ollama, …).
                                </p>
                                {form.errors.base_url && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.base_url}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Test Result */}
                        {testResult && (
                            <div
                                className={`rounded-md border p-3 text-sm ${
                                    testResult.success
                                        ? 'border-border bg-secondary text-secondary-foreground'
                                        : 'border-destructive/30 bg-destructive/10 text-destructive'
                                }`}
                                role="status"
                            >
                                {testResult.message}
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex gap-3">
                        <Button
                            type="submit"
                            disabled={form.processing}
                        >
                            {form.processing && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            Save settings
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={
                                form.processing ||
                                testing ||
                                !form.data.model
                            }
                            onClick={handleTestConnection}
                        >
                            {testing && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            Test connection
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}

Llm.layout = (page: React.ReactNode) => (
    <SuperAdminLayout>{page}</SuperAdminLayout>
);

export default Llm;
