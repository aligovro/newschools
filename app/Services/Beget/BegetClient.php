<?php

namespace App\Services\Beget;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BegetClient
{
    public function __construct(
        private readonly string $baseUrl,
        private readonly string $login,
        private readonly string $password,
        private readonly int $timeout = 30
    ) {}

    /**
     * Вызов метода Beget API.
     *
     * @param  array<string, mixed>|null  $inputData
     * @return array<string, mixed>
     *
     * @throws BegetApiException
     */
    public function call(string $section, string $method, ?array $inputData = null): array
    {
        $url = rtrim($this->baseUrl, '/') . '/' . $section . '/' . $method;

        $params = [
            'login' => $this->login,
            'passwd' => $this->password,
            'output_format' => 'json',
        ];

        if ($inputData !== null) {
            $params['input_format'] = 'json';
            $params['input_data'] = json_encode($inputData);
        }

        Log::debug('Beget API request', ['url' => $url, 'section' => $section, 'method' => $method]);

        $response = $this->client()->asForm()->post($url, $params);

        if ($response->failed()) {
            throw new BegetApiException(
                'Beget API HTTP error: ' . $response->status(),
                null,
                $response->status()
            );
        }

        $data = $response->json();

        if (($data['status'] ?? null) === 'error') {
            $errorCode = $data['error_code'] ?? null;
            $errorText = $data['error_text'] ?? $data['error'] ?? 'Unknown Beget API error';
            throw new BegetApiException($errorText, $errorCode);
        }

        $answer = $data['answer'] ?? [];

        if (($answer['status'] ?? null) === 'error') {
            $errors = $answer['errors'] ?? [];
            $first = $errors[0] ?? [];
            $errorCode = $first['error_code'] ?? null;
            $errorText = $first['error_text'] ?? $answer['error_text'] ?? 'Unknown Beget API error';
            throw new BegetApiException($errorText, $errorCode);
        }

        return $answer;
    }

    /**
     * Список доменов аккаунта.
     *
     * @return array<int, array{id: int, fqdn: string}>
     */
    public function getDomainList(): array
    {
        $answer = $this->call('domain', 'getList');
        $result = $answer['result'] ?? [];

        if (! is_array($result)) {
            return [];
        }

        $list = [];
        foreach ($result as $key => $item) {
            if (is_array($item)) {
                $list[] = [
                    'id' => (int) ($item['id'] ?? $key),
                    'fqdn' => (string) ($item['fqdn'] ?? $item['domain'] ?? ''),
                ];
            }
        }

        return $list;
    }

    /**
     * Список поддоменов для домена.
     *
     * @return array<int, array{id: int, subdomain: string, full_fqdn: string}>
     */
    public function getSubdomainList(int $domainId): array
    {
        $answer = $this->call('domain', 'getSubdomainList', ['domain_id' => $domainId]);
        $result = $answer['result'] ?? [];

        return is_array($result) ? $result : [];
    }

    /**
     * Создание поддомена.
     *
     * @return int|null ID созданного поддомена
     */
    public function addSubdomain(int $domainId, string $subdomain): ?int
    {
        $answer = $this->call('domain', 'addSubdomainVirtual', [
            'domain_id' => $domainId,
            'subdomain' => $subdomain,
        ]);

        return $answer['result']['id'] ?? null;
    }

    /**
     * Список сайтов и привязанных доменов.
     *
     * @return array<int, array{id: int, site_name: string, domains: array}>
     */
    public function getSiteList(): array
    {
        $answer = $this->call('site', 'getList');
        $result = $answer['result'] ?? [];

        return is_array($result) ? $result : [];
    }

    /**
     * Привязка домена к сайту в Beget.
     */
    public function linkDomainToSite(int $siteId, int $domainId): void
    {
        $this->call('site', 'linkDomain', [
            'site_id' => $siteId,
            'domain_id' => $domainId,
        ]);
    }

    /**
     * Смена версии PHP для домена/поддомена.
     */
    public function changePhpVersion(string $fullFqdn, string $phpVersion = '8.3'): void
    {
        $this->call('domain', 'changePhpVersion', [
            'full_fqdn' => $fullFqdn,
            'php_version' => $phpVersion,
        ]);
    }

    private function client(): PendingRequest
    {
        return Http::timeout($this->timeout);
    }
}
