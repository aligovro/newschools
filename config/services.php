<?php

return [

  /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

  'postmark' => [
    'token' => env('POSTMARK_TOKEN'),
  ],

  'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
  ],

  'resend' => [
    'key' => env('RESEND_KEY'),
  ],

  'slack' => [
    'notifications' => [
      'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
      'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
    ],
  ],

  'smsc' => [
    'endpoint' => env('SMSC_ENDPOINT', 'https://smsc.ru/sys/send.php'),
    'timeout' => env('SMSC_TIMEOUT', 10),
    'login' => env('SMSC_LOGIN'),
    'password' => env('SMSC_PASSWORD'),
    'sender' => env('SMSC_SENDER'),
  ],

  'yookassa_partner' => [
    'client_id' => env('YOOKASSA_CLIENT_ID'),
    'secret_key' => env('YOOKASSA_CLIENT_SECRET'),
    'callback_url' => env('YOOKASSA_CALLBACK_URL'),
    'base_url' => env('YOOKASSA_PARTNER_BASE_URL', 'https://api.yookassa.ru'),
    'oauth_url' => env('YOOKASSA_OAUTH_URL', 'https://yookassa.ru/oauth/v2'),
  ],

];
