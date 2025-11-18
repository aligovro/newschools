<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Concerns\HasSiteWidgets;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Rules\RussianPhoneNumber;
use App\Support\PhoneNumber;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    use HasSiteWidgets;
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        $data = $this->getSiteWidgetsAndPositions();

        return Inertia::render('auth/register', $data);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->filled('phone')) {
            $normalized = PhoneNumber::normalize($request->input('phone'));
            if ($normalized) {
                $request->merge(['phone' => $normalized]);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'nullable',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class, 'email'),
            ],
            'phone' => ['nullable', new RussianPhoneNumber(), Rule::unique(User::class, 'phone')],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        if (empty($validated['email']) && empty($validated['phone'])) {
            return back()->withErrors([
                'email' => __('Укажите email или номер телефона'),
                'phone' => __('Укажите email или номер телефона'),
            ])->withInput();
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
