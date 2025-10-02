<?php

namespace App\Services;

use App\Models\FormWidget;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class FormActionGeneratorService
{
    private string $actionsPath;
    private string $namespace;

    public function __construct()
    {
        $this->actionsPath = app_path('Http/Controllers/FormActions');
        $this->namespace = 'App\\Http\\Controllers\\FormActions';
    }

    /**
     * Создать PHP экшен для формы
     */
    public function createAction(FormWidget $formWidget, string $actionName, string $actionType, array $config = []): string
    {
        $className = $this->generateClassName($actionName);
        $filePath = $this->getActionFilePath($className);

        // Создаем директорию если не существует
        if (!File::exists($this->actionsPath)) {
            File::makeDirectory($this->actionsPath, 0755, true);
        }

        // Генерируем содержимое класса
        $content = $this->generateActionClass($className, $actionName, $actionType, $config);

        // Сохраняем файл
        File::put($filePath, $content);

        return $this->namespace . '\\' . $className;
    }

    /**
     * Проверить существует ли экшен
     */
    public function actionExists(string $actionName): bool
    {
        $className = $this->generateClassName($actionName);
        $filePath = $this->getActionFilePath($className);

        return File::exists($filePath);
    }

    /**
     * Получить список существующих экшенов
     */
    public function getExistingActions(): array
    {
        if (!File::exists($this->actionsPath)) {
            return [];
        }

        $files = File::files($this->actionsPath);
        $actions = [];

        foreach ($files as $file) {
            if ($file->getExtension() === 'php') {
                $className = $file->getFilenameWithoutExtension();
                $actions[] = [
                    'class' => $this->namespace . '\\' . $className,
                    'name' => $this->getActionNameFromClass($className),
                    'file' => $file->getPathname(),
                ];
            }
        }

        return $actions;
    }

    /**
     * Удалить экшен
     */
    public function deleteAction(string $actionName): bool
    {
        $className = $this->generateClassName($actionName);
        $filePath = $this->getActionFilePath($className);

        if (File::exists($filePath)) {
            return File::delete($filePath);
        }

        return false;
    }

    private function generateClassName(string $actionName): string
    {
        return Str::studly($actionName) . 'FormAction';
    }

    private function getActionFilePath(string $className): string
    {
        return $this->actionsPath . '/' . $className . '.php';
    }

    private function getActionNameFromClass(string $className): string
    {
        return Str::snake(str_replace('FormAction', '', $className));
    }

    private function generateActionClass(string $className, string $actionName, string $actionType, array $config): string
    {
        $template = $this->getActionTemplate();

        return str_replace([
            '{{CLASS_NAME}}',
            '{{ACTION_NAME}}',
            '{{ACTION_TYPE}}',
            '{{CONFIG}}',
            '{{METHODS}}',
        ], [
            $className,
            $actionName,
            $actionType,
            var_export($config, true),
            $this->generateActionMethods($actionType, $config),
        ], $template);
    }

    private function getActionTemplate(): string
    {
        return '<?php

namespace {{NAMESPACE}};

use App\Models\FormSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class {{CLASS_NAME}}
{
    protected string $actionName = \'{{ACTION_NAME}}\';
    protected string $actionType = \'{{ACTION_TYPE}}\';
    protected array $config = {{CONFIG}};

    /**
     * Выполнить экшен
     */
    public function execute(FormSubmission $submission): bool
    {
        try {
            Log::info("Executing form action: {$this->actionName}", [
                \'submission_id\' => $submission->id,
                \'form_widget_id\' => $submission->form_widget_id,
            ]);

            {{METHODS}}

            Log::info("Form action completed successfully: {$this->actionName}");
            return true;
        } catch (\\Exception $e) {
            Log::error("Form action failed: {$this->actionName}", [
                \'error\' => $e->getMessage(),
                \'submission_id\' => $submission->id,
            ]);

            $submission->addActionLog($this->actionName, false, $e->getMessage());
            return false;
        }
    }

    /**
     * Получить конфигурацию экшена
     */
    public function getConfig(): array
    {
        return $this->config;
    }

    /**
     * Обновить конфигурацию экшена
     */
    public function updateConfig(array $config): void
    {
        $this->config = $config;
    }
}';
    }

    private function generateActionMethods(string $actionType, array $config): string
    {
        switch ($actionType) {
            case 'email':
                return $this->generateEmailMethods($config);
            case 'webhook':
                return $this->generateWebhookMethods($config);
            case 'database':
                return $this->generateDatabaseMethods($config);
            case 'telegram':
                return $this->generateTelegramMethods($config);
            default:
                return '// Custom action implementation';
        }
    }

    private function generateEmailMethods(array $config): string
    {
        return '
        $to = $this->config[\'to\'] ?? [];
        $subject = $this->config[\'subject\'] ?? \'New form submission\';
        $template = $this->config[\'template\'] ?? \'emails.form-submission\';

        // Отправка email
        // Mail::to($to)->send(new FormSubmissionMail($submission, $subject, $template));

        $submission->addActionLog($this->actionName, true, \'Email sent successfully\');
        ';
    }

    private function generateWebhookMethods(array $config): string
    {
        return '
        $url = $this->config[\'url\'] ?? null;
        $method = $this->config[\'method\'] ?? \'POST\';
        $headers = $this->config[\'headers\'] ?? [];

        if (!$url) {
            throw new \\Exception(\'Webhook URL is not configured\');
        }

        // Отправка webhook
        // Http::withHeaders($headers)->$method($url, $submission->data);

        $submission->addActionLog($this->actionName, true, \'Webhook sent successfully\');
        ';
    }

    private function generateDatabaseMethods(array $config): string
    {
        return '
        $table = $this->config[\'table\'] ?? \'form_submissions\';
        $mapping = $this->config[\'mapping\'] ?? [];

        // Сохранение в БД
        // DB::table($table)->insert($this->mapData($submission->data, $mapping));

        $submission->addActionLog($this->actionName, true, \'Data saved to database\');
        ';
    }

    private function generateTelegramMethods(array $config): string
    {
        return '
        $botToken = $this->config[\'bot_token\'] ?? null;
        $chatId = $this->config[\'chat_id\'] ?? null;
        $message = $this->config[\'message\'] ?? \'New form submission\';

        if (!$botToken || !$chatId) {
            throw new \\Exception(\'Telegram bot configuration is incomplete\');
        }

        // Отправка в Telegram
        // Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
        //     \'chat_id\' => $chatId,
        //     \'text\' => $message,
        //     \'parse_mode\' => \'HTML\'
        // ]);

        $submission->addActionLog($this->actionName, true, \'Telegram notification sent\');
        ';
    }
}
