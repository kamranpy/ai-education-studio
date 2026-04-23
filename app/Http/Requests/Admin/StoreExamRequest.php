<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isInstituteAdmin();
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1', 'max:480'],
            'passing_score' => ['required', 'integer', 'min:0', 'max:100'],
            'status' => ['sometimes', 'string', 'in:draft,published'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.type' => ['required', 'string', 'in:mcq,true_false,written_answer'],
            'questions.*.text' => ['required', 'string', 'max:5000'],
            'questions.*.points' => ['required', 'integer', 'min:1', 'max:100'],
            'questions.*.grading_guidelines' => ['nullable', 'string', 'max:10000'],
            'questions.*.choices' => ['nullable', 'array'],
            'questions.*.choices.*.text' => ['required_with:questions.*.choices', 'string', 'max:1000'],
            'questions.*.choices.*.is_correct' => ['required_with:questions.*.choices', 'boolean'],
        ];
    }

    /** @return array<int, \Closure> */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                foreach ($this->input('questions', []) as $i => $question) {
                    $type = $question['type'] ?? '';

                    if ($type === 'mcq' && (empty($question['choices']) || count($question['choices']) < 2)) {
                        $validator->errors()->add("questions.{$i}.choices", 'Multiple choice questions must have at least 2 choices.');
                    }

                    if ($type === 'true_false' && (empty($question['choices']) || count($question['choices']) !== 2)) {
                        $validator->errors()->add("questions.{$i}.choices", 'True/False questions must have exactly 2 choices.');
                    }

                    if ($type === 'written_answer' && empty($question['grading_guidelines'])) {
                        $validator->errors()->add("questions.{$i}.grading_guidelines", 'Written questions require grading guidelines.');
                    }
                }
            },
        ];
    }
}
