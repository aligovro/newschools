<?php

namespace App\Rules;

use App\Support\PhoneNumber;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class RussianPhoneNumber implements ValidationRule
{
    public function __construct(private bool $required = true)
    {
    }

    /**
     * Validate the attribute.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value === null || $value === '') {
            if ($this->required) {
                $fail(__('validation.required', ['attribute' => $attribute]));
            }

            return;
        }

        if (! PhoneNumber::isValidRussian($value)) {
            $fail(__('Неверный формат номера телефона'));
        }
    }
}


