<!DOCTYPE html>
<html lang="ru" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Банковские реквизиты</title>
    <style>
        @page {
            margin: 20mm;
        }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .organization-name {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
        }
        .requisites-section {
            margin-top: 30px;
        }
        .requisites-section h2 {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
        }
        .requisites-content {
            white-space: pre-line;
            font-size: 11pt;
            line-height: 1.8;
        }
        .qr-section {
            text-align: center;
            margin: 30px 0;
            page-break-inside: avoid;
        }
        .qr-section h2 {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
        }
        .qr-code-wrapper {
            display: inline-block;
            padding: 15px;
            background: #fff;
            border: 2px solid #000;
            margin: 15px 0;
        }
        .qr-code-wrapper img {
            width: 200px;
            height: 200px;
            display: block;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10pt;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>БАНКОВСКИЕ РЕКВИЗИТЫ</h1>
    </div>

    <div class="organization-name">
        {{ $organization->name }}
    </div>

    @if($project)
        <div style="text-align: center; margin-bottom: 20px; font-size: 12pt;">
            Проект: {{ $project->title }}
        </div>
    @endif

    @if(isset($amount) && $amount > 0)
        <div style="text-align: center; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
            <div style="font-size: 14pt; font-weight: bold; margin-bottom: 5px;">
                Сумма пожертвования
            </div>
            <div style="font-size: 20pt; font-weight: bold; color: #2563eb;">
                {{ number_format($amount, 2, ',', ' ') }} 
                @if($currency === 'RUB')
                    ₽
                @elseif($currency === 'USD')
                    $
                @elseif($currency === 'EUR')
                    €
                @else
                    {{ $currency }}
                @endif
            </div>
        </div>
    @endif

    @if(isset($donorName) && $donorName)
        <div style="text-align: center; margin-bottom: 20px; font-size: 11pt; color: #666;">
            <strong>Жертвователь:</strong> {{ $donorName }}
            @if(isset($donorEmail) && $donorEmail)
                <br><strong>Email:</strong> {{ $donorEmail }}
            @endif
        </div>
    @endif

    @if(isset($qrCodePngBase64) && !empty($qrCodePngBase64))
        <div class="qr-section">
            <h2>QR-код для оплаты</h2>
            <p style="font-size: 10pt; color: #666; margin-bottom: 15px;">
                Отсканируйте QR-код в приложении вашего банка для быстрого перевода по реквизитам
            </p>
            <div class="qr-code-wrapper">
                {{-- Используем PNG base64 для PDF (как на WordPress сайте) --}}
                <img src="{{ $qrCodePngBase64 }}" alt="QR-код для оплаты" />
            </div>
        </div>
    @endif

    <div class="requisites-section">
        <h2>Получатель:</h2>
        <div class="requisites-content">
            {!! $requisites['text'] !!}
        </div>
    </div>

    @if(!empty($requisites['sber_card']) || !empty($requisites['tinkoff_card']))
        <div class="requisites-section">
            <h2>Переводы на карту:</h2>
            @if(!empty($requisites['sber_card']))
                <div style="margin-bottom: 15px;">
                    <strong>Сбербанк:</strong> {{ $requisites['sber_card'] }}
                    @if(!empty($requisites['card_recipient']))
                        <br><strong>Получатель:</strong> {{ $requisites['card_recipient'] }}
                    @endif
                </div>
            @endif
            @if(!empty($requisites['tinkoff_card']))
                <div>
                    <strong>Тинькофф:</strong> {{ $requisites['tinkoff_card'] }}
                    @if(!empty($requisites['card_recipient']))
                        <br><strong>Получатель:</strong> {{ $requisites['card_recipient'] }}
                    @endif
                </div>
            @endif
        </div>
    @endif

    <div class="footer">
        <p>Документ сгенерирован: {{ now()->format('d.m.Y H:i') }}</p>
    </div>
</body>
</html>
