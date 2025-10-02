<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Новая отправка формы</title>
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
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .form-data {
            background-color: #ffffff;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
        }

        .field {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #f1f3f4;
        }

        .field:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }

        .field-label {
            font-weight: bold;
            color: #495057;
            margin-bottom: 5px;
        }

        .field-value {
            color: #212529;
            word-wrap: break-word;
        }

        .meta-info {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
            font-size: 14px;
            color: #6c757d;
        }

        .meta-item {
            margin-bottom: 5px;
        }

        .meta-item:last-child {
            margin-bottom: 0;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>📋 Новая отправка формы</h1>
        <p><strong>Форма:</strong> {{ $formWidget->name }}</p>
        <p><strong>Сайт:</strong> {{ $site->name ?? 'Неизвестно' }}</p>
        <p><strong>Время:</strong> {{ $submission->created_at->format('d.m.Y H:i:s') }}</p>
    </div>

    <div class="form-data">
        <h2>Данные формы:</h2>

        @foreach($formData as $fieldName => $value)
        @php
        $field = $formWidget->fields->firstWhere('name', $fieldName);
        $fieldLabel = $field ? $field->label : $fieldName;
        $displayValue = is_array($value) ? implode(', ', $value) : $value;
        @endphp

        <div class="field">
            <div class="field-label">{{ $fieldLabel }}:</div>
            <div class="field-value">{{ $displayValue ?: '(пусто)' }}</div>
        </div>
        @endforeach
    </div>

    <div class="meta-info">
        <div class="meta-item"><strong>ID отправки:</strong> {{ $submission->id }}</div>
        <div class="meta-item"><strong>IP адрес:</strong> {{ $submission->ip_address ?? 'Неизвестно' }}</div>
        <div class="meta-item"><strong>User Agent:</strong> {{ $submission->user_agent ?? 'Неизвестно' }}</div>
        @if($submission->referer)
        <div class="meta-item"><strong>Источник:</strong> {{ $submission->referer }}</div>
        @endif
    </div>
</body>

</html>