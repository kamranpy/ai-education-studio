<?php

namespace App\Enums;

use Prism\Prism\Enums\Provider as PrismProvider;

enum LlmProvider: string
{
    case OpenAI = 'openai';
    case Anthropic = 'anthropic';
    case Google = 'google';
    case OpenAICompatible = 'openai-compatible';

    public function toPrism(): PrismProvider
    {
        return match ($this) {
            self::OpenAI => PrismProvider::OpenAI,
            self::Anthropic => PrismProvider::Anthropic,
            self::Google => PrismProvider::Gemini,
            self::OpenAICompatible => PrismProvider::OpenAI, // routed via base_url override
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::OpenAI => 'OpenAI',
            self::Anthropic => 'Anthropic',
            self::Google => 'Google Gemini',
            self::OpenAICompatible => 'OpenAI-compatible (DeepSeek, Qwen, Together, OpenRouter, Groq, Ollama, …)',
        };
    }
}
