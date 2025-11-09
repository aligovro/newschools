<?php

namespace App\Enums;

enum ReportType: string
{
    case Revenue = 'revenue';
    case Members = 'members';
    case Projects = 'projects';
    case Comprehensive = 'comprehensive';
    case Custom = 'custom';

    /**
     * Get human readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Revenue => 'Отчет по доходам',
            self::Members => 'Отчет по участникам',
            self::Projects => 'Отчет по проектам',
            self::Comprehensive => 'Комплексный отчет',
            self::Custom => 'Произвольный отчет',
        };
    }

    /**
     * Default configuration for report type.
     *
     * @return array<string, mixed>
     */
    public function defaultConfig(): array
    {
        return match ($this) {
            self::Revenue => [
                'period' => 'month',
                'group_by' => 'month',
                'format' => 'json',
            ],
            self::Members => [
                'period' => 'month',
                'include_inactive' => false,
            ],
            self::Projects => [
                'period' => 'quarter',
                'status' => 'all',
            ],
            self::Comprehensive => [
                'period' => 'month',
                'include_revenue' => true,
                'include_members' => true,
                'include_projects' => true,
                'include_analytics' => true,
            ],
            self::Custom => [],
        };
    }

    /**
     * Available groupings for report type.
     *
     * @return array<int, string>
     */
    public function allowedGroupings(): array
    {
        return match ($this) {
            self::Revenue => ['day', 'week', 'month', 'quarter', 'project', 'payment_method'],
            self::Members => ['day', 'week', 'month', 'source'],
            self::Projects => ['status', 'category'],
            self::Comprehensive, self::Custom => [],
        };
    }
}


