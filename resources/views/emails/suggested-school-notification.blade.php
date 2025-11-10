<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Новая предложенная школа</title>
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

        .school-data {
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

        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3259ff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
        }

        .button:hover {
            background-color: #2545cc;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>🏫 Новая предложенная школа</h1>
        <p><strong>Время:</strong> {{ $suggestedOrganization->created_at->format('d.m.Y H:i:s') }}</p>
    </div>

    <div class="school-data">
        <h2>Информация о школе:</h2>

        <div class="field">
            <div class="field-label">Название школы:</div>
            <div class="field-value">{{ $suggestedOrganization->name }}</div>
        </div>

        @if($suggestedOrganization->city_name)
        <div class="field">
            <div class="field-label">Город:</div>
            <div class="field-value">{{ $suggestedOrganization->city_name }}</div>
        </div>
        @endif

        @if($suggestedOrganization->address)
        <div class="field">
            <div class="field-label">Адрес:</div>
            <div class="field-value">{{ $suggestedOrganization->address }}</div>
        </div>
        @endif

        @if($suggestedOrganization->latitude && $suggestedOrganization->longitude)
        <div class="field">
            <div class="field-label">Координаты:</div>
            <div class="field-value">
                Широта: {{ $suggestedOrganization->latitude }}, Долгота: {{ $suggestedOrganization->longitude }}
                <br>
                <a href="https://yandex.ru/maps/?pt={{ $suggestedOrganization->longitude }},{{ $suggestedOrganization->latitude }}&z=15"
                    target="_blank">Открыть на карте</a>
            </div>
        </div>
        @endif
    </div>

    <div class="meta-info">
        <div class="meta-item"><strong>ID заявки:</strong> {{ $suggestedOrganization->id }}</div>
        <div class="meta-item"><strong>Статус:</strong> {{ $suggestedOrganization->status === 'pending' ? 'Ожидает рассмотрения' : $suggestedOrganization->status }}</div>
    </div>

    <div style="text-align: center; margin-top: 30px;">
        <a href="{{ url('/dashboard/suggested-organizations') }}" class="button">Перейти к управлению</a>
    </div>
</body>

</html>