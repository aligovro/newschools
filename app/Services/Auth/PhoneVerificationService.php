<?php

namespace App\Services\Auth;

use App\Exceptions\SmsGatewayException;
use App\Models\Organization;
use App\Models\PhoneVerification;
use App\Models\User;
use App\Services\Sms\SmsGateway;
use App\Support\PhoneNumber;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PhoneVerificationService
{
    public const CODE_TTL_MINUTES = 5;
    public const MAX_ATTEMPTS = 5;
    public const RESEND_COOLDOWN_SECONDS = 60;
    public const MAX_RESENDS = 5;

    public function __construct(private SmsGateway $smsGateway)
    {
    }

    /**
     * Request new verification code for phone.
     *
     * @throws ValidationException
     * @throws SmsGatewayException
     */
    public function requestCode(string $phone, ?int $organizationId = null, ?User $user = null): PhoneVerification
    {
        $normalizedPhone = PhoneNumber::normalize($phone);

        if (! $normalizedPhone) {
            throw ValidationException::withMessages([
                'phone' => __('Введите корректный номер мобильного телефона.'),
            ]);
        }

        /** @var PhoneVerification|null $existing */
        $existing = PhoneVerification::query()
            ->where('phone', $normalizedPhone)
            ->whereNull('verified_at')
            ->latest('id')
            ->first();

        $now = now();

        if ($existing && $existing->last_sent_at && $now->diffInSeconds($existing->last_sent_at) < self::RESEND_COOLDOWN_SECONDS) {
            $secondsLeft = self::RESEND_COOLDOWN_SECONDS - $now->diffInSeconds($existing->last_sent_at);

            throw ValidationException::withMessages([
                'phone' => __('Код уже отправлен. Запросите новый через :seconds секунд.', [
                    'seconds' => max($secondsLeft, 1),
                ]),
            ]);
        }

        if ($existing && $existing->resend_count >= self::MAX_RESENDS) {
            throw ValidationException::withMessages([
                'phone' => __('Превышено количество попыток. Попробуйте позже.'),
            ]);
        }

        $verification = $existing ?? new PhoneVerification([
            'phone' => $normalizedPhone,
        ]);

        $verification->organization_id = $organizationId;
        $verification->user_id = $user?->id ?? $verification->user_id;
        $verification->resend_count = ($existing?->resend_count ?? 0) + 1;
        $verification->attempts = 0;
        $verification->expires_at = now()->addMinutes(self::CODE_TTL_MINUTES);
        $verification->last_sent_at = now();
        $verification->verified_at = null;

        $code = sprintf('%06d', random_int(0, 999999));
        $verification->code_hash = Hash::make($code);

        DB::transaction(function () use ($verification, $code, $normalizedPhone) {
            $verification->save();
            $this->smsGateway->sendVerificationCode($normalizedPhone, $code);
        });

        return $verification->refresh();
    }

    /**
     * Verify code and return authenticated user.
     *
     * @throws ValidationException
     */
    public function verifyCode(string $token, string $code, ?int $organizationId = null, bool $remember = false): array
    {
        /** @var PhoneVerification|null $verification */
        $verification = PhoneVerification::query()
            ->where('token', $token)
            ->first();

        if (! $verification) {
            throw ValidationException::withMessages([
                'code' => __('Код подтверждения недействителен. Запросите новый.'),
            ]);
        }

        if ($verification->verified_at) {
            throw ValidationException::withMessages([
                'code' => __('Код уже был использован. Запросите новый.'),
            ]);
        }

        if ($verification->expires_at->isPast()) {
            throw ValidationException::withMessages([
                'code' => __('Срок действия кода истек. Запросите новый.'),
            ]);
        }

        if ($verification->attempts >= self::MAX_ATTEMPTS) {
            throw ValidationException::withMessages([
                'code' => __('Превышено количество попыток. Запросите новый код.'),
            ]);
        }

        if (! Hash::check($code, $verification->code_hash)) {
            $verification->increment('attempts');

            throw ValidationException::withMessages([
                'code' => __('Неверный код. Попробуйте ещё раз.'),
            ]);
        }

        $verification->markVerified();

        [$user, $isNewUser] = $this->resolveUser($verification);

        if ($organizationId || $verification->organization_id) {
            $this->attachSponsorToOrganization(
                $user,
                $organizationId ?? $verification->organization_id
            );
        }

        Auth::login($user, $remember);

        return [
            'user' => $user->fresh(['roles', 'permissions', 'organizations']),
            'verification' => $verification,
            'is_new_user' => $isNewUser,
        ];
    }

    private function resolveUser(PhoneVerification $verification): array
    {
        $normalizedPhone = $verification->phone;

        /** @var User|null $existingUser */
        $existingUser = User::query()
            ->where('phone', $normalizedPhone)
            ->first();

        if ($existingUser) {
            if (! $existingUser->phone_verified_at) {
                $existingUser->phone_verified_at = now();
                $existingUser->save();
            }

            return [$existingUser->fresh(), false];
        }

        /** @var User|null $linkedUser */
        $linkedUser = $verification->user;

        if ($linkedUser) {
            $linkedUser->update([
                'phone' => $normalizedPhone,
                'phone_verified_at' => now(),
            ]);

            return [$linkedUser->fresh(), false];
        }

        $user = User::create([
            'name' => __('Спонсор :tail', ['tail' => substr($normalizedPhone, -4)]),
            'phone' => $normalizedPhone,
            'phone_verified_at' => now(),
            'password' => Hash::make(Str::random(32)),
            'is_active' => true,
        ]);

        $user->assignRole('sponsor');

        return [$user->fresh(), true];
    }

    public function attachSponsorToOrganization(User $user, ?int $organizationId): void
    {
        if (! $organizationId) {
            return;
        }

        /** @var Organization|null $organization */
        $organization = Organization::find($organizationId);

        if (! $organization) {
            return;
        }

        $organization->users()->syncWithoutDetaching([
            $user->id => [
                'role' => 'sponsor',
                'status' => 'active',
                'permissions' => null,
                'joined_at' => now(),
                'last_active_at' => now(),
            ],
        ]);

        if (! $user->hasRole('sponsor')) {
            $user->assignRole('sponsor');
        }
    }
}


