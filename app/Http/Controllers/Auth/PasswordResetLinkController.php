<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Concerns\HasSiteWidgets;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\PhoneNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    use HasSiteWidgets;
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        $data = $this->getSiteWidgetsAndPositions();

        return Inertia::render('auth/forgot-password', array_merge($data, [
            'status' => $request->session()->get('status'),
        ]));
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string'],
        ]);

        if (! $request->filled('email') && ! $request->filled('phone')) {
            return back()
                ->withErrors([
                    'email' => __('Укажите email или номер телефона'),
                    'phone' => __('Укажите email или номер телефона'),
                ])
                ->withInput();
        }

        // Если указали телефон, пытаемся найти пользователя по телефону и отправить ссылку на его email
        if (! $request->filled('email') && $request->filled('phone')) {
            $normalized = PhoneNumber::normalize($request->input('phone'));

            if ($normalized) {
                $user = User::query()
                    ->where('phone', $normalized)
                    ->whereNotNull('email')
                    ->first();

                if ($user) {
                    $request->merge(['email' => $user->email]);
                }
            }
        }

        if (! $request->filled('email')) {
            return back()
                ->withErrors([
                    'email' => __('Для указанного номера не найден аккаунт с email'),
                ])
                ->withInput();
        }

        Password::sendResetLink(
            $request->only('email')
        );

        return back()->with('status', __('A reset link will be sent if the account exists.'));
    }
}
