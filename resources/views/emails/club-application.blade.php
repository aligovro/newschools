<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Новая заявка на секцию</title>
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
            background-color: #f5f6f8;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0 0 10px;
            font-size: 20px;
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
        .meta {
            background-color: #e9ecef;
            padding: 12px 16px;
            border-radius: 6px;
            margin-top: 20px;
            font-size: 13px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Новая заявка на секцию</h1>
        <p style="margin: 0; color: #555;">
            <strong>Организация:</strong> {{ $organization->name }}
        </p>
    </div>

    <div class="card">
        <div class="field">
            <div class="field-label">Секция / Кружок</div>
            <div class="field-value">{{ $application->club_name }}</div>
        </div>
        <div class="field">
            <div class="field-label">Имя заявителя</div>
            <div class="field-value">{{ $application->applicant_name }}</div>
        </div>
        <div class="field">
            <div class="field-label">Телефон</div>
            <div class="field-value">{{ $application->phone }}</div>
        </div>
        @if($application->email)
        <div class="field">
            <div class="field-label">Электронная почта</div>
            <div class="field-value">{{ $application->email }}</div>
        </div>
        @endif
        @if($application->comment)
        <div class="field">
            <div class="field-label">Комментарий</div>
            <div class="field-value">{{ $application->comment }}</div>
        </div>
        @endif
    </div>

    <div class="meta">
        <div><strong>ID заявки:</strong> {{ $application->id }}</div>
        <div><strong>Дата:</strong> {{ $application->created_at->format('d.m.Y H:i') }}</div>
        @if($application->ip_address)
        <div><strong>IP:</strong> {{ $application->ip_address }}</div>
        @endif
    </div>
</body>
</html>
