<?php

namespace App\Services\BankRequisites;

/**
 * Сервис для парсинга банковских реквизитов из текста
 */
class BankRequisitesParser
{
    /**
     * Парсинг банковских реквизитов из текста
     */
    public function parse(string $text): array
    {
        $result = [];
        
        // Убираем HTML теги, но сохраняем переносы строк для правильного парсинга
        $cleanText = strip_tags($text);
        // Нормализуем переносы строк
        $cleanText = preg_replace('/\r\n|\r/', "\n", $cleanText);
        // Убираем множественные пробелы, но сохраняем переносы строк
        $cleanText = preg_replace('/[ \t]+/', ' ', $cleanText);
        
        // Парсим основные поля (более гибкие регулярные выражения)
        // ИНН (10 или 12 цифр)
        if (preg_match('/ИНН[:\s]*(\d{10,12})/iu', $cleanText, $matches)) {
            $result['inn'] = $matches[1];
        }
        
        // КПП (9 цифр)
        if (preg_match('/КПП[:\s]*(\d{9})/iu', $cleanText, $matches)) {
            $result['kpp'] = $matches[1];
        }
        
        // БИК (9 цифр)
        if (preg_match('/БИК[:\s]*(\d{9})/iu', $cleanText, $matches)) {
            $result['bik'] = $matches[1];
        }
        
        // Расчетный счет (20 цифр)
        if (preg_match('/Расчетный\s+счет[:\s]*(\d{20})/iu', $cleanText, $matches)) {
            $result['account'] = $matches[1];
        }
        
        // Корреспондентский счет (20 цифр)
        if (preg_match('/Корреспондентский\s+счет[:\s]*(\d{20})/iu', $cleanText, $matches)) {
            $result['corr_account'] = $matches[1];
        }
        
        // ОГРН (13 или 15 цифр)
        if (preg_match('/ОГРН[:\s]*(\d{13,15})/iu', $cleanText, $matches)) {
            $result['ogrn'] = $matches[1];
        }
        
        // Извлекаем название получателя (до следующего поля или конца строки)
        // Учитываем многострочные названия
        if (preg_match('/Получатель[:\s]*\n?(.+?)(?:\n\s*Банк|\n\s*ИНН|\n\s*БИК|\n\s*Корреспондентский|$)/ius', $cleanText, $matches)) {
            $recipient = trim($matches[1]);
            // Убираем лишние пробелы и переносы внутри названия
            $recipient = preg_replace('/\s+/', ' ', $recipient);
            $result['recipient'] = $recipient;
        }
        
        // Извлекаем название банка
        if (preg_match('/Банк[:\s]+(.+?)(?:\n\s*ИНН|\n\s*БИК|\n\s*Корреспондентский|\n\s*Расчетный|$)/ius', $cleanText, $matches)) {
            $bank = trim($matches[1]);
            $bank = preg_replace('/\s+/', ' ', $bank);
            $result['bank'] = $bank;
        }
        
        // Извлекаем благополучателя
        if (preg_match('/Благополучатель[:\s]*\n?(.+?)(?:\n\s*\d{6}|$)/ius', $cleanText, $matches)) {
            $beneficiary = trim($matches[1]);
            // Убираем ОГРН из названия, если он там есть
            $beneficiary = preg_replace('/,\s*ОГРН\s+\d+/iu', '', $beneficiary);
            $beneficiary = preg_replace('/\s+/', ' ', $beneficiary);
            $result['beneficiary'] = $beneficiary;
        }
        
        // Извлекаем адрес (последняя строка с индексом)
        if (preg_match('/\n(\d{6}[,\s].+)$/iu', $cleanText, $matches)) {
            $result['address'] = trim($matches[1]);
        }
        
        return $result;
    }
}
