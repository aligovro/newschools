import React, { useCallback, useState } from 'react';
import { FormActionsManager } from './form/FormActionsManager';
import { FormBuilder } from './form/FormBuilder';
import { FormPreview } from './form/FormPreview';
import { FormRenderer } from './form/FormRenderer';
import { FormStylingEditor } from './form/FormStylingEditor';
import { FormSubmissionsManager } from './form/FormSubmissionsManager';
import { FormWidget as FormWidgetType } from './form/types';

interface FormWidgetProps {
    widget: FormWidgetType;
    isEditable?: boolean;
    onConfigChange?: (config: Partial<FormWidgetType>) => void;
}

export const FormWidget: React.FC<FormWidgetProps> = ({
    widget,
    isEditable = false,
    onConfigChange,
}) => {
    const [activeTab, setActiveTab] = useState<
        | 'builder'
        | 'preview'
        | 'settings'
        | 'styling'
        | 'actions'
        | 'submissions'
    >('builder');
    const [pendingConfig, setPendingConfig] = useState<Partial<FormWidgetType>>(
        {},
    );

    // Объединяем widget с pendingConfig для отображения изменений в реальном времени
    const currentWidget = { ...widget, ...pendingConfig };

    const handleConfigChange = useCallback(
        (config: Partial<FormWidgetType>) => {
            setPendingConfig((prev) => ({ ...prev, ...config }));
            onConfigChange?.(config);
        },
        [onConfigChange],
    );

    if (isEditable) {
        return (
            <div className="form-widget-editor">
                <div className="form-widget-editor__tabs">
                    <button
                        className={`form-widget-editor__tab ${activeTab === 'builder' ? 'active' : ''}`}
                        onClick={() => setActiveTab('builder')}
                    >
                        Конструктор
                    </button>
                    <button
                        className={`form-widget-editor__tab ${activeTab === 'preview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('preview')}
                    >
                        Предпросмотр
                    </button>
                    <button
                        className={`form-widget-editor__tab ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Настройки
                    </button>
                    <button
                        className={`form-widget-editor__tab ${activeTab === 'styling' ? 'active' : ''}`}
                        onClick={() => setActiveTab('styling')}
                    >
                        Стилизация
                    </button>
                    <button
                        className={`form-widget-editor__tab ${activeTab === 'actions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('actions')}
                    >
                        Экшены
                    </button>
                    <button
                        className={`form-widget-editor__tab ${activeTab === 'submissions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('submissions')}
                    >
                        Отправки
                    </button>
                </div>

                <div className="form-widget-editor__content">
                    {activeTab === 'builder' && (
                        <FormBuilder
                            widget={currentWidget}
                            onConfigChange={handleConfigChange}
                        />
                    )}

                    {activeTab === 'preview' && (
                        <FormPreview widget={currentWidget} />
                    )}

                    {activeTab === 'settings' && (
                        <div className="form-widget-editor__settings">
                            <h3>Настройки формы</h3>
                            <p>Здесь будут настройки формы</p>
                        </div>
                    )}

                    {activeTab === 'styling' && (
                        <FormStylingEditor
                            widget={currentWidget}
                            onStylingChange={handleConfigChange}
                        />
                    )}

                    {activeTab === 'actions' && (
                        <FormActionsManager
                            actions={currentWidget.actions || []}
                            onActionsChange={(actions) =>
                                handleConfigChange({ actions })
                            }
                        />
                    )}

                    {activeTab === 'submissions' && (
                        <FormSubmissionsManager
                            widgetId={currentWidget.id || 0}
                            siteId={currentWidget.site_id || 0}
                        />
                    )}
                </div>
            </div>
        );
    }

    return <FormRenderer widget={widget} />;
};
