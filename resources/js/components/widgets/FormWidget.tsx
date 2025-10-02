import React, { useCallback, useState } from 'react';
import { FormActionsManager } from './form/FormActionsManager';
import { FormBuilder } from './form/FormBuilder';
import { FormPreview } from './form/FormPreview';
import { FormRenderer } from './form/FormRenderer';
import { FormSubmissionsManager } from './form/FormSubmissionsManager';
import { FormWidget as FormWidgetType } from './form/types';

interface FormWidgetProps {
    widget: FormWidgetType;
    isEditable?: boolean;
    onConfigChange?: (config: Partial<FormWidgetType>) => void;
    onSave?: (config: Partial<FormWidgetType>) => void;
}

export const FormWidget: React.FC<FormWidgetProps> = ({
    widget,
    isEditable = false,
    onConfigChange,
    onSave,
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

    const handleConfigChange = useCallback(
        (config: Partial<FormWidgetType>) => {
            setPendingConfig((prev) => ({ ...prev, ...config }));
            onConfigChange?.(config);
        },
        [onConfigChange],
    );

    const handleSave = useCallback(() => {
        onSave?.(pendingConfig);
        setPendingConfig({});
    }, [pendingConfig, onSave]);

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
                            widget={widget}
                            onConfigChange={handleConfigChange}
                        />
                    )}

                    {activeTab === 'preview' && <FormPreview widget={widget} />}

                    {activeTab === 'settings' && (
                        <div className="form-widget-editor__settings">
                            <h3>Настройки формы</h3>
                            <p>Здесь будут настройки формы</p>
                        </div>
                    )}

                    {activeTab === 'styling' && (
                        <div>
                            <h3>Настройки стилизации</h3>
                            <div className="form-widget-editor__field">
                                <label>CSS класс для обертки</label>
                                <input
                                    type="text"
                                    value={widget.css_class || ''}
                                    onChange={(e) =>
                                        handleConfigChange({
                                            css_class: e.target.value,
                                        })
                                    }
                                    placeholder="my-custom-form-class"
                                />
                                <p className="form-widget-editor__help-text">
                                    Добавьте CSS класс для кастомной стилизации
                                    формы. Вы сможете использовать этот класс в
                                    своих CSS файлах.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'actions' && (
                        <FormActionsManager
                            actions={widget.actions || []}
                            onActionsChange={(actions) =>
                                handleConfigChange({ actions })
                            }
                        />
                    )}

                    {activeTab === 'submissions' && (
                        <FormSubmissionsManager
                            widgetId={widget.id || 0}
                            siteId={widget.site_id || 0}
                        />
                    )}
                </div>

                <div className="form-widget-editor__footer">
                    <button
                        className="form-widget-editor__save-btn"
                        onClick={handleSave}
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        );
    }

    return <FormRenderer widget={widget} />;
};
