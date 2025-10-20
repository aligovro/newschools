<?php

namespace App\Enums;

enum SiteStatus: string
{
  case Draft = 'draft';
  case Published = 'published';
  case Archived = 'archived';
}
