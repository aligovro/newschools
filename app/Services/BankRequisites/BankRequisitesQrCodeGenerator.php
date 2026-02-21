<?php

namespace App\Services\BankRequisites;

use App\Models\Organization;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Log;

/**
 * Сервис для генерации QR-кодов банковских реквизитов
 */
class BankRequisitesQrCodeGenerator
{
    public function __construct(
        protected BankRequisitesParser $parser
    ) {
    }

    /**
     * Генерация QR-кода для банковских реквизитов (для модалки - SVG)
     * Формирует строку с реквизитами в формате, понятном банковским приложениям
     */
    public function generate(array $requisites, Organization $organization): ?string
    {
        try {
            $parsedRequisites = $this->resolveParsedRequisites($requisites);
            $qrData = $this->formatQrDataForBank($parsedRequisites, $organization, false);
            if (empty($qrData)) {
                $qrData = strip_tags($requisites['text'] ?? '');
            }

            // Генерируем SVG изображение QR-кода (для модалки)
            $renderer = new ImageRenderer(
                new RendererStyle(300),
                new SvgImageBackEnd()
            );

            $writer = new Writer($renderer);
            $qrSvg = $writer->writeString($qrData, 'UTF-8');
            
            // Для модалки возвращаем base64 encoded SVG через data URI
            $base64Svg = base64_encode($qrSvg);
            return 'data:image/svg+xml;charset=utf-8;base64,' . $base64Svg;
        } catch (\Throwable $e) {
            Log::error('Failed to generate bank requisites QR code', [
                'organization_id' => $organization->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Генерация PNG QR-кода для PDF (отдельный метод для PDF)
     * Генерирует SVG, затем конвертирует в PNG через Imagick из файла
     * Использует кириллицу в UTF-8 — банковские приложения при сканировании требуют
     * правильные названия на русском, транслитерация не подходит.
     */
    public function generatePngForPdf(array $requisites, Organization $organization): ?string
    {
        try {
            $parsedRequisites = $this->resolveParsedRequisites($requisites);
            if (!empty($requisites['amount']) && ($requisites['currency'] ?? 'RUB') === 'RUB') {
                $parsedRequisites['amount_kopecks'] = (int) round((float) $requisites['amount'] * 100);
            }
            $qrData = $this->formatQrDataForBank($parsedRequisites, $organization, false);
            if (empty($qrData)) {
                $qrData = strip_tags($requisites['text'] ?? '');
            }

            // Генерируем SVG (как для модалки, но с транслитерированными данными для PNG)
            $renderer = new ImageRenderer(
                new RendererStyle(300), // Размер для PDF
                new SvgImageBackEnd()
            );

            $writer = new Writer($renderer);
            $qrSvg = $writer->writeString($qrData, 'UTF-8');
            
            // Конвертируем SVG в PNG через Imagick из файла (обходит проблему с кодировкой)
            if (extension_loaded('imagick') && class_exists('Imagick')) {
                try {
                    $imagickClass = 'Imagick';
                    $imagickPixelClass = 'ImagickPixel';
                    
                    if (!class_exists($imagickClass) || !class_exists($imagickPixelClass)) {
                        throw new \RuntimeException('Imagick classes not available');
                    }
                    
                    // Сохраняем SVG во временный файл с UTF-8 без BOM (BOM может мешать парсингу XML)
                    $tempSvgFile = tempnam(sys_get_temp_dir(), 'qr_') . '.svg';
                    
                    // Убеждаемся, что SVG имеет правильный заголовок с UTF-8
                    if (strpos($qrSvg, '<?xml') === false) {
                        $qrSvg = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . $qrSvg;
                    } elseif (strpos($qrSvg, 'encoding="UTF-8"') === false && strpos($qrSvg, 'encoding=') !== false) {
                        $qrSvg = preg_replace('/encoding="[^"]*"/', 'encoding="UTF-8"', $qrSvg);
                    }
                    
                    // UTF-8 без BOM — стандарт для XML/SVG
                    file_put_contents($tempSvgFile, $qrSvg, LOCK_EX);
                    
                    // Читаем SVG из файла (Imagick лучше обрабатывает файлы, чем blob с кириллицей)
                    $imagick = new $imagickClass();
                    $bgColor = new $imagickPixelClass('white');
                    $imagick->setBackgroundColor($bgColor);
                    
                    // Устанавливаем опции для правильной обработки UTF-8
                    $imagick->setOption('svg:xml-parse-huge', '1');
                    
                    // Используем readImage вместо readImageBlob для лучшей обработки UTF-8
                    $imagick->readImage($tempSvgFile);
                    
                    // Устанавливаем формат PNG после чтения
                    $imagick->setImageFormat('png');
                    $imagick->setImageCompressionQuality(100);
                    
                    // Получаем PNG blob
                    $pngBlob = $imagick->getImageBlob();
                    
                    // Освобождаем ресурсы
                    $imagick->clear();
                    $imagick->destroy();
                    
                    // Удаляем временный файл
                    @unlink($tempSvgFile);
                    
                    $base64Png = base64_encode($pngBlob);
                    return 'data:image/png;base64,' . $base64Png;
                } catch (\Throwable $imagickError) {
                    Log::warning('Imagick SVG to PNG conversion failed, falling back to SVG', [
                        'organization_id' => $organization->id,
                        'error' => $imagickError->getMessage(),
                    ]);
                    // Fallback к SVG если Imagick не сработал
                }
            } else {
                Log::warning('Imagick extension not available, using SVG for PDF QR code', [
                    'organization_id' => $organization->id,
                ]);
            }

            // Fallback: возвращаем SVG если Imagick недоступен
            $base64Svg = base64_encode($qrSvg);
            return 'data:image/svg+xml;charset=utf-8;base64,' . $base64Svg;
            
        } catch (\Throwable $e) {
            Log::error('Failed to generate PNG QR code for PDF', [
                'organization_id' => $organization->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Получить чистый SVG для прямого встраивания
     */
    public function generateSvgDirect(array $requisites, Organization $organization): ?string
    {
        try {
            $text = $requisites['text'] ?? '';
            $parsedRequisites = $this->parser->parse($text);
            // Для SVG не используем транслитерацию (SVG поддерживает UTF-8)
            $qrData = $this->formatQrDataForBank($parsedRequisites, $organization, false);
            
            if (empty($qrData)) {
                return null;
            }

            $renderer = new ImageRenderer(
                new RendererStyle(300),
                new SvgImageBackEnd()
            );
            $writer = new Writer($renderer);
            
            return $writer->writeString($qrData, 'UTF-8');
        } catch (\Throwable $e) {
            Log::error('Failed to generate bank requisites QR code SVG', [
                'organization_id' => $organization->id,
                'error' => $e->getMessage(),
            ]);
            
            return null;
        }
    }

    /**
     * Объединяет распарсенные данные из текста со структурированными (fallback).
     */
    protected function resolveParsedRequisites(array $requisites): array
    {
        $text = $requisites['text'] ?? '';
        $parsed = $this->parser->parse($text);
        $structured = $requisites['structured'] ?? [];
        $map = ['recipient' => 'recipient_name', 'bank' => 'bank_name', 'inn' => 'inn', 'kpp' => 'kpp',
                'bik' => 'bik', 'account' => 'account', 'corr_account' => 'corr_account'];
        foreach ($map as $key => $structKey) {
            if (empty($parsed[$key]) && !empty($structured[$structKey])) {
                $parsed[$key] = $structured[$structKey];
            }
        }
        return $parsed;
    }

    /**
     * Форматирование данных для QR-кода в формате, понятном банковским приложениям
     * Использует формат ST00012 (стандарт для банковских переводов в России)
     * 
     * @param array $parsedRequisites Распарсенные реквизиты
     * @param Organization $organization Организация
     * @param bool $transliterate Транслитерировать кириллицу в латиницу (для PNG генерации)
     */
    protected function formatQrDataForBank(array $parsedRequisites, Organization $organization, bool $transliterate = false): string
    {
        // Формируем строку в формате ST00012 для перевода по реквизитам
        // Формат: ST00012|Name=...|PersonalAcc=...|BankName=...|BIC=...|CorrespAcc=...|INN=...|KPP=...
        
        $parts = ['ST00012'];
        
        // Название получателя
        $recipientName = $parsedRequisites['recipient'] ?? $organization->name;
        if ($transliterate) {
            $recipientName = $this->transliterate($recipientName);
        }
        $parts[] = 'Name=' . $this->escapeQrValue($recipientName);
        
        // Расчетный счет (обязательное поле)
        if (!empty($parsedRequisites['account'])) {
            $parts[] = 'PersonalAcc=' . $parsedRequisites['account'];
        }
        
        // Название банка
        if (!empty($parsedRequisites['bank'])) {
            $bankName = $parsedRequisites['bank'];
            if ($transliterate) {
                $bankName = $this->transliterate($bankName);
            }
            $parts[] = 'BankName=' . $this->escapeQrValue($bankName);
        }
        
        // БИК (обязательное поле)
        if (!empty($parsedRequisites['bik'])) {
            $parts[] = 'BIC=' . $parsedRequisites['bik'];
        }
        
        // Корреспондентский счет
        if (!empty($parsedRequisites['corr_account'])) {
            $parts[] = 'CorrespAcc=' . $parsedRequisites['corr_account'];
        }
        
        // ИНН (PayeeINN — для банковских приложений)
        if (!empty($parsedRequisites['inn'])) {
            $inn = preg_replace('/\D/', '', $parsedRequisites['inn']);
            if ($inn !== '') {
                $parts[] = 'PayeeINN=' . $inn;
            }
        }
        
        // КПП
        if (!empty($parsedRequisites['kpp'])) {
            $parts[] = 'KPP=' . preg_replace('/\D/', '', $parsedRequisites['kpp']);
        }
        
        // Сумма в копейках (для автозаполнения в банковском приложении)
        if (!empty($parsedRequisites['amount_kopecks']) && $parsedRequisites['amount_kopecks'] > 0) {
            $parts[] = 'Sum=' . $parsedRequisites['amount_kopecks'];
        }
        
        return implode('|', $parts);
    }

    /**
     * Экранирование специальных символов для QR-кода
     */
    protected function escapeQrValue(string $value): string
    {
        // Убираем лишние пробелы и экранируем специальные символы
        $value = trim($value);
        $value = preg_replace('/\s+/', ' ', $value);
        
        // В формате ST00012 специальные символы обычно не требуют экранирования,
        // но убираем символы, которые могут нарушить формат
        $value = str_replace(['|', "\n", "\r"], ['', ' ', ' '], $value);
        
        return $value;
    }

    /**
     * Транслитерация кириллицы в латиницу для QR-кода
     * Используется только для генерации PNG, чтобы обойти проблему с кодировкой ISO-8859-1
     */
    protected function transliterate(string $text): string
    {
        $translitMap = [
            'А' => 'A', 'Б' => 'B', 'В' => 'V', 'Г' => 'G', 'Д' => 'D',
            'Е' => 'E', 'Ё' => 'Yo', 'Ж' => 'Zh', 'З' => 'Z', 'И' => 'I',
            'Й' => 'Y', 'К' => 'K', 'Л' => 'L', 'М' => 'M', 'Н' => 'N',
            'О' => 'O', 'П' => 'P', 'Р' => 'R', 'С' => 'S', 'Т' => 'T',
            'У' => 'U', 'Ф' => 'F', 'Х' => 'Kh', 'Ц' => 'Ts', 'Ч' => 'Ch',
            'Ш' => 'Sh', 'Щ' => 'Shch', 'Ъ' => '', 'Ы' => 'Y', 'Ь' => '',
            'Э' => 'E', 'Ю' => 'Yu', 'Я' => 'Ya',
            'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd',
            'е' => 'e', 'ё' => 'yo', 'ж' => 'zh', 'з' => 'z', 'и' => 'i',
            'й' => 'y', 'к' => 'k', 'л' => 'l', 'м' => 'm', 'н' => 'n',
            'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't',
            'у' => 'u', 'ф' => 'f', 'х' => 'kh', 'ц' => 'ts', 'ч' => 'ch',
            'ш' => 'sh', 'щ' => 'shch', 'ъ' => '', 'ы' => 'y', 'ь' => '',
            'э' => 'e', 'ю' => 'yu', 'я' => 'ya',
        ];

        return strtr($text, $translitMap);
    }
}
