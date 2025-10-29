import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    StylingPanel,
    type StylingConfig,
} from '@/components/widgets/common/StylingPanel';
import {
    convertConfigsToConfig,
    type WidgetConfig,
} from '@/utils/widgetConfigUtils';
import { isCustomWidget } from '@/utils/widgetHelpers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { WidgetData } from '../types';
import { StandardWidgetFields } from './components/StandardWidgetFields';
import { AlumniStatsWidgetModal } from './modals/AlumniStatsWidgetModal';
import { AuthMenuWidgetModal } from './modals/AuthMenuWidgetModal';
import { DonationWidgetModal } from './modals/DonationWidgetModal';
import { DonationsListWidgetModal } from './modals/DonationsListWidgetModal';
import { FormWidgetModal } from './modals/FormWidgetModal';
import { HeroWidgetModal } from './modals/HeroWidgetModal';
import { HtmlWidgetModal } from './modals/HtmlWidgetModal';
import { ImageWidgetModal } from './modals/ImageWidgetModal';
import { MenuWidgetModal } from './modals/MenuWidgetModal';
import { ProjectsWidgetModal } from './modals/ProjectsWidgetModal';
import { ReferralLeaderboardWidgetModal } from './modals/ReferralLeaderboardWidgetModal';
import { RegionRatingWidgetModal } from './modals/RegionRatingWidgetModal';
import { SliderWidgetModal } from './modals/SliderWidgetModal';
import { TextWidgetModal } from './modals/TextWidgetModal';

interface WidgetEditModalProps {
    widget: WidgetData | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (widget: WidgetData) => void;
    onSaveConfig?: (widgetId: string, config: WidgetConfig) => Promise<void>;
    positions?: Array<{ id: number; name: string; slug: string }>;
    onMove?: (widgetId: string, positionSlug: string) => Promise<void> | void;
    siteId?: number;
}

