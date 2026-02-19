<?php

namespace App\BlagoqrMigrated;

use App\Models\Organization;
use App\Services\ProjectDonations\ProjectDonationsService;

/**
 * Логика топов «Топ поддержавших выпусков» и «Топ регулярно-поддерживающих» только для организаций,
 * перенесённых из blagoqr. Данные берутся из снапшотов (organization_*_snapshots), без смешивания с основной логикой.
 * Платежи и донаты по-прежнему идут через основную систему — здесь только отдача уже посчитанных снапшотов.
 */
final class BlagoqrMigratedDonationsService
{
    public function __construct(
        private BlagoqrMigratedOrgResolver $resolver,
        private BlagoqrTopRecurringSnapshotRepository $recurringRepo,
        private BlagoqrTopOneTimeSnapshotRepository $oneTimeRepo,
    ) {}

    public function isForOrganization(Organization $organization): bool
    {
        return $this->resolver->isBlagoqrMigrated($organization);
    }

    /**
     * Топ поддержавших выпусков (разовые платежи по категориям).
     * Формат ответа как у ProjectDonationsService::topByDonorNameForOrganization — массив записей.
     *
     * @return array<int, array{donor_label: string, total_amount: int, total_amount_formatted: string, donations_count: int}>
     */
    public function topOneTimeByGraduation(Organization $organization, int $limit = 50): array
    {
        $rows = $this->oneTimeRepo->get($organization->id);
        $data = [];
        $i = 0;
        foreach ($rows as $row) {
            if ($i >= $limit) {
                break;
            }
            $data[] = [
                'donor_label' => $row->donor_label,
                'total_amount' => (int) $row->total_amount,
                'total_amount_formatted' => $this->formatRubles((int) $row->total_amount),
                'donations_count' => (int) $row->payments_count,
            ];
            $i++;
        }

        return $data;
    }

    /**
     * Топ регулярно-поддерживающих. Формат как у ProjectDonationsService::topRecurringByDonorNameForOrganization.
     *
     * @return array{data: array, pagination: array{current_page: int, last_page: int, per_page: int, total: int}}
     */
    public function topRecurring(Organization $organization, int $page = 1, int $perPage = 50): array
    {
        $perPage = min(max(1, $perPage), 50);
        $page = max(1, $page);

        $all = $this->recurringRepo->get($organization->id);
        $total = $all->count();
        $offset = ($page - 1) * $perPage;
        $items = $all->slice($offset, $perPage)->values();

        $data = $items->map(fn ($r) => [
            'id' => 'recurring:' . md5($r->donor_label),
            'donor_label' => $r->donor_label,
            'total_amount' => (int) $r->total_amount,
            'total_amount_formatted' => $this->formatRubles((int) $r->total_amount),
            'donations_count' => (int) $r->donations_count,
        ])->all();

        return [
            'data' => $data,
            'pagination' => [
                'current_page' => $page,
                'last_page' => (int) max(1, ceil($total / $perPage)),
                'per_page' => $perPage,
                'total' => $total,
            ],
        ];
    }

    /**
     * Нормализация ключа из blagoqr (для импорта) — единая точка с ProjectDonationsService.
     */
    public static function normalizeCategoryKey(?string $key): ?string
    {
        return ProjectDonationsService::normalizeGraduateOnlyKey($key);
    }

    private function formatRubles(int $amountInKopecks): string
    {
        $rubles = $amountInKopecks / 100;

        return number_format($rubles, 0, '', ' ') . ' ₽';
    }
}
