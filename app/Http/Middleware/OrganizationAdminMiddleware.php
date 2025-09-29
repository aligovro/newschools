<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class OrganizationAdminMiddleware
{
  /**
   * Handle an incoming request.
   *
   * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
   */
  public function handle(Request $request, Closure $next): Response
  {
    $user = Auth::user();

    if (!$user) {
      return redirect()->route('login');
    }

    $organization = $request->route('organization');

    if (!$organization) {
      abort(404, 'Организация не найдена');
    }

    // Проверяем, является ли пользователь администратором организации
    $isAdmin = $organization->users()
      ->where('user_id', $user->id)
      ->where('role', 'admin')
      ->exists();

    // Также проверяем, является ли пользователь супер-администратором
    $isSuperAdmin = $user->hasRole('super_admin') || $user->hasRole('admin');

    if (!$isAdmin && !$isSuperAdmin) {
      abort(403, 'У вас нет прав для доступа к админ-панели этой организации');
    }

    // Добавляем организацию в request для удобства
    $request->merge(['current_organization' => $organization]);

    return $next($request);
  }
}
