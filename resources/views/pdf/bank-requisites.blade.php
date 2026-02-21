<!DOCTYPE html>
<html lang="ru" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Банковские реквизиты</title>
    <style>
        @page { margin: 12mm; }
        body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 10pt; line-height: 1.4; color: #000; }
        .header-row { margin-bottom: 12px; }
        .header-row td { vertical-align: middle; padding: 0; }
        .logo-cell { width: 60px; padding-right: 16px; vertical-align: middle; }
        .logo-cell img { max-width: 56px; max-height: 56px; display: block; }
        .org-title { font-size: 12pt; font-weight: bold; color: #15803d; margin-bottom: 2px; }
        .org-subtitle { font-size: 9pt; color: #666; }
        .requisites-content { white-space: pre-line; font-size: 9pt; line-height: 1.5; margin-bottom: 12px; }
        .bottom-row { margin-top: 12px; }
        .bottom-row td { vertical-align: top; padding: 0; }
        .donation-block { padding: 15px; background: #f0fdf4; border: 1px solid #22c55e; }
        .donation-purpose { font-size: 9pt; margin-bottom: 6px; }
        .donation-amount { font-size: 11pt; font-weight: bold; margin-bottom: 2px; }
        .donation-words { font-size: 9pt; color: #444; }
        .qr-block { padding: 15px; background: #fff; border: 1px solid #d1d5db; text-align: center; display: inline-block; }
        .qr-block img { width: 155px; height: 155px; display: block; margin: 0 auto; }
        .cards-section { margin-top: 10px; font-size: 9pt; }
        .cards-section h3 { font-size: 10pt; font-weight: bold; margin-bottom: 4px; border-bottom: 1px solid #000; padding-bottom: 2px; }
        .footer { margin-top: 10px; text-align: center; font-size: 8pt; color: #666; }
    </style>
</head>
<body>
    <table class="header-row" cellpadding="0" cellspacing="0">
        <tr>
            @if($logoDataUri ?? null)
                <td class="logo-cell">
                    <img src="{{ $logoDataUri }}" alt="" />
                </td>
            @endif
            <td>
                @php
                    $recipientName = $structured['recipient_name'] ?? $organization->name;
                    $orgForm = $structured['organization_form'] ?? null;
                @endphp
                <div class="org-title">{{ $recipientName }}</div>
                @if($orgForm)
                    <div class="org-subtitle">{{ $orgForm }}</div>
                @endif
            </td>
        </tr>
    </table>

    @if($project ?? null)
        <div style="margin-bottom: 8px; font-size: 10pt;">Проект: {{ $project->title }}</div>
    @endif

    @if(isset($donorName) && $donorName)
        <div style="margin-bottom: 8px; font-size: 9pt; color: #666;">
            <strong>Жертвователь:</strong> {{ $donorName }}
            @if(isset($donorEmail) && $donorEmail)
                <br><strong>Email:</strong> {{ $donorEmail }}
            @endif
        </div>
    @endif

    <div class="requisites-content">{!! $requisites['text'] !!}</div>

    @if(!empty($requisites['sber_card']) || !empty($requisites['tinkoff_card']))
        <div class="cards-section">
            <h3>Переводы на карту:</h3>
            @if(!empty($requisites['sber_card']))
                <div style="margin-bottom: 4px;">
                    <strong>Сбербанк:</strong> {{ $requisites['sber_card'] }}
                    @if(!empty($requisites['card_recipient']))
                        <br>Получатель: {{ $requisites['card_recipient'] }}
                    @endif
                </div>
            @endif
            @if(!empty($requisites['tinkoff_card']))
                <div>
                    <strong>Тинькофф:</strong> {{ $requisites['tinkoff_card'] }}
                    @if(!empty($requisites['card_recipient']))
                        <br>Получатель: {{ $requisites['card_recipient'] }}
                    @endif
                </div>
            @endif
        </div>
    @endif

    <table class="bottom-row" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
            <td style="width: 60%; padding-right: 6px; vertical-align: top;">
                <div class="donation-block">
                    <div class="donation-purpose">
                        Благотворительное пожертвование согласно ст. 582 ГК РФ на уставную деятельность. НДС не облагается
                    </div>
                    @if($amountFloat > 0)
                        <div class="donation-amount">
                            Итого к оплате {{ number_format($amountFloat, 2, ',', ' ') }}
                            @if($currency === 'RUB') ₽
                            @elseif($currency === 'USD') $
                            @elseif($currency === 'EUR') €
                            @else {{ $currency }}
                            @endif
                        </div>
                        @if($amountWords ?? null)
                            <div class="donation-words">{{ $amountWords }}</div>
                        @endif
                    @endif
                </div>
            </td>
            @if($qrImageSrc ?? null)
                <td style="width: 40%; padding-left: 6px; vertical-align: top; text-align: center;">
                    <div class="qr-block">
                        <img src="{{ $qrImageSrc }}" alt="QR-код для оплаты" />
                    </div>
                </td>
            @endif
        </tr>
    </table>

    <div class="footer">
        <p>Документ сгенерирован: {{ now()->format('d.m.Y H:i') }}</p>
    </div>
</body>
</html>
