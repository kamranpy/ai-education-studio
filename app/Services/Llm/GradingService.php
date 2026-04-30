<?php

namespace App\Services\Llm;

use App\Models\LlmSetting;
use App\Models\Question;
use Illuminate\Support\Facades\Config;
use Prism\Prism\Facades\Prism;
use Prism\Prism\Schema\NumberSchema;
use Prism\Prism\Schema\ObjectSchema;
use Prism\Prism\Schema\StringSchema;

class GradingService
{
    /**
     * Grade a written answer using the active LLM provider via Prism.
     */
    public function gradeWrittenAnswer(Question $question, string $studentAnswer): GradingResult
    {
        $setting = LlmSetting::where('is_active', true)->firstOrFail();

        $schema = new ObjectSchema(
            name: 'grading',
            description: 'Grading result for a written answer',
            properties: [
                new NumberSchema('score', "Score in 0..{$question->points}"),
                new NumberSchema('confidence', '0..1 self-rated confidence'),
                new StringSchema('explanation', 'Why this score (1-3 sentences)'),
                new ObjectSchema('axes', 'Per-axis scores 0..1', [
                    new NumberSchema('concept', 'Conceptual correctness'),
                    new NumberSchema('logic', 'Logical reasoning'),
                    new NumberSchema('terminology', 'Correct terminology'),
                ], requiredFields: ['concept', 'logic', 'terminology']),
            ],
            requiredFields: ['score', 'confidence', 'explanation', 'axes'],
        );

        $prismProviderName = $setting->provider->toPrism()->value;

        // Dynamically override Prism's configuration so it uses the stored credentials
        if ($setting->api_key) {
            Config::set("prism.providers.{$prismProviderName}.api_key", $setting->api_key);
        }
        
        if ($setting->base_url) {
            Config::set("prism.providers.{$prismProviderName}.url", $setting->base_url);
        }

        $response = Prism::structured()
            ->using($setting->provider->toPrism(), $setting->model)
            ->withSchema($schema)
            ->withSystemPrompt(view('llm.grading-system', [
                'maxMarks' => $question->points,
            ])->render())
            ->withPrompt(view('llm.grading-user', [
                'question' => $question->text,
                'rubric' => $question->grading_guidelines,
                'studentAnswer' => $this->safeWrap($studentAnswer),
                'maxMarks' => $question->points,
            ])->render())
            ->asStructured();

        return GradingResult::fromArray(
            $response->structured,
            usage: $response->usage,
            providerLabel: $setting->provider->value,
            model: $setting->model,
        );
    }

    /**
     * Wrap student answer in delimiters and sanitize to prevent prompt injection.
     */
    private function safeWrap(string $answer): string
    {
        // Strip closing delimiters that could escape the wrapper.
        $sanitized = str_replace(['</student_answer>', '<student_answer>'], '', $answer);

        return "<student_answer>\n{$sanitized}\n</student_answer>";
    }
}
