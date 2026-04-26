<?php

namespace App\Services\Llm;

use Prism\Prism\ValueObjects\Usage;

class GradingResult
{
    public function __construct(
        public readonly float $score,
        public readonly float $confidence,
        public readonly string $explanation,
        public readonly array $axes,
        public readonly ?Usage $usage,
        public readonly string $providerLabel,
        public readonly string $model,
    ) {}

    public static function fromArray(array $data, ?Usage $usage, string $providerLabel, string $model): self
    {
        return new self(
            score: (float) ($data['score'] ?? 0),
            confidence: (float) ($data['confidence'] ?? 0),
            explanation: (string) ($data['explanation'] ?? ''),
            axes: $data['axes'] ?? [],
            usage: $usage,
            providerLabel: $providerLabel,
            model: $model,
        );
    }
}
