<?php

namespace App\Support;

/**
 * Единая точка для подготовки имён/подписей доноров в публичных ответах API и виджетах.
 */
final class PublicDonationPrivacy
{
    public static function donationFeedDonorName(?string $donorName, bool $isAnonymous, bool $maskDonors): string
    {
        if ($maskDonors || $isAnonymous) {
            return 'Анонимное пожертвование';
        }
        $name = trim((string) ($donorName ?? ''));
        if ($name === '') {
            return 'Анонимное пожертвование';
        }

        return PhoneNumber::maskRussianPhonesInText($name);
    }

    public static function topDonorLabel(string $label): string
    {
        $label = trim($label);
        if ($label === '') {
            return 'Анонимное пожертвование';
        }

        return PhoneNumber::maskRussianPhonesInText($label);
    }

    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @return array<int, array<string, mixed>>
     */
    public static function mapTopDonorRows(array $rows): array
    {
        return array_map(static function (array $row): array {
            if (array_key_exists('donor_label', $row)) {
                $row['donor_label'] = self::topDonorLabel((string) ($row['donor_label'] ?? ''));
            }

            return $row;
        }, $rows);
    }
}
