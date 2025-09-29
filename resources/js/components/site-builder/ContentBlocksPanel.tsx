import { Card, CardContent } from '@/components/ui/card';
import {
    BarChart3,
    Briefcase,
    CheckCircle,
    DollarSign,
    FolderOpen,
    Image,
    Images,
    Info,
    Layout,
    Mail,
    MessageSquare,
    Newspaper,
    Sliders,
    Type,
    Users,
} from 'lucide-react';
import React from 'react';
import { DraggableItem } from './DraggableItem';

interface ContentBlock {
    id: string;
    type: string;
    name: string;
    description: string;
    icon: React.ComponentType<any>;
    category: string;
}

const contentBlocks: ContentBlock[] = [
    {
        id: 'hero',
        type: 'hero',
        name: 'Hero Section',
        description: 'Большой заголовок с фоновым изображением и кнопкой',
        icon: Layout,
        category: 'Основные',
    },
    {
        id: 'text',
        type: 'text',
        name: 'Текстовый блок',
        description: 'Простой текстовый блок',
        icon: Type,
        category: 'Основные',
    },
    {
        id: 'image',
        type: 'image',
        name: 'Изображение',
        description: 'Блок с одним изображением',
        icon: Image,
        category: 'Медиа',
    },
    {
        id: 'gallery',
        type: 'gallery',
        name: 'Галерея изображений',
        description: 'Сетка изображений с возможностью лайтбокса',
        icon: Images,
        category: 'Медиа',
    },
    {
        id: 'slider',
        type: 'slider',
        name: 'Слайдер',
        description: 'Интеграция с системой слайдеров',
        icon: Sliders,
        category: 'Медиа',
    },
    {
        id: 'testimonials',
        type: 'testimonials',
        name: 'Отзывы',
        description: 'Блок для отображения отзывов клиентов',
        icon: MessageSquare,
        category: 'Контент',
    },
    {
        id: 'contact_form',
        type: 'contact_form',
        name: 'Контактная форма',
        description: 'Форма для связи с организацией',
        icon: Mail,
        category: 'Формы',
    },
    {
        id: 'news',
        type: 'news',
        name: 'Новости',
        description: 'Список последних новостей или статей',
        icon: Newspaper,
        category: 'Контент',
    },
    {
        id: 'projects',
        type: 'projects',
        name: 'Проекты',
        description: 'Список проектов организации',
        icon: FolderOpen,
        category: 'Контент',
    },
    {
        id: 'stats',
        type: 'stats',
        name: 'Статистика/Цифры',
        description: 'Блок для отображения ключевых статистических данных',
        icon: BarChart3,
        category: 'Данные',
    },
    {
        id: 'features',
        type: 'features',
        name: 'Особенности/Преимущества',
        description: 'Список особенностей или преимуществ',
        icon: CheckCircle,
        category: 'Контент',
    },
    {
        id: 'pricing',
        type: 'pricing',
        name: 'Тарифы/Цены',
        description: 'Блок для отображения тарифных планов',
        icon: DollarSign,
        category: 'Контент',
    },
    {
        id: 'team',
        type: 'team',
        name: 'Команда',
        description: 'Блок для представления членов команды',
        icon: Users,
        category: 'Контент',
    },
    {
        id: 'services',
        type: 'services',
        name: 'Услуги',
        description: 'Список предлагаемых услуг',
        icon: Briefcase,
        category: 'Контент',
    },
    {
        id: 'about',
        type: 'about',
        name: 'О нас',
        description: 'Развернутая информация об организации',
        icon: Info,
        category: 'Контент',
    },
];

const categories = ['Основные', 'Медиа', 'Контент', 'Формы', 'Данные'];

export const ContentBlocksPanel: React.FC = () => {
    const groupedBlocks = categories.map((category) => ({
        category,
        blocks: contentBlocks.filter((block) => block.category === category),
    }));

    return (
        <div className="h-full w-80 overflow-y-auto border-r border-gray-200 bg-white">
            <div className="border-b border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    Блоки контента
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Перетащите блоки для создания страницы
                </p>
            </div>

            <div className="space-y-6 p-4">
                {groupedBlocks.map(({ category, blocks }) => (
                    <div key={category}>
                        <h4 className="mb-3 text-sm font-medium text-gray-700">
                            {category}
                        </h4>
                        <div className="space-y-2">
                            {blocks.map((block) => (
                                <DraggableItem key={block.id} item={block}>
                                    <Card className="cursor-move transition-shadow hover:shadow-md">
                                        <CardContent className="p-3">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    <block.icon className="h-5 w-5 text-gray-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h5 className="truncate text-sm font-medium text-gray-900">
                                                        {block.name}
                                                    </h5>
                                                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                                        {block.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </DraggableItem>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
