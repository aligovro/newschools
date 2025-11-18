<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\HasSiteWidgets;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    use HasSiteWidgets;

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('dashboard/settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Show the user's profile page.
     */
    public function show(Request $request): Response
    {
        $data = $this->getSiteWidgetsAndPositions();

        return Inertia::render('main-site/ProfilePage', array_merge($data, [
            'user' => $request->user()->only([
                'id',
                'name',
                'email',
                'phone',
                'photo',
                'email_verified_at',
                'phone_verified_at',
            ]),
        ]));
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // Handle photo deletion
        if ($request->boolean('delete_photo')) {
            // Удаляем старое фото если оно есть
            if ($user->photo && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->photo)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->photo);
            }
            $validated['photo'] = null;
            unset($validated['delete_photo']);
        } elseif ($request->hasFile('photo')) {
            // Удаляем старое фото перед загрузкой нового
            if ($user->photo && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->photo)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->photo);
            }
            $photo = $request->file('photo');
            $path = $photo->store('users/photos', 'public');
            $validated['photo'] = $path;
            unset($validated['delete_photo']);
        } else {
            unset($validated['photo']);
            unset($validated['delete_photo']);
        }

        // Handle password update
        if (!empty($validated['password'])) {
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        } else {
            unset($validated['password']);
            unset($validated['password_confirmation']);
        }

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return redirect()
            ->route('profile.show')
            ->with('success', 'Профиль успешно обновлен')
            ->with([
                'user' => $user->fresh()->only([
                    'id',
                    'name',
                    'email',
                    'phone',
                    'photo',
                    'email_verified_at',
                    'phone_verified_at',
                ]),
            ]);
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
