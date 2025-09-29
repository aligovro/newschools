<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated',
                    'error' => 'Authentication required'
                ], 401);
            }

            // For web requests, redirect to login
            return redirect()->route('login');
        }

        // Check if user has the required permission
        if (!auth()->user()->can($permission)) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Insufficient permissions',
                    'error' => 'Access denied',
                    'required_permission' => $permission
                ], 403);
            }

            // For web requests, redirect to dashboard with error message
            return redirect()->route('dashboard')->with('error', 'У вас нет прав для доступа к этой странице');
        }

        return $next($request);
    }
}
