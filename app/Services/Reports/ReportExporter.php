<?php

namespace App\Services\Reports;

use App\Enums\ReportType;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExporter
{
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
            fputcsv($handle, $dataset['headers'], ';');

            foreach ($dataset['rows'] as $row) {
                $line = [];
                foreach ($dataset['headers'] as $header) {
                    $line[] = $row[$header] ?? '';
                }
                fputcsv($handle, $line, ';');
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
        $html = view('reports.export', [
            'title' => $dataset['title'],
            'headers' => $dataset['headers'],
            'rows' => $dataset['rows'],
            'summary' => $dataset['summary'],
            'filters' => $dataset['filters'],
            'meta' => $dataset['meta'],
            'generatedAt' => Arr::get($payload, 'generated_at', now()),
        ])->render();

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'landscape');
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
        $sheet->fromArray($dataset['headers'], null, 'A1');

        $rowIndex = 2;
        foreach ($dataset['rows'] as $row) {
            $line = [];
            foreach ($dataset['headers'] as $header) {
                $value = $row[$header] ?? null;
                if (is_bool($value)) {
                    $value = $value ? 'Да' : 'Нет';
                } elseif (is_array($value) || is_object($value)) {
                    $value = json_encode($value, JSON_UNESCAPED_UNICODE);
                }
                $line[] = $value;
            }
            $sheet->fromArray($line, null, 'A' . $rowIndex);
            $rowIndex++;
        }

        $lastColumn = $this->columnIndexToLetter(max(count($dataset['headers']), 1));

        if (!empty($dataset['summary'])) {
            $sheet->setCellValue("A{$rowIndex}", 'Summary');
            $sheet->mergeCells("A{$rowIndex}:{$lastColumn}{$rowIndex}");
            $sheet->getStyle("A{$rowIndex}")->getFont()->setBold(true);
            $rowIndex++;

            foreach ($dataset['summary'] as $key => $value) {
                $sheet->setCellValue("A{$rowIndex}", Str::headline((string) $key));
                $sheet->setCellValue("B{$rowIndex}", $this->stringifyValue($value));
                $rowIndex++;
            }
        }

        foreach (range('A', $lastColumn) as $columnID) {
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
        $rows = $this->normalizeRows($reportType, $payload);
        $headers = $this->resolveHeaders($rows);

        return [
            'title' => (string) ($payload['title'] ?? $reportType->label()),
            'filters' => Arr::get($payload, 'filters', []),
            'summary' => Arr::get($payload, 'summary', []),
            'meta' => Arr::get($payload, 'meta', []),
            'rows' => $rows,
            'headers' => $headers,
        ];
    }

    protected function buildFilename(ReportType $reportType, string $format): string
    {
        $safeFormat = $format === 'xlsx' ? 'xlsx' : ($format === 'excel' ? 'xlsx' : $format);

        return sprintf(
            'report_%s_%s.%s',
            $reportType->value,
            now()->format('Y-m-d_H-i-s'),
            $safeFormat
        );
    }

    protected function stringifyValue(mixed $value): string
    {
        if (is_bool($value)) {
            return $value ? 'Да' : 'Нет';
        }

        if (is_numeric($value)) {
            return (string) $value;
        }

        if (is_array($value) || is_object($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE);
        }

        return (string) $value;
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

    /**
     * @param array<string, mixed> $payload
     * @return array<int, array<string, mixed>>
     */
    protected function normalizeRows(ReportType $reportType, array $payload): array
    {
        $data = $payload['data'] ?? [];
        $rows = [];

        switch ($reportType) {
            case ReportType::Revenue:
            case ReportType::Custom:
                $rows = $this->mapSimpleRows('revenue', $data);
                break;

            case ReportType::Members:
                $rows = $this->mapMembersRows($data);
                break;

            case ReportType::Projects:
                $rows = $this->mapProjectsRows($data);
                break;

            case ReportType::Comprehensive:
                $rows = array_merge(
                    $this->mapSimpleRows('revenue', $data['revenue'] ?? []),
                    $this->mapMembersRows($data['members'] ?? [], 'members'),
                    $this->mapProjectsRows($data['projects'] ?? [], 'projects'),
                    $this->mapAnalyticsRows($data['analytics'] ?? [])
                );
                break;
        }

        return $rows;
    }

    /**
     * @param array<int, array<string, mixed>> $rows
     * @return array<int, string>
     */
    protected function resolveHeaders(array $rows): array
    {
        if (empty($rows)) {
            return ['section', 'key', 'value'];
        }

        $headers = collect($rows)->reduce(function ($carry, $row) {
            foreach (array_keys($row) as $key) {
                $carry[$key] = true;
            }
            return $carry;
        }, []);

        return array_keys($headers);
    }

    /**
     * @param array<int, array<string, mixed>> $data
     * @return array<int, array<string, mixed>>
     */
    protected function mapSimpleRows(string $section, array $data): array
    {
        return array_map(function (array $row) use ($section) {
            return [
                'section' => $section,
                'period' => $row['period'] ?? '',
                'total' => $row['total'] ?? $row['total_amount'] ?? '',
                'count' => $row['count'] ?? '',
            ];
        }, $data);
    }

    /**
     * @param array<string, mixed> $data
     * @return array<int, array<string, mixed>>
     */
    protected function mapMembersRows(array $data, string $section = 'members'): array
    {
        $rows = [];

        foreach ($data['daily_registrations'] ?? [] as $row) {
            $rows[] = [
                'section' => $section . '_daily_registrations',
                'date' => $row['date'] ?? '',
                'count' => $row['count'] ?? 0,
            ];
        }

        foreach ($data['members_by_source'] ?? [] as $row) {
            $rows[] = [
                'section' => $section . '_by_source',
                'source' => $row['source'] ?? '',
                'count' => $row['count'] ?? 0,
            ];
        }

        $rows[] = [
            'section' => $section . '_summary',
            'active_members' => $data['active_members'] ?? 0,
        ];

        return $rows;
    }

    /**
     * @param array<string, mixed> $data
     * @return array<int, array<string, mixed>>
     */
    protected function mapProjectsRows(array $data, string $section = 'projects'): array
    {
        $rows = [];

        foreach ($data['projects_by_status'] ?? [] as $row) {
            $rows[] = [
                'section' => $section . '_by_status',
                'status' => $row['status'] ?? '',
                'count' => $row['count'] ?? 0,
            ];
        }

        foreach ($data['funding_progress'] ?? [] as $row) {
            $rows[] = [
                'section' => $section . '_funding',
                'project_id' => $row['project_id'] ?? '',
                'title' => $row['title'] ?? '',
                'target_amount' => $row['target_amount'] ?? 0,
                'collected_amount' => $row['collected_amount'] ?? 0,
                'progress_percentage' => $row['progress_percentage'] ?? 0,
            ];
        }

        if (isset($data['average_funding_time'])) {
            $rows[] = [
                'section' => $section . '_metrics',
                'average_funding_time' => $data['average_funding_time'],
            ];
        }

        return $rows;
    }

    /**
     * @param array<string, mixed> $data
     * @return array<int, array<string, mixed>>
     */
    protected function mapAnalyticsRows(array $data): array
    {
        if (empty($data)) {
            return [];
        }

        return [
            [
                'section' => 'analytics',
                'conversion_rate' => $data['conversion_rate'] ?? 0,
                'average_donation' => $data['average_donation'] ?? 0,
                'retention_rate' => $data['retention_rate'] ?? 0,
                'growth_rate' => $data['growth_rate'] ?? 0,
            ],
        ];
    }
}


