<?php

namespace App\Services\BankRequisites;

/**
 * Сервис для форматирования банковских реквизитов
 */
class BankRequisitesFormatter
{
    /**
     * Форматирование текстового представления реквизитов из структурированных полей
     */
    public function formatFromStructured(array $structured): string
    {
        $lines = [];
        
        if (!empty($structured['recipient_name'])) {
            $lines[] = 'Получатель:';
            $lines[] = $structured['recipient_name'];
        }
        
        if (!empty($structured['bank_name'])) {
            $lines[] = 'Банк: ' . $structured['bank_name'];
        }
        
        if (!empty($structured['inn'])) {
            $lines[] = 'ИНН: ' . $structured['inn'];
        }
        
        if (!empty($structured['kpp'])) {
            $lines[] = 'КПП: ' . $structured['kpp'];
        }
        
        if (!empty($structured['bik'])) {
            $lines[] = 'БИК: ' . $structured['bik'];
        }
        
        if (!empty($structured['corr_account'])) {
            $lines[] = 'Корреспондентский счет: ' . $structured['corr_account'];
        }
        
        if (!empty($structured['account'])) {
            $lines[] = 'Расчетный счет: ' . $structured['account'];
        }
        
        if (!empty($structured['beneficiary_name'])) {
            $lines[] = 'Благополучатель:';
            $beneficiaryLine = $structured['beneficiary_name'];
            if (!empty($structured['ogrn'])) {
                $beneficiaryLine .= ', ОГРН ' . $structured['ogrn'];
            }
            $lines[] = $beneficiaryLine;
        } elseif (!empty($structured['ogrn'])) {
            $lines[] = 'ОГРН: ' . $structured['ogrn'];
        }
        
        if (!empty($structured['address'])) {
            $lines[] = $structured['address'];
        }
        
        return implode("\n", $lines);
    }
}
