<?php

namespace App\Services\Autopayments;

use App\Models\Organization;
use App\Services\Autopayments\DTO\AutopaymentRowDto;

/**
 * Сервис для получения списка автоплатежей организации.
 * Оркестрирует работу репозитория и форматтера.
 */
class OrganizationAutopaymentsService
{
    public function __construct(
        private readonly OrganizationAutopaymentsRepository $repository,
        private readonly AutopaymentRowFormatter $formatter,
    ) {
    }

    /**
     * Получить список автоплатежей организации с пагинацией.
     *
     * @return array{data: AutopaymentRowDto[], meta: array{current_page: int, last_page: int, per_page: int, total: int}}
     */
    public function listForOrganization(
        Organization $organization,
        int $page = 1,
        int $perPage = 20,
        array $filters = []
    ): array {
        $page = max(1, $page);
        $perPage = min(max(1, $perPage), 100); // Максимум 100 на страницу

        $useLegacy = (bool) $organization->is_legacy_migrated;

        if ($useLegacy) {
            $result = $this->repository->getLegacyAutopaymentsPaginated(
                $organization->id,
                $page,
                $perPage,
                $filters
            );
        } else {
            $result = $this->repository->getSubscriptionKeysPaginated(
                $organization->id,
                $page,
                $perPage,
                $filters
            );
        }

        $keys = $result['keys'];
        $total = $result['total'];
        $legacyIndex = $result['legacy_index'] ?? null;

        if ($keys->isEmpty()) {
            return [
                'data' => [],
                'meta' => [
                    'current_page' => $page,
                    'last_page' => max(1, (int) ceil($total / $perPage)),
                    'per_page' => $perPage,
                    'total' => $total,
                ],
            ];
        }

        $subscriptionsData = $this->repository->getTransactionsAndDonationsByKeys(
            $organization->id,
            $keys->toArray(),
            $legacyIndex
        );

        // Форматируем каждую подписку в DTO
        $data = $subscriptionsData->map(function ($subscriptionData) {
            return $this->formatter->format($subscriptionData);
        })->toArray();

        return [
            'data' => $data,
            'meta' => [
                'current_page' => $page,
                'last_page' => max(1, (int) ceil($total / $perPage)),
                'per_page' => $perPage,
                'total' => $total,
            ],
        ];
    }
}
