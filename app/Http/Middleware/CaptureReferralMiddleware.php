<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;

class CaptureReferralMiddleware
{
  public function handle(Request $request, Closure $next)
  {
    // Capture ?ref= as user_id (numeric) and store in a short-lived cookie
    $ref = $request->query('ref');
    if ($ref !== null) {
      $refId = (int) preg_replace('/\D/', '', (string) $ref);
      if ($refId > 0) {
        $cookie = Cookie::create('ref_user_id')
          ->withValue((string) $refId)
          ->withExpires(time() + (60 * 60 * 24 * 30)) // 30 days
          ->withPath('/')
          ->withSecure($request->isSecure())
          ->withHttpOnly(true)
          ->withSameSite('lax');

        $response = $next($request);
        $response->headers->setCookie($cookie);
        return $response;
      }
    }

    return $next($request);
  }
}
