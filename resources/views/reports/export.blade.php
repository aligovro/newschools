<!DOCTYPE html>
<html lang="ru">
    <head>
        <meta charset="utf-8" />
        <title>{{ $title ?? 'Отчет' }}</title>
        <style>
            * {
                box-sizing: border-box;
            }

            body {
                font-family: "DejaVu Sans", Arial, sans-serif;
                color: #1f2937;
                font-size: 12px;
                margin: 24px;
            }

            h1 {
                font-size: 20px;
                margin-bottom: 8px;
            }

            .meta {
                margin-bottom: 16px;
                color: #4b5563;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 12px;
            }

            th,
            td {
                border: 1px solid #d1d5db;
                padding: 6px 8px;
                text-align: left;
            }

            th {
                background: #f3f4f6;
                font-weight: 600;
            }

            tbody tr:nth-child(even) {
                background-color: #f9fafb;
            }

            .summary {
                margin-top: 24px;
            }

            .summary h2 {
                font-size: 16px;
                margin-bottom: 8px;
            }

            .summary table {
                width: auto;
                min-width: 240px;
            }
        </style>
    </head>
    <body>
        <h1>{{ $title ?? 'Отчет' }}</h1>

        <div class="meta">
            <div>Дата генерации: {{ \Illuminate\Support\Carbon::parse($generatedAt ?? now())->format('d.m.Y H:i') }}</div>
            @if(!empty($filters) && is_array($filters))
                <div>
                    Параметры:
                    @foreach($filters as $key => $value)
                        @if($value !== null && $value !== '')
                            <span>{{ \Illuminate\Support\Str::headline((string) $key) }}:
                                @if(is_array($value))
                                    {{ json_encode($value, JSON_UNESCAPED_UNICODE) }}
                                @else
                                    {{ $value }}
                                @endif
                            </span>@if(!$loop->last), @endif
                        @endif
                    @endforeach
                </div>
            @endif
        </div>

        <table>
            <thead>
                <tr>
                    @foreach($headers as $header)
                        <th>{{ \Illuminate\Support\Str::headline((string) $header) }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @forelse($rows as $row)
                    <tr>
                        @foreach($headers as $header)
                            <td>
                                @php($value = $row[$header] ?? '')
                                @if(is_array($value) || is_object($value))
                                    {{ json_encode($value, JSON_UNESCAPED_UNICODE) }}
                                @elseif(is_bool($value))
                                    {{ $value ? 'Да' : 'Нет' }}
                                @else
                                    {{ $value }}
                                @endif
                            </td>
                        @endforeach
                    </tr>
                @empty
                    <tr>
                        <td colspan="{{ count($headers) }}">Нет данных за выбранный период.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        @if(!empty($summary) && is_array($summary))
            <div class="summary">
                <h2>Сводка</h2>
                <table>
                    <tbody>
                        @foreach($summary as $key => $value)
                            <tr>
                                <th>{{ \Illuminate\Support\Str::headline((string) $key) }}</th>
                                <td>
                                    @if(is_array($value) || is_object($value))
                                        {{ json_encode($value, JSON_UNESCAPED_UNICODE) }}
                                    @elseif(is_bool($value))
                                        {{ $value ? 'Да' : 'Нет' }}
                                    @else
                                        {{ $value }}
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </body>
</html>


