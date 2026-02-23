<?php

namespace App\Console\Commands;

use App\Services\Beget\BegetApiException;
use App\Services\Beget\BegetDomainService;
use Illuminate\Console\Command;
use Illuminate\Http\Client\ConnectionException;

/**
 * Проверка доступа к Beget API и вывод списка доменов (и сайтов на хостинге).
 * На хостинге: показывает сайты и домены, подсказывает BEGET_SITE_ID.
 * На VPS: метод site/getList недоступен — показываем только домены; привязка в дашборде только в БД, nginx вручную.
 *
 * Запуск: php artisan beget:status
 */
class BegetStatusCommand extends Command
{
    protected $signature = 'beget:status';

    protected $description = 'Проверить Beget API, список доменов (и сайтов на хостинге)';

    public function handle(): int
    {
        $service = BegetDomainService::make();

        if (! $service) {
            $this->error('Beget API не настроен.');
            $this->line('Добавьте в .env:');
            $this->line('  BEGET_LOGIN=ваш_логин');
            $this->line('  BEGET_PASSWORD=пароль_от_API');
            $this->line('');
            $this->line('Пароль API создаётся в панели Beget: Настройки → Доступ к API (не пароль от входа в панель).');

            return Command::FAILURE;
        }

        $this->info('Проверка доступа к Beget API (domain/getList)...');

        try {
            $domains = $service->getAvailableDomains();
        } catch (ConnectionException $e) {
            $this->error('Ошибка соединения: ' . $e->getMessage());
            $this->line('');
            if (str_contains($e->getMessage(), 'SSL certificate')) {
                $this->line('На Windows без CA-буфера можно временно отключить проверку SSL в .env:');
                $this->line('  BEGET_VERIFY_SSL=false');
                $this->line('');
            }
            $this->line('Другие причины: нет интернета, блокировка, таймаут.');

            return Command::FAILURE;
        } catch (BegetApiException $e) {
            $this->error('Ошибка API: ' . $e->getMessage());
            $this->line('');
            $this->line('Возможные причины: неверный BEGET_LOGIN/BEGET_PASSWORD (пароль из раздела «Доступ к API»), блокировка.');

            return Command::FAILURE;
        }

        $vpsMode = ! $service->isHostingMode();
        if ($vpsMode) {
            $this->line('');
            $this->warn('Режим VPS/облако: метод site/getList недоступен (это нормально для облака).');
            $this->line('В дашборде можно выбрать домен из списка ниже — привязка сохранится только в БД.');
            $this->line('На сервере настройте nginx/vhost для выбранного домена вручную.');
            $this->line('');
        }

        if (! empty($domains)) {
            $this->info('Домены в аккаунте Beget:');
            $this->table(
                ['ID', 'Домен'],
                array_map(fn ($d) => [$d['id'] ?? '—', $d['fqdn'] ?? '—'], $domains)
            );
        } else {
            $this->warn('Список доменов пуст. Добавьте домен в панели Beget.');
        }

        try {
            $sites = $service->getSites();
            if (! empty($sites)) {
                $rows = [];
                $firstId = null;
                foreach ($sites as $key => $site) {
                    $id = null;
                    $name = '—';
                    if (is_array($site)) {
                        $id = (int) ($site['id'] ?? $key);
                        $name = $site['site_name'] ?? $site['name'] ?? $site['domain'] ?? (string) $key;
                    }
                    if ($firstId === null && $id) {
                        $firstId = $id;
                    }
                    $rows[] = [$id ?: $key, $name];
                }
                $this->line('');
                $this->info('Сайты (хостинг):');
                $this->table(['ID', 'Название / данные'], $rows);
                if ($firstId !== null) {
                    $this->line('Для хостинга добавьте в .env: BEGET_SITE_ID=' . $firstId);
                }
            }
        } catch (BegetApiException $e) {
            if (str_contains($e->getMessage(), 'Cannot access method sites') || str_contains($e->getMessage(), 'method sites')) {
                $this->line('');
                $this->line('BEGET_SITE_ID для VPS не нужен — оставьте пустым.');
            }
        }

        return Command::SUCCESS;
    }
}
