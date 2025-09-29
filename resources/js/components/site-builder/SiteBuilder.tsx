import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Eye, Layout, Save, Settings, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { ContentBlocksPanel } from './ContentBlocksPanel';
import { DragDropProvider } from './DragDropProvider';
import { PageBuilder } from './PageBuilder';

interface SiteBuilderProps {
    initialContent?: Record<string, unknown>;
    onSave?: (content: Record<string, unknown>) => void;
    onPreview?: () => void;
    className?: string;
}

export const SiteBuilder: React.FC<SiteBuilderProps> = ({
    initialContent,
    onSave,
    onPreview,
    className,
}) => {
    const [activeTab, setActiveTab] = useState('builder');
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    const handleSave = (content: Record<string, unknown>) => {
        onSave?.(content);
    };

    const handlePreview = () => {
        setIsPreviewMode(!isPreviewMode);
        onPreview?.();
    };

    const handleExport = () => {
        // Логика экспорта контента
        console.log('Exporting content...');
    };

    const handleImport = () => {
        // Логика импорта контента
        console.log('Importing content...');
    };

    return (
        <DragDropProvider>
            <div className={`flex h-screen flex-col bg-gray-100 ${className}`}>
                {/* Header */}
                <div className="border-b border-gray-200 bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Конструктор сайтов
                            </h1>
                            <Tabs
                                value={activeTab}
                                onValueChange={setActiveTab}
                            >
                                <TabsList>
                                    <TabsTrigger
                                        value="builder"
                                        className="flex items-center space-x-2"
                                    >
                                        <Layout className="h-4 w-4" />
                                        <span>Конструктор</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="settings"
                                        className="flex items-center space-x-2"
                                    >
                                        <Settings className="h-4 w-4" />
                                        <span>Настройки</span>
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleImport}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Импорт
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExport}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Экспорт
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreview}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                {isPreviewMode
                                    ? 'Редактировать'
                                    : 'Предпросмотр'}
                            </Button>

                            <Button
                                size="sm"
                                onClick={() => handleSave(initialContent)}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Сохранить
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                    {activeTab === 'builder' && (
                        <>
                            {/* Sidebar */}
                            <ContentBlocksPanel />

                            {/* Main Builder Area */}
                            <div className="flex flex-1 flex-col">
                                <PageBuilder
                                    initialBlocks={initialContent?.blocks || []}
                                    onSave={handleSave}
                                    onPreview={handlePreview}
                                />
                            </div>
                        </>
                    )}

                    {activeTab === 'settings' && (
                        <div className="flex-1 p-6">
                            <div className="mx-auto max-w-4xl">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Настройки сайта</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Название сайта
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Введите название сайта"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Описание сайта
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Введите описание сайта"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Цветовая схема
                                                </label>
                                                <div className="flex space-x-2">
                                                    <button className="h-8 w-8 rounded-full border-2 border-gray-300 bg-blue-600"></button>
                                                    <button className="h-8 w-8 rounded-full border-2 border-transparent bg-green-600"></button>
                                                    <button className="h-8 w-8 rounded-full border-2 border-transparent bg-purple-600"></button>
                                                    <button className="h-8 w-8 rounded-full border-2 border-transparent bg-red-600"></button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Шрифт
                                                </label>
                                                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500">
                                                    <option value="inter">
                                                        Inter
                                                    </option>
                                                    <option value="roboto">
                                                        Roboto
                                                    </option>
                                                    <option value="open-sans">
                                                        Open Sans
                                                    </option>
                                                    <option value="lato">
                                                        Lato
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DragDropProvider>
    );
};
