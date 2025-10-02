<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Widget;

class FormWidgetSeeder extends Seeder
{
  public function run(): void
  {
    Widget::create([
      'name' => 'Форма',
      'slug' => 'form',
      'description' => 'Виджет для создания интерактивных форм с различными типами полей',
      'category' => 'interactive',
      'is_active' => true,
      'fields_config' => [
        'name' => ['type' => 'text', 'label' => 'Название формы', 'required' => true],
        'description' => ['type' => 'textarea', 'label' => 'Описание формы'],
        'settings' => ['type' => 'json', 'label' => 'Настройки формы'],
        'styling' => ['type' => 'json', 'label' => 'Стилизация формы'],
        'actions' => ['type' => 'json', 'label' => 'Экшены формы'],
        'fields' => ['type' => 'json', 'label' => 'Поля формы']
      ],
      'settings_config' => [
        'title' => ['type' => 'text', 'label' => 'Заголовок формы'],
        'description' => ['type' => 'textarea', 'label' => 'Описание формы'],
        'submit_button_text' => ['type' => 'text', 'label' => 'Текст кнопки отправки'],
        'success_message' => ['type' => 'text', 'label' => 'Сообщение об успехе'],
        'error_message' => ['type' => 'text', 'label' => 'Сообщение об ошибке'],
        'redirect_url' => ['type' => 'text', 'label' => 'URL для редиректа'],
        'show_labels' => ['type' => 'boolean', 'label' => 'Показывать лейблы'],
        'show_placeholders' => ['type' => 'boolean', 'label' => 'Показывать подсказки'],
        'show_help_text' => ['type' => 'boolean', 'label' => 'Показывать текст помощи'],
        'enable_captcha' => ['type' => 'boolean', 'label' => 'Включить капчу'],
        'captcha_site_key' => ['type' => 'text', 'label' => 'Ключ сайта для капчи'],
        'captcha_secret_key' => ['type' => 'text', 'label' => 'Секретный ключ капчи']
      ]
    ]);
  }
}
