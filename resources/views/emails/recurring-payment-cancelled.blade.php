<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Автоплатёж отменён</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0 0 8px;
            font-size: 20px;
            color: #856404;
        }
        .card {
            background-color: #ffffff;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
        }
        .field {
            margin-bottom: 14px;
            padding-bottom: 14px;
            border-bottom: 1px solid #f1f3f4;
        }
        .field:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .field-label {
            font-weight: bold;
            color: #495057;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
        }
        .field-value {
            color: #212529;
            font-size: 15px;
        }
        .note {
            background-color: #f8f9fa;
            padding: 14px 16px;
            border-radius: 6px;
            margin-top: 20px;
            font-size: 13px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Автоплатёж отменён</h1>
        <p style="margin: 0; color: #856404;">
            Ваша подписка на регулярное пожертвование была автоматически отменена.
        </p>
    </div>

    <div class="card">
        @if($organization)
        <div class="field">
            <div class="field-label">Организация</div>
            <div class="field-value">{{ $organization->name }}</div>
        </div>
        @endif
        <div class="field">
            <div class="field-label">Сумма пожертвования</div>
            <div class="field-value">{{ $amountFormatted }}</div>
        </div>
        <div class="field">
            <div class="field-label">Причина отмены</div>
            <div class="field-value">
                Платёж не прошёл {{ config('payments.recurring.max_failed_attempts', 3) }} раза подряд.
                Пожалуйста, обновите платёжные данные и оформите новую подписку.
            </div>
        </div>
    </div>

    <div class="note">
        Если вы хотите возобновить регулярные пожертвования — перейдите на сайт и оформите подписку заново.<br>
        Если это произошло по ошибке — обратитесь в поддержку.
    </div>
</body>
</html>
