<?php

namespace App\Enums;

enum DonationStatus: string
{
  case Pending = 'pending';
  case Completed = 'completed';
  case Failed = 'failed';
  case Cancelled = 'cancelled';
  case Refunded = 'refunded';
}
