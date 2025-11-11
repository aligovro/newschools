<?php

namespace App\Services\Reports;

use App\Enums\ReportType;
use Carbon\Carbon;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExporter
{
    private const COMPREHENSIVE_SECTION_TITLES = [
        'revenue' => 'Финансовые показатели',
        'members' => 'Участники',
        'projects' => 'Проекты',
        'analytics' => 'Аналитика',
    ];

    /**
     * @param array<string, mixed> $payload
     */
    public function export(ReportType $reportType, array $payload, string $format = 'csv', ?string $filename = null): Response
    {
        $format = strtolower($format);
        $filename = $filename ?? $this->buildFilename($reportType, $format);

        return match ($format) {
            'csv' => $this->exportToCsv($reportType, $payload, $filename),
            'pdf' => $this->exportToPdf($reportType, $payload, $filename),
            'excel', 'xlsx' => $this->exportToExcel($reportType, $payload, $filename),
            default => response()->json(['message' => 'Неподдерживаемый формат'], 400),
        };
    }

    /**
     * @param array<string, mixed> $payload
     */
    protected function exportToCsv(ReportType $reportType, array $payload, string $filename): StreamedResponse
    {
        $dataset = $this->prepareDataset($reportType, $payload);

        return response()->streamDownload(function () use ($dataset) {
            $handle = fopen('php://output', 'w');

            if (!empty($dataset['summary'])) {
                fputcsv($handle, $this->sanitizeCsvRow(['Сводка']), ';');
                foreach ($dataset['summary'] as $row) {
                    fputcsv(
                        $handle,
                        $this->sanitizeCsvRow([$row['label'], $row['value']]),
                        ';'
                    );
                }
                fputcsv($handle, [], ';');
            }

            if (!empty($dataset['parameters'])) {
                fputcsv($handle, $this->sanitizeCsvRow(['Параметры отчета']), ';');
                foreach ($dataset['parameters'] as $row) {
                    fputcsv(
                        $handle,
                        $this->sanitizeCsvRow([$row['label'], $row['value']]),
                        ';'
                    );
                }
                fputcsv($handle, [], ';');
            }

            foreach ($dataset['tables'] as $table) {
                fputcsv($handle, $this->sanitizeCsvRow([$table['title']]), ';');
                fputcsv(
                    $handle,
                    $this->sanitizeCsvRow($table['headers']),
                    ';'
                );
                foreach ($table['rows'] as $row) {
                    fputcsv(
                        $handle,
                        $this->sanitizeCsvRow($row),
                        ';'
                    );
                }
                fputcsv($handle, [], ';');
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'X-Filename' => $filename,
        ]);
    }

    /**
     * @param array<string, mixed> $payload
     */
    protected function exportToPdf(ReportType $reportType, array $payload, string $filename): StreamedResponse
    {
        $dataset = $this->prepareDataset($reportType, $payload);

        $options = new Options();
        $options->set('isRemoteEnabled', true);

        $dompdf = new Dompdf($options);
        $html = view('reports.export', $dataset)->render();

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return response()->streamDownload(function () use ($dompdf) {
            echo $dompdf->output();
        }, $filename, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'X-Filename' => $filename,
        ]);
    }

    /**
     * @param array<string, mixed> $payload
     */
    protected function exportToExcel(ReportType $reportType, array $payload, string $filename): StreamedResponse
    {
        $dataset = $this->prepareDataset($reportType, $payload);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle(Str::limit($dataset['title'], 31, ''));

        $rowIndex = 1;
        $sheet->setCellValue("A{$rowIndex}", $dataset['title']);
        $sheet->mergeCells("A{$rowIndex}:D{$rowIndex}");
        $sheet->getStyle("A{$rowIndex}")->getFont()->setBold(true)->setSize(14);
        $rowIndex += 2;

        if (!empty($dataset['summary'])) {
            $sheet->setCellValue("A{$rowIndex}", 'Сводка');
            $sheet->mergeCells("A{$rowIndex}:D{$rowIndex}");
            $sheet->getStyle("A{$rowIndex}")->getFont()->setBold(true);
            $rowIndex++;
            foreach ($dataset['summary'] as $row) {
                $sheet->setCellValue("A{$rowIndex}", $row['label']);
                $sheet->setCellValue("B{$rowIndex}", $row['value']);
                $rowIndex++;
            }
            $rowIndex++;
        }

        if (!empty($dataset['parameters'])) {
            $sheet->setCellValue("A{$rowIndex}", 'Параметры отчета');
            $sheet->mergeCells("A{$rowIndex}:D{$rowIndex}");
            $sheet->getStyle("A{$rowIndex}")->getFont()->setBold(true);
            $rowIndex++;
            foreach ($dataset['parameters'] as $row) {
                $sheet->setCellValue("A{$rowIndex}", $row['label']);
                $sheet->setCellValue("B{$rowIndex}", $row['value']);
                $rowIndex++;
            }
            $rowIndex++;
        }

        foreach ($dataset['tables'] as $table) {
            $headersCount = count($table['headers']);
            $lastColumn = $this->columnIndexToLetter($headersCount);

            $sheet->setCellValue("A{$rowIndex}", $table['title']);
            $sheet->mergeCells("A{$rowIndex}:{$lastColumn}{$rowIndex}");
            $sheet->getStyle("A{$rowIndex}")->getFont()->setBold(true);
            $rowIndex++;

            $sheet->fromArray($table['headers'], null, "A{$rowIndex}");
            $sheet->getStyle("A{$rowIndex}:{$lastColumn}{$rowIndex}")->getFont()->setBold(true);
            $rowIndex++;

            foreach ($table['rows'] as $row) {
                $sheet->fromArray($row, null, "A{$rowIndex}");
                $rowIndex++;
            }

            $rowIndex++;
        }

        foreach (range('A', $this->columnIndexToLetter(6)) as $columnID) {
            $sheet->getColumnDimension($columnID)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer, $spreadsheet) {
            $writer->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'X-Filename' => $filename,
        ]);
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    protected function prepareDataset(ReportType $reportType, array $payload): array
    {
        $title = (string) ($payload['title'] ?? $reportType->label());
        $filters = Arr::get($payload, 'filters', []);
        $meta = Arr::get($payload, 'meta', []);
        $data = Arr::get($payload, 'data', []);
        $summary = Arr::get($payload, 'summary', []);

        return [
            'title' => $title,
            'summary' => $this->buildSummaryRows($reportType, $summary),
            'parameters' => $this->buildParameterRows($filters, $meta),
            'tables' => $this->buildTables($reportType, $data, $filters, $meta),
            'generated_at' => Arr::get($payload, 'generated_at', now()),
        ];
    }

    /**
     * @param array<string, mixed> $summary
     * @return array<int, array{label: string, value: string}>
     */
    protected function buildSummaryRows(ReportType $reportType, array $summary): array
    {
        return match ($reportType) {
            ReportType::Revenue, ReportType::Custom => $this->buildRevenueSummaryRows($summary),
            ReportType::Members => $this->buildMembersSummaryRows($summary),
            ReportType::Projects => $this->buildProjectsSummaryRows($summary),
            ReportType::Comprehensive => $this->buildComprehensiveSummaryRows($summary),
            default => $this->convertGenericSummary($summary),
        };
    }

    /**
     * @param array<string, mixed> $filters
     * @param array<string, mixed> $meta
     * @return array<int, array{label: string, value: string}>
     */
    protected function buildParameterRows(array $filters, array $meta): array
    {
        $period = $filters['period'] ?? null;
        $groupBy = $meta['group_by'] ?? $filters['group_by'] ?? null;
        $status = $meta['status'] ?? $filters['status'] ?? null;
        $dateFrom = $meta['date_from'] ?? $filters['date_from'] ?? null;
        $dateTo = $meta['date_to'] ?? $filters['date_to'] ?? null;

        $rows = [];

        $rows[] = [
            'label' => 'Период',
            'value' => $this->formatPeriodLabel($period, $dateFrom, $dateTo),
        ];

        if ($groupBy) {
            $rows[] = [
                'label' => 'Группировка',
                'value' => $this->formatGroupBy($groupBy),
            ];
        }

        if ($status && $status !== 'all') {
            $rows[] = [
                'label' => 'Статус проектов',
                'value' => $this->formatProjectStatus($status),
            ];
        }

        if ($dateFrom && $period === 'custom') {
            $rows[] = [
                'label' => 'Дата начала',
                'value' => $this->formatDate($dateFrom),
            ];
        }

        if ($dateTo && $period === 'custom') {
            $rows[] = [
                'label' => 'Дата завершения',
                'value' => $this->formatDate($dateTo),
            ];
        }

        $rows[] = [
            'label' => 'Сайт',
            'value' => $this->formatEntityValue($meta['site_id'] ?? null, 'сайты'),
        ];

        $rows[] = [
            'label' => 'Проект',
            'value' => $this->formatEntityValue($meta['project_id'] ?? null, 'проекты'),
        ];

        if (isset($meta['project_stage_id'])) {
            $rows[] = [
                'label' => 'Этап проекта',
                'value' => $this->formatEntityValue($meta['project_stage_id'], 'этапы'),
            ];
        }

        return $rows;
    }

    /**
     * @param array<string, mixed> $data
     * @param array<string, mixed> $filters
     * @param array<string, mixed> $meta
     * @return array<int, array{title: string, headers: array<int, string>, rows: array<int, array<int, string>>}>
     */
    protected function buildTables(ReportType $reportType, mixed $data, array $filters, array $meta): array
    {
        $groupBy = $meta['group_by'] ?? $filters['group_by'] ?? null;

        return match ($reportType) {
            ReportType::Revenue, ReportType::Custom => $this->buildRevenueTables($data, $groupBy),
            ReportType::Members => $this->buildMembersTables($data),
            ReportType::Projects => $this->buildProjectsTables($data),
            ReportType::Comprehensive => $this->buildComprehensiveTables($data, $groupBy),
            default => $this->buildGenericTables($data),
        };
    }

    /**
     * @param array<string, mixed> $summary
     * @return array<int, array{label: string, value: string}>
     */
    protected function buildRevenueSummaryRows(array $summary): array
    {
        return array_values(array_filter([
            $this->summaryRow('Общая сумма пожертвований', $this->formatMoney($summary['total_amount_rubles'] ?? null, $summary['total_amount'] ?? null)),
            $this->summaryRow('Количество пожертвований', $this->formatNumber($summary['total_transactions'] ?? null)),
            $this->summaryRow('Средний чек', $this->formatMoney(null, $summary['average_transaction'] ?? null)),
        ]));
    }

    /**
     * @param array<string, mixed> $summary
     * @return array<int, array{label: string, value: string}>
     */
    protected function buildMembersSummaryRows(array $summary): array
    {
        return array_values(array_filter([
            $this->summaryRow('Новых участников', $this->formatNumber($summary['new_members'] ?? null)),
            $this->summaryRow('Активных участников', $this->formatNumber($summary['active_members'] ?? null)),
            $this->summaryRow('Основной источник привлечения', $this->formatSourceLabel($summary['top_source'] ?? null)),
        ]));
    }

    /**
     * @param array<string, mixed> $summary
     * @return array<int, array{label: string, value: string}>
     */
    protected function buildProjectsSummaryRows(array $summary): array
    {
        return array_values(array_filter([
            $this->summaryRow('Количество проектов', $this->formatNumber($summary['total_projects'] ?? null)),
            $this->summaryRow('Цель финансирования', $this->formatMoney(null, $summary['total_target'] ?? null)),
            $this->summaryRow('Собрано средств', $this->formatMoney(null, $summary['total_collected'] ?? null)),
            $this->summaryRow('Общий прогресс', $this->formatPercentage($summary['overall_progress'] ?? null)),
        ]));
    }

    /**
     * @param array<string, mixed> $summary
     * @return array<int, array{label: string, value: string}>
     */
    protected function buildComprehensiveSummaryRows(array $summary): array
    {
        $rows = [];

        foreach ($summary as $key => $value) {
            if (!is_array($value)) {
                continue;
            }
            $title = self::COMPREHENSIVE_SECTION_TITLES[$key] ?? $this->humanize($key);
            $sectionRows = match ($key) {
                'revenue' => $this->buildRevenueSummaryRows($value),
                'members' => $this->buildMembersSummaryRows($value),
                'projects' => $this->buildProjectsSummaryRows($value),
                'analytics' => $this->buildAnalyticsSummaryRows($value),
                default => $this->convertGenericSummary($value),
            };

            foreach ($sectionRows as $row) {
                $rows[] = [
                    'label' => $title . ': ' . $row['label'],
                    'value' => $row['value'],
                ];
            }
        }

        return $rows;
    }

    /**
     * @param array<string, mixed> $summary
     * @return array<int, array{label: string, value: string}>
     */
    protected function buildAnalyticsSummaryRows(array $summary): array
    {
        return array_values(array_filter([
            $this->summaryRow('Конверсия', $this->formatPercentage($summary['conversion_rate'] ?? null)),
            $this->summaryRow('Средний чек', $this->formatMoney(null, $summary['average_donation'] ?? null)),
            $this->summaryRow('Удержание', $this->formatPercentage($summary['retention_rate'] ?? null)),
            $this->summaryRow('Рост', $this->formatPercentage($summary['growth_rate'] ?? null)),
        ]));
    }

    /**
     * @param array<string, mixed> $data
     * @param string|null $groupBy
     * @return array<int, array{title: string, headers: array<int, string>, rows: array<int, array<int, string>>}>
     */
    protected function buildRevenueTables(mixed $data, ?string $groupBy): array
    {
        if (!is_iterable($data)) {
            return [];
        }

        $rows = [];
        foreach ($data as $row) {
            if (!is_array($row) || !isset($row['period'])) {
                continue;
            }
            $period = $this->formatRevenuePeriod((string) $row['period'], $groupBy);
            $sum = $this->formatMoney($row['total_rubles'] ?? null, $row['total'] ?? null);
            $count = $this->formatNumber($row['count'] ?? null);

            $rows[] = [$period, $sum, $count];
        }

        return $rows ? [[
            'title' => 'Детализация по периодам',
            'headers' => ['Период', 'Сумма пожертвований', 'Количество пожертвований'],
            'rows' => $rows,
        ]] : [];
    }

    /**
     * @param array<string, mixed> $data
     * @return array<int, array{title: string, headers: array<int, string>, rows: array<int, array<int, string>>}>
     */
    protected function buildMembersTables(mixed $data): array
    {
        if (!is_array($data)) {
            return [];
        }

        $tables = [];

        $daily = [];
        foreach ($data['daily_registrations'] ?? [] as $row) {
            if (!is_array($row)) {
                continue;
            }
            $daily[] = [
                $this->formatDate($row['date'] ?? null),
                $this->formatNumber($row['count'] ?? null),
            ];
        }

        if ($daily) {
            $tables[] = [
                'title' => 'Регистрации по дням',
                'headers' => ['Дата', 'Количество'],
                'rows' => $daily,
            ];
        }

        $sources = [];
        foreach ($data['members_by_source'] ?? [] as $row) {
            if (!is_array($row)) {
                continue;
            }
            $sources[] = [
                $this->formatSourceLabel($row['source'] ?? null),
                $this->formatNumber($row['count'] ?? null),
            ];
        }

        if ($sources) {
            $tables[] = [
                'title' => 'Источники привлечения',
                'headers' => ['Источник', 'Количество'],
                'rows' => $sources,
            ];
        }

        return $tables;
    }

    /**
     * @param array<string, mixed> $data
     * @return array<int, array{title: string, headers: array<int, string>, rows: array<int, array<int, string>>}>
     */
    protected function buildProjectsTables(mixed $data): array
    {
        if (!is_array($data)) {
            return [];
        }

        $tables = [];

        $statusRows = [];
        foreach ($data['projects_by_status'] ?? [] as $row) {
            if (!is_array($row)) {
                continue;
            }
            $statusRows[] = [
                $this->formatProjectStatus($row['status'] ?? null),
                $this->formatNumber($row['count'] ?? null),
            ];
        }

        if ($statusRows) {
            $tables[] = [
                'title' => 'Проекты по статусам',
                'headers' => ['Статус', 'Количество'],
                'rows' => $statusRows,
            ];
        }

        $fundingRows = [];
        foreach ($data['funding_progress'] ?? [] as $row) {
            if (!is_array($row)) {
                continue;
            }
            $fundingRows[] = [
                $row['title'] ?? 'Без названия',
                $this->formatMoney(null, $row['target_amount'] ?? null),
                $this->formatMoney(null, $row['collected_amount'] ?? null),
                $this->formatPercentage($row['progress_percentage'] ?? null),
            ];
        }

        if ($fundingRows) {
            $tables[] = [
                'title' => 'Финансирование проектов',
                'headers' => ['Проект', 'Цель', 'Собрано', 'Прогресс'],
                'rows' => $fundingRows,
            ];
        }

        if (!empty($data['average_funding_time'])) {
            $tables[] = [
                'title' => 'Дополнительные показатели',
                'headers' => ['Показатель', 'Значение'],
                'rows' => [
                    ['Среднее время сбора средств', (string) $data['average_funding_time']],
                ],
            ];
        }

        return $tables;
    }

    /**
     * @param array<string, mixed> $data
     * @param string|null $groupBy
     * @return array<int, array{title: string, headers: array<int, string>, rows: array<int, array<int, string>>}>
     */
    protected function buildComprehensiveTables(mixed $data, ?string $groupBy): array
    {
        if (!is_array($data)) {
            return [];
        }

        $tables = [];

        $tables = array_merge(
            $tables,
            $this->buildRevenueTables($data['revenue'] ?? [], $groupBy),
            $this->buildMembersTables($data['members'] ?? []),
            $this->buildProjectsTables($data['projects'] ?? [])
        );

        if (!empty($data['analytics']) && is_array($data['analytics'])) {
            $tables[] = [
                'title' => 'Аналитика',
                'headers' => ['Показатель', 'Значение'],
                'rows' => array_values(array_filter([
                    ['Конверсия', $this->formatPercentage($data['analytics']['conversion_rate'] ?? null)],
                    ['Средний чек', $this->formatMoney(null, $data['analytics']['average_donation'] ?? null)],
                    ['Удержание', $this->formatPercentage($data['analytics']['retention_rate'] ?? null)],
                    ['Рост', $this->formatPercentage($data['analytics']['growth_rate'] ?? null)],
                ], fn ($row) => trim((string) $row[1]) !== '')),
            ];
        }

        return $tables;
    }

    /**
     * @param mixed $data
     * @return array<int, array{title: string, headers: array<int, string>, rows: array<int, array<int, string>>}>
     */
    protected function buildGenericTables(mixed $data): array
    {
        if (!is_iterable($data)) {
            return [];
        }

        $rows = [];
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $rows[] = [$this->humanize((string) $key), json_encode($value, JSON_UNESCAPED_UNICODE)];
            } else {
                $rows[] = [$this->humanize((string) $key), $this->formatScalar($value)];
            }
        }

        return $rows ? [[
            'title' => 'Данные отчета',
            'headers' => ['Показатель', 'Значение'],
            'rows' => $rows,
        ]] : [];
    }

    /**
     * @param array<string, mixed> $summary
     * @return array<int, array{label: string, value: string}>
     */
    protected function convertGenericSummary(array $summary): array
    {
        $rows = [];
        foreach ($summary as $key => $value) {
            $rows[] = $this->summaryRow($this->humanize((string) $key), $this->formatScalar($value));
        }
        return $rows;
    }

    protected function summaryRow(string $label, string $value): ?array
    {
        if ($value === '') {
            return null;
        }

        return [
            'label' => $label,
            'value' => $value,
        ];
    }

    protected function buildFilename(ReportType $reportType, string $format): string
    {
        $safeFormat = in_array($format, ['excel', 'xlsx'], true) ? 'xlsx' : $format;

        return sprintf(
            'report_%s_%s.%s',
            $reportType->value,
            now()->format('Y-m-d_H-i-s'),
            $safeFormat
        );
    }

    protected function formatMoney(mixed $rublesValue, mixed $minorValue = null): string
    {
        $value = $this->toFloat($rublesValue);
        if ($value === null) {
            $value = $this->toFloat($minorValue);
            if ($value === null) {
                return '';
            }
            $value /= 100;
        }

        return number_format($value, 2, ',', ' ') . ' руб.';
    }

    protected function formatNumber(mixed $value): string
    {
        $numeric = $this->toFloat($value);
        return $numeric === null ? '' : number_format((float) $numeric, 0, ',', ' ');
    }

    protected function formatPercentage(mixed $value): string
    {
        $numeric = $this->toFloat($value);
        return $numeric === null ? '' : number_format((float) $numeric, 2, ',', ' ') . ' %';
    }

    protected function formatScalar(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        if (is_bool($value)) {
            return $value ? 'Да' : 'Нет';
        }

        if (is_numeric($value)) {
            return $this->formatNumber($value);
        }

        return (string) $value;
    }

    protected function formatDate(mixed $value): string
    {
        if (!$value) {
            return '';
        }

        try {
            return Carbon::parse((string) $value)->locale('ru')->isoFormat('D MMMM YYYY');
        } catch (\Throwable) {
            return (string) $value;
        }
    }

    protected function formatPeriodLabel(?string $period, mixed $dateFrom, mixed $dateTo): string
    {
        if (!$period || $period === 'all') {
            if ($dateFrom && $dateTo) {
                return $this->formatDate($dateFrom) . ' — ' . $this->formatDate($dateTo);
            }
            return 'Не указан';
        }

        return match ($period) {
            'day' => 'День',
            'week' => 'Неделя',
            'month' => 'Месяц',
            'quarter' => 'Квартал',
            'year' => 'Год',
            'custom' => $dateFrom && $dateTo
                ? $this->formatDate($dateFrom) . ' — ' . $this->formatDate($dateTo)
                : 'Произвольный период',
            default => $this->humanize($period),
        };
    }

    protected function formatGroupBy(string $value): string
    {
        return match ($value) {
            'day' => 'По дням',
            'week' => 'По неделям',
            'month' => 'По месяцам',
            'quarter' => 'По кварталам',
            'year' => 'По годам',
            'project' => 'По проектам',
            'payment_method' => 'По способам оплаты',
            default => $this->humanize($value),
        };
    }

    protected function formatProjectStatus(?string $status): string
    {
        return match ($status) {
            'all', null => 'Все статусы',
            'active' => 'Активные',
            'completed' => 'Завершённые',
            'failed' => 'Неуспешные',
            'cancelled' => 'Отменённые',
            default => $this->humanize($status),
        };
    }

    protected function formatEntityValue(mixed $id, string $plural): string
    {
        if ($id === null || $id === '' || $id === 'all') {
            return 'Все ' . $plural;
        }

        return 'ID ' . $id;
    }

    protected function formatSourceLabel(mixed $source): string
    {
        if (!$source || $source === 'unknown') {
            return 'Не указан';
        }

        return $this->humanize((string) $source);
    }

    protected function formatRevenuePeriod(string $period, ?string $groupBy): string
    {
        if (!$groupBy) {
            return $period;
        }

        try {
            return match ($groupBy) {
                'day' => $this->formatDate($period),
                'month' => Carbon::createFromFormat('Y-m', $period)->locale('ru')->isoFormat('MMMM YYYY'),
                'quarter' => $this->formatQuarter($period),
                'week' => $this->formatWeek($period),
                default => $period,
            };
        } catch (\Throwable) {
            return $period;
        }
    }

    protected function formatQuarter(string $value): string
    {
        if (preg_match('/^(\d{4})-Q(\d)$/', $value, $matches)) {
            return sprintf('%d квартал %s года', (int) $matches[2], $matches[1]);
        }

        return $value;
    }

    protected function formatWeek(string $value): string
    {
        if (preg_match('/^(\d{4})(\d{2})$/', $value, $matches)) {
            $year = (int) $matches[1];
            $week = (int) $matches[2];
            $date = Carbon::now()->setISODate($year, $week);
            $end = (clone $date)->endOfWeek();
            return sprintf('Неделя %d (%s — %s)', $week, $date->format('d.m'), $end->format('d.m.Y'));
        }

        return $value;
    }

    protected function formatSourceRow(string $section, array $row): array
    {
        return [
            'section' => $section,
            'label' => $row['label'] ?? '',
            'value' => $row['value'] ?? '',
        ];
    }

    protected function humanize(string $key): string
    {
        return Str::of($key)
            ->replace('_', ' ')
            ->lower()
            ->ucfirst();
    }

    protected function columnIndexToLetter(int $index): string
    {
        $letter = '';
        $index = max($index, 1);

        while ($index > 0) {
            $index--;
            $letter = chr(65 + ($index % 26)) . $letter;
            $index = intdiv($index, 26);
        }

        return $letter;
    }

    protected function toFloat(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value)) {
            return (float) $value;
        }

        if (is_string($value)) {
            $normalized = str_replace([' ', ','], ['', '.'], $value);
            if (is_numeric($normalized)) {
                return (float) $normalized;
            }
        }

        return null;
    }

    /**
     * @param array<int, mixed> $row
     * @return array<int, string>
     */
    protected function sanitizeCsvRow(array $row): array
    {
        return array_map(function ($value): string {
            if ($value === null) {
                return '';
            }

            if (is_bool($value)) {
                return $value ? 'Да' : 'Нет';
            }

            if (is_scalar($value)) {
                $string = (string) $value;
            } else {
                $string = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            }

            $string = str_replace(["\r\n", "\n", "\r"], ' ', $string);

            return mb_convert_encoding($string, 'UTF-8', 'UTF-8');
        }, $row);
    }
}