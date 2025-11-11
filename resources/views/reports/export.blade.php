<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111827; }
        h1 { font-size: 20px; margin-bottom: 12px; }
        h2 { font-size: 16px; margin-top: 18px; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th, td { border: 1px solid #d1d5db; padding: 6px 8px; }
        th { background-color: #f3f4f6; text-align: left; }
        .section { margin-bottom: 16px; }
        .meta-list { list-style: none; padding: 0; margin: 0; }
        .meta-list li { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .meta-label { color: #6b7280; margin-right: 8px; }
        .meta-value { font-weight: 600; }
    </style>
</head>
<body>
    <h1>{{ $title }}</h1>

    @if (!empty($summary))
        <div class="section">
            <h2>Сводка</h2>
            <ul class="meta-list">
                @foreach ($summary as $row)
                    <li>
                        <span class="meta-label">{{ $row['label'] }}</span>
                        <span class="meta-value">{{ $row['value'] }}</span>
                    </li>
                @endforeach
            </ul>
        </div>
    @endif

    @if (!empty($parameters))
        <div class="section">
            <h2>Параметры отчета</h2>
            <ul class="meta-list">
                @foreach ($parameters as $row)
                    <li>
                        <span class="meta-label">{{ $row['label'] }}</span>
                        <span class="meta-value">{{ $row['value'] }}</span>
                    </li>
                @endforeach
            </ul>
        </div>
    @endif

    @foreach ($tables as $table)
        <div class="section">
            <h2>{{ $table['title'] }}</h2>
            <table>
                <thead>
                    <tr>
                        @foreach ($table['headers'] as $header)
                            <th>{{ $header }}</th>
                        @endforeach
                    </tr>
                </thead>
                <tbody>
                    @foreach ($table['rows'] as $row)
                        <tr>
                            @foreach ($row as $value)
                                <td>{{ $value }}</td>
                            @endforeach
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endforeach

    <p style="margin-top: 24px; color: #6b7280; font-size: 10px;">Сформировано: {{ \Carbon\Carbon::parse($generated_at)->format('d.m.Y H:i') }}</p>
</body>
</html>


