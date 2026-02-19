<?php

namespace App\Services\Beget;

use Exception;

class BegetApiException extends Exception
{
    public function __construct(
        string $message,
        private readonly ?string $begetErrorCode = null,
        int $code = 0,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }

    public function getBegetErrorCode(): ?string
    {
        return $this->begetErrorCode;
    }
}
