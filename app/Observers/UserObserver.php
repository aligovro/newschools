<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Support\Facades\Cookie;

class UserObserver
{
  public function creating(User $user): void
  {
    // Attempt to capture referrer from cookie and set referred_by_id once
    try {
      if (empty($user->referred_by_id)) {
        $cookieRef = request()->cookie('ref_user_id');
        if ($cookieRef) {
          $referrerId = (int) preg_replace('/\D/', '', (string) $cookieRef);
          if ($referrerId > 0 && $referrerId !== (int) $user->id) {
            $user->referred_by_id = $referrerId;
          }
        }
      }
    } catch (\Throwable $_) {
      // ignore
    }
  }
}
