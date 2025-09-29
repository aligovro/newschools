<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Organization;

class OrganizationAdminAccess
{
  /**
   * Handle an incoming request.
   *
   * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
   */
  public function handle(Request $request, Closure $next): Response
  {
    $organization = $request->route('organization');

    // Если организация не найдена
    if (!$organization) {
      abort(404, 'Организация не найдена');
    }

    // Проверяем, что пользователь аутентифицирован
    if (!auth()->check()) {
      return redirect()->route('login');
    }

    // Проверяем, что пользователь имеет доступ к админке этой организации
    $user = auth()->user();

    // Проверяем, является ли пользователь владельцем организации
    if ($organization->user_id !== $user->id) {
      // Проверяем, является ли пользователь администратором организации
      $isAdmin = $organization->users()
        ->where('user_id', $user->id)
        ->where('role', 'admin')
        ->exists();

      if (!$isAdmin) {
        abort(403, 'У вас нет доступа к админке этой организации');
      }
    }

    return $next($request);
  }
}
