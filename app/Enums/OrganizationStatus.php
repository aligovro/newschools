<?php

namespace App\Enums;

enum OrganizationStatus: string
{
  case Active = 'active';
  case Inactive = 'inactive';
  case Pending = 'pending';
}