export const WidgetEditModal: React.FC<WidgetEditModalProps> = ({
    widget,
    isOpen,
    onClose,
    onSave,
    onSaveConfig,
    positions = [],
    onMove,
    siteId = 0,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        widget_slug: '',
        config: {} as WidgetConfig,
        settings: {},
        is_active: true,
        is_visible: true,
    });

    const [_pendingConfig, setPendingConfig] = useState<WidgetConfig | null>(
        null,
    );
    const [savingError, setSavingError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSetPendingConfig = useCallback(
        (config: WidgetConfig | null) => {
            setPendingConfig(config);
        },
        [],
    );

    // Синхронизация формы с виджетом
    useEffect(() => {
        if (widget) {
            const config = widget.configs
                ? convertConfigsToConfig(widget.configs)
                : widget.config || {};

            setFormData({
                name: widget.name || '',
                widget_slug: widget.widget_slug || '',
                config: config,
                settings: widget.settings || {},
                is_active: widget.is_active,
                is_visible: widget.is_visible,
            });

            // Устанавливаем pendingConfig только если он еще не установлен
            if (_pendingConfig === null) {
                handleSetPendingConfig(config);
            }
        }
    }, [widget, _pendingConfig, handleSetPendingConfig]);

    // Мемоизированная функция сохранения
    const handleSave = useCallback(async () => {
        if (!widget) return;
        if (isSaving) return; // Предотвращаем двойное сохранение

        setIsSaving(true);
        setSavingError(null);

        try {
            // Сначала сохраняем конфигурацию, если есть изменения
            if (onSaveConfig && _pendingConfig) {
                await onSaveConfig(widget.id, _pendingConfig);
            }

            // Затем сохраняем основные данные виджета
            const minimalUpdates = {
                id: widget.id,
                name: formData.name,
                widget_slug: formData.widget_slug,
                is_active: formData.is_active,
                is_visible: formData.is_visible,
                // Используем обновленную конфигурацию
                config: _pendingConfig || formData.config,
            } as unknown as WidgetData;

            onSave(minimalUpdates);
            onClose();
        } catch (error) {
            console.error('Error saving widget:', error);

            // Получаем сообщение об ошибке
            const unknownError = error as {
                response?: { data?: { message?: string; errors?: string[] } };
                message?: string;
            };
            const errorMessage =
                unknownError?.response?.data?.message ||
                unknownError?.message ||
                'Ошибка при сохранении виджета. Попробуйте еще раз.';

            // Получаем ошибки валидации
            const validationErrors = unknownError?.response?.data?.errors || [];

            // Формируем полное сообщение об ошибке
            const fullErrorMessage =
                validationErrors.length > 0
                    ? validationErrors.join('\n')
                    : errorMessage;

            setSavingError(fullErrorMessage);
        } finally {
            setIsSaving(false);
        }
    }, [
        widget,
        formData,
        _pendingConfig,
        onSaveConfig,
        onSave,
        onClose,
        isSaving,
    ]);

    // Мемоизированная функция изменения полей
    const handleInputChange = useCallback((field: string, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const renderCustomWidget = useMemo(() => {
        if (!widget) return null;

        switch (widget.widget_slug) {
            case 'text': {
                return (
                    <TextWidgetModal
                        widget={widget}
                        pendingConfig={_pendingConfig}
                        onConfigUpdate={handleSetPendingConfig}
                    />
                );
            }

            case 'html': {
                return (
                    <HtmlWidgetModal
                        widget={widget}
                        pendingConfig={_pendingConfig}
                        onConfigUpdate={handleSetPendingConfig}
                    />
                );
            }

            case 'hero': {
                return (
                    <HeroWidgetModal
                        widget={widget}
                        pendingConfig={_pendingConfig}
                        onConfigUpdate={handleSetPendingConfig}
                    />
                );
            }

            case 'slider': {
                return (
                    <SliderWidgetModal
                        widget={widget}
                        pendingConfig={_pendingConfig}
                        onConfigUpdate={handleSetPendingConfig}
                    />
                );
            }

            case 'menu': {
                return (
                    <MenuWidgetModal
                        widget={widget}
                        pendingConfig={_pendingConfig}
                        onConfigUpdate={handleSetPendingConfig}
                    />
                );
            }

            case 'image': {
                return (
                    <ImageWidgetModal
                        widget={widget}
                        pendingConfig={_pendingConfig}
                        onConfigUpdate={handleSetPendingConfig}
                    />
                );
            }
            case 'auth_menu': {
                return (
                    <AuthMenuWidgetModal
                        widget={widget}
                        pendingConfig={_pendingConfig}
                        onConfigUpdate={handleSetPendingConfig}
                    />
                );
            }

            case 'form': {
                return (
                    <FormWidgetModal
                        widget={widget}
                        pendingConfig={_pendingConfig}
                        onConfigUpdate={handleSetPendingConfig}
                        siteId={siteId}
                    />
                );
            }

            case 'donation': {
                return (
                    <DonationWidgetModal
                        widget={widget}
                        pendingConfig={_pendingConfig}
                        onConfigUpdate={handleSetPendingConfig}
                    />
                );
            }

            case 'region_rating': {
                return (
                    <RegionRatingWidgetModal
                        widget={widget}
                        pendingConfig={_pendingConfig}
                        onConfigUpdate={handleSetPendingConfig}
                    />
                );
            }

            case 'donations_list': {
                return (
                    <DonationsListWidgetModal
                        widget={widget}
                        pendingConfig={_pendingConfig}
                        onConfigUpdate={handleSetPendingConfig}
                    />
                );
            }

            case 'projects': {
                return (
                    <ProjectsWidgetModal
                        widget={widget}
                        pendingConfig={_pendingConfig}
                        onConfigUpdate={handleSetPendingConfig}
                    />
                );
            }

            case 'referral_leaderboard': {
                return (
                    <ReferralLeaderboardWidgetModal
                        widget={widget}
                        pendingConfig={_pendingConfig}
                        onConfigUpdate={handleSetPendingConfig}
                    />
                );
            }

            case 'alumni_stats': {
                return (
                    <AlumniStatsWidgetModal
                        widget={widget}
                        pendingConfig={_pendingConfig}
                        onConfigUpdate={handleSetPendingConfig}
                    />
                );
            }

            default:
                return null;
        }
    }, [widget, siteId, _pendingConfig, handleSetPendingConfig]);

    const renderStandardFields = useMemo(
        () => (
            <StandardWidgetFields
                formData={formData}
                onInputChange={handleInputChange}
                onConfigUpdate={handleSetPendingConfig}
            />
        ),
        [formData, handleInputChange, handleSetPendingConfig],
    );

    const hasCustomEditor = useMemo(
        () => widget && isCustomWidget(widget.widget_slug),
        [widget],
    );

    const [activeTab, setActiveTab] = useState<'editor' | 'styling'>('editor');
    const stylingConfig = (formData.config?.styling || {}) as StylingConfig;

    if (!widget) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex max-h-[90vh] min-w-[1000px] flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Редактирование виджета</DialogTitle>
                    <DialogDescription>
                        Настройте параметры виджета и его содержимое
                    </DialogDescription>
                </DialogHeader>

                <div className="mb-3 flex flex-shrink-0 items-center gap-2">
                    <button
                        className={`form-widget-editor__tab ${activeTab === 'editor' ? 'active' : ''}`}
                        onClick={() => setActiveTab('editor')}
                    >
                        Редактор
                    </button>
                    <button
                        className={`form-widget-editor__tab ${activeTab === 'styling' ? 'active' : ''}`}
                        onClick={() => setActiveTab('styling')}
                    >
                        Стилизация
                    </button>
                </div>

                {/* Показываем ошибки валидации */}
                {savingError && (
                    <div className="mx-4 mb-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
                        <div className="font-semibold">Ошибка сохранения:</div>
                        <div className="whitespace-pre-wrap">{savingError}</div>
                    </div>
                )}

                <div className="max-h-[70vh] min-h-0 flex-1 space-y-4 overflow-y-auto pb-4 pr-1">
                    {positions.length > 0 && (
                        <div>
                            <Label htmlFor="position">Позиция</Label>
                            <Select
                                value={widget.position_slug}
                                onValueChange={async (slug) => {
                                    if (onMove) {
                                        await onMove(widget.id, slug);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите позицию" />
                                </SelectTrigger>
                                <SelectContent>
                                    {positions.map((p) => (
                                        <SelectItem key={p.id} value={p.slug}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {activeTab === 'editor' ? (
                        hasCustomEditor ? (
                            renderCustomWidget
                        ) : (
                            renderStandardFields
                        )
                    ) : (
                        <div className="rounded-lg border bg-white p-4">
                            <h4 className="mb-3 text-sm font-semibold text-gray-700">
                                Стилизация
                            </h4>
                            <StylingPanel
                                value={stylingConfig}
                                onChange={(val) => {
                                    const cfg = {
                                        ...(formData.config || {}),
                                        styling: val,
                                    };
                                    setPendingConfig(cfg);
                                    handleInputChange('config', cfg);
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-shrink-0 justify-end space-x-2 border-t bg-white pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
