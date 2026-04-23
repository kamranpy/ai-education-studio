<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isInstituteAdmin()
            && $this->route('exam')->isDraft();
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1', 'max:480'],
            'passing_score' => ['required', 'integer', 'min:0', 'max:100'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.type' => ['required', 'string', 'in:mcq,tf,written'],
            'questions.*.text' => ['required', 'string', 'max:5000'],
            'questions.*.points' => ['required', 'integer', 'min:1', 'max:100'],
            'questions.*.grading_guidelines' => ['nullable', 'required_if:questions.*.type,written', 'string', 'max:10000'],
            'questions.*.choices' => ['required_if:questions.*.type,mcq', 'array', 'min:2'],
            'questions.*.choices.*.text' => ['required_with:questions.*.choices', 'string', 'max:1000'],
            'questions.*.choices.*.is_correct' => ['required_with:questions.*.choices', 'boolean'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'questions.*.choices.required_if' => 'Multiple choice questions must have at least 2 choices.',
            'questions.*.grading_guidelines.required_if' => 'Written questions require grading guidelines.',
        ];
    }
}
