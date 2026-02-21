<?php

namespace App\Helpers;

/**
 * Преобразование суммы в пропись на русском языке (рубли и копейки)
 */
class AmountToWordsHelper
{
    private const UNITS = [
        '', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять',
        'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать',
        'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать',
    ];

    private const TENS = [
        '', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят',
        'семьдесят', 'восемьдесят', 'девяносто',
    ];

    private const HUNDREDS = [
        '', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот',
        'семьсот', 'восемьсот', 'девятьсот',
    ];

    public static function format(float $amount): string
    {
        $rubles = (int) floor($amount);
        $kopecks = (int) round(($amount - $rubles) * 100);

        $rublesStr = self::numberToWords($rubles);
        $rublesForm = self::morph($rubles, 'рубль', 'рубля', 'рублей');
        $kopecksStr = str_pad((string) $kopecks, 2, '0', STR_PAD_LEFT);
        $kopecksForm = self::morph($kopecks, 'копейка', 'копейки', 'копеек');

        return trim("{$rublesStr} {$rublesForm} {$kopecksStr} {$kopecksForm}");
    }

    private static function numberToWords(int $n): string
    {
        if ($n === 0) {
            return 'ноль';
        }

        $result = [];
        $billions = (int) floor($n / 1_000_000_000);
        $n %= 1_000_000_000;
        $millions = (int) floor($n / 1_000_000);
        $n %= 1_000_000;
        $thousands = (int) floor($n / 1000);
        $n %= 1000;

        if ($billions > 0) {
            $result[] = self::triadToWords($billions, true);
            $result[] = self::morph($billions, 'миллиард', 'миллиарда', 'миллиардов');
        }
        if ($millions > 0) {
            $result[] = self::triadToWords($millions, true);
            $result[] = self::morph($millions, 'миллион', 'миллиона', 'миллионов');
        }
        if ($thousands > 0) {
            $result[] = self::triadToWords($thousands, true);
            $result[] = self::morph($thousands, 'тысяча', 'тысячи', 'тысяч');
        }
        if ($n > 0) {
            $result[] = self::triadToWords($n, false);
        }

        return implode(' ', array_filter($result));
    }

    private static function triadToWords(int $n, bool $feminine): string
    {
        $result = [];
        $h = (int) floor($n / 100);
        $n %= 100;
        if ($h > 0) {
            $result[] = self::HUNDREDS[$h];
        }
        if ($n >= 20) {
            $t = (int) floor($n / 10);
            $result[] = self::TENS[$t];
            $n %= 10;
        }
        if ($n > 0) {
            $word = self::UNITS[$n];
            if ($feminine && in_array($n, [1, 2], true)) {
                $word = $n === 1 ? 'одна' : 'две';
            }
            $result[] = $word;
        }

        return implode(' ', $result);
    }

    private static function morph(int $n, string $one, string $few, string $many): string
    {
        $n = abs($n) % 100;
        $n1 = $n % 10;

        if ($n >= 11 && $n <= 19) {
            return $many;
        }
        if ($n1 === 1) {
            return $one;
        }
        if ($n1 >= 2 && $n1 <= 4) {
            return $few;
        }

        return $many;
    }
}
