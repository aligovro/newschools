import React, { useCallback, useState } from 'react';
import { FormAction, FormActionConfig } from './types';

interface FormActionsManagerProps {
    actions: FormAction[];
    onActionsChange: (actions: FormAction[]) => void;
}

export const FormActionsManager: React.FC<FormActionsManagerProps> = ({
    actions,
    onActionsChange,
}) => {
    const [selectedAction, setSelectedAction] = useState<FormAction | null>(
        null,
    );
    const [isAddingAction, setIsAddingAction] = useState(false);

    const actionTypes = [
        {
            type: 'email',
            label: 'Email уведомление',
            description: 'Отправка данных формы на email',
            icon: '📧',
        },
        {
            type: 'webhook',
            label: 'Webhook',
            description: 'Отправка данных на внешний URL',
            icon: '🔗',
        },
        {
            type: 'database',
            label: 'База данных',
            description: 'Сохранение данных в таблицу БД',
            icon: '💾',
        },
        {
            type: 'telegram',
            label: 'Telegram',
            description: 'Отправка уведомления в Telegram',
            icon: '📱',
        },
        {
            type: 'custom',
            label: 'Кастомный экшен',
            description: 'Выполнение PHP кода',
            icon: '⚙️',
        },
    ];

    const handleAddAction = useCallback(
        (actionType: string) => {
            const newAction: FormAction = {
                id: Date.now().toString(),
                form_widget_id: 0, // Будет установлен при сохранении
                name: `Новый ${actionTypes.find((t) => t.type === actionType)?.label}`,
                type: actionType as any,
                config: getDefaultConfig(actionType),
                is_active: true,
                sort_order: actions.length + 1,
            };

            const updatedActions = [...actions, newAction];
            onActionsChange(updatedActions);
            setSelectedAction(newAction);
            setIsAddingAction(false);
        },
        [actions, onActionsChange],
    );

    const handleUpdateAction = useCallback(
        (updatedAction: FormAction) => {
            const updatedActions = actions.map((action) =>
                action.id === updatedAction.id ? updatedAction : action,
            );
            onActionsChange(updatedActions);
            setSelectedAction(updatedAction);
        },
        [actions, onActionsChange],
    );

    const handleDeleteAction = useCallback(
        (actionId: string) => {
            const updatedActions = actions.filter(
                (action) => action.id !== actionId,
            );
            onActionsChange(updatedActions);
            setSelectedAction(null);
        },
        [actions, onActionsChange],
    );

    const handleMoveAction = useCallback(
        (actionId: string, direction: 'up' | 'down') => {
            const actionIndex = actions.findIndex(
                (action) => action.id === actionId,
            );
            if (actionIndex === -1) return;

            const newIndex =
                direction === 'up' ? actionIndex - 1 : actionIndex + 1;
            if (newIndex < 0 || newIndex >= actions.length) return;

            const updatedActions = [...actions];
            [updatedActions[actionIndex], updatedActions[newIndex]] = [
                updatedActions[newIndex],
                updatedActions[actionIndex],
            ];

            // Обновляем sort_order
            updatedActions.forEach((action, index) => {
                action.sort_order = index + 1;
            });

            onActionsChange(updatedActions);
        },
        [actions, onActionsChange],
    );

    const getDefaultConfig = (actionType: string): FormActionConfig => {
        switch (actionType) {
            case 'email':
                return {
                    to: [],
                    subject: 'Новая отправка формы',
                    template: 'emails.form-submission',
                };
            case 'webhook':
                return {
                    url: '',
                    method: 'POST',
                    headers: {},
                    timeout: 30,
                };
            case 'database':
                return {
                    table: 'form_submissions_data',
                    mapping: {},
                    additional_fields: {},
                };
            case 'telegram':
                return {
                    bot_token: '',
                    chat_id: '',
                    message: 'Новая отправка формы: {form_name}',
                    parse_mode: 'HTML',
                };
            case 'custom':
                return {
                    class: '',
                    method: 'execute',
                    parameters: {},
                };
            default:
                return {};
        }
    };

    return (
        <div className="form-actions-manager">
            <div className="form-actions-manager__header">
                <h3>Экшены формы</h3>
                <button
                    className="form-actions-manager__add-btn"
                    onClick={() => setIsAddingAction(true)}
                >
                    + Добавить экшен
                </button>
            </div>

            <div className="form-actions-manager__content">
                <div className="form-actions-manager__list">
                    {actions.length === 0 ? (
                        <div className="form-actions-manager__empty">
                            <p>Экшены не настроены</p>
                            <p className="form-actions-manager__empty-hint">
                                Добавьте экшен для обработки отправленных данных
                            </p>
                        </div>
                    ) : (
                        <div className="form-actions-manager__items">
                            {actions
                                .sort((a, b) => a.sort_order - b.sort_order)
                                .map((action) => (
                                    <div
                                        key={action.id}
                                        className={`form-actions-manager__item ${
                                            selectedAction?.id === action.id
                                                ? 'selected'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setSelectedAction(action)
                                        }
                                    >
                                        <div className="form-actions-manager__item-header">
                                            <div className="form-actions-manager__item-info">
                                                <span className="form-actions-manager__item-icon">
                                                    {
                                                        actionTypes.find(
                                                            (t) =>
                                                                t.type ===
                                                                action.type,
                                                        )?.icon
                                                    }
                                                </span>
                                                <div className="form-actions-manager__item-details">
                                                    <div className="form-actions-manager__item-name">
                                                        {action.name}
                                                    </div>
                                                    <div className="form-actions-manager__item-type">
                                                        {
                                                            actionTypes.find(
                                                                (t) =>
                                                                    t.type ===
                                                                    action.type,
                                                            )?.label
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-actions-manager__item-actions">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMoveAction(
                                                            action.id,
                                                            'up',
                                                        );
                                                    }}
                                                    disabled={
                                                        action.sort_order === 1
                                                    }
                                                    title="Переместить вверх"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMoveAction(
                                                            action.id,
                                                            'down',
                                                        );
                                                    }}
                                                    disabled={
                                                        action.sort_order ===
                                                        actions.length
                                                    }
                                                    title="Переместить вниз"
                                                >
                                                    ↓
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteAction(
                                                            action.id,
                                                        );
                                                    }}
                                                    title="Удалить экшен"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                        <div className="form-actions-manager__item-status">
                                            <span
                                                className={`form-actions-manager__status-badge ${
                                                    action.is_active
                                                        ? 'active'
                                                        : 'inactive'
                                                }`}
                                            >
                                                {action.is_active
                                                    ? 'Активен'
                                                    : 'Неактивен'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className="form-actions-manager__editor">
                    {isAddingAction && (
                        <div className="form-actions-manager__type-selector">
                            <h4>Выберите тип экшена</h4>
                            <div className="form-actions-manager__types">
                                {actionTypes.map((actionType) => (
                                    <button
                                        key={actionType.type}
                                        className="form-actions-manager__type-btn"
                                        onClick={() =>
                                            handleAddAction(actionType.type)
                                        }
                                    >
                                        <span className="form-actions-manager__type-icon">
                                            {actionType.icon}
                                        </span>
                                        <div className="form-actions-manager__type-info">
                                            <div className="form-actions-manager__type-label">
                                                {actionType.label}
                                            </div>
                                            <div className="form-actions-manager__type-description">
                                                {actionType.description}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <button
                                className="form-actions-manager__cancel-btn"
                                onClick={() => setIsAddingAction(false)}
                            >
                                Отмена
                            </button>
                        </div>
                    )}

                    {selectedAction && !isAddingAction && (
                        <FormActionEditor
                            action={selectedAction}
                            onUpdateAction={handleUpdateAction}
                        />
                    )}

                    {!selectedAction && !isAddingAction && (
                        <div className="form-actions-manager__placeholder">
                            <p>
                                Выберите экшен для редактирования или добавьте
                                новый
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Компонент для редактирования отдельного экшена
interface FormActionEditorProps {
    action: FormAction;
    onUpdateAction: (action: FormAction) => void;
}

const FormActionEditor: React.FC<FormActionEditorProps> = ({
    action,
    onUpdateAction,
}) => {
    const [localAction, setLocalAction] = useState<FormAction>(action);

    const handleFieldChange = (field: keyof FormAction, value: any) => {
        const updatedAction = {
            ...localAction,
            [field]: value,
        };
        setLocalAction(updatedAction);
        onUpdateAction(updatedAction);
    };

    const handleConfigChange = (config: FormActionConfig) => {
        const updatedAction = {
            ...localAction,
            config,
        };
        setLocalAction(updatedAction);
        onUpdateAction(updatedAction);
    };

    return (
        <div className="form-action-editor">
            <div className="form-action-editor__header">
                <h4>Редактирование экшена</h4>
                <span className="form-action-editor__type">{action.type}</span>
            </div>

            <div className="form-action-editor__content">
                <div className="form-action-editor__field">
                    <label>Название экшена</label>
                    <input
                        type="text"
                        value={localAction.name}
                        onChange={(e) =>
                            handleFieldChange('name', e.target.value)
                        }
                    />
                </div>

                <div className="form-action-editor__field">
                    <label>
                        <input
                            type="checkbox"
                            checked={localAction.is_active}
                            onChange={(e) =>
                                handleFieldChange('is_active', e.target.checked)
                            }
                        />
                        Активен
                    </label>
                </div>

                <div className="form-action-editor__config">
                    <h5>Конфигурация</h5>
                    <ActionConfigEditor
                        actionType={action.type}
                        config={localAction.config}
                        onConfigChange={handleConfigChange}
                    />
                </div>
            </div>
        </div>
    );
};

// Компонент для редактирования конфигурации экшена
interface ActionConfigEditorProps {
    actionType: string;
    config: FormActionConfig;
    onConfigChange: (config: FormActionConfig) => void;
}

const ActionConfigEditor: React.FC<ActionConfigEditorProps> = ({
    actionType,
    config,
    onConfigChange,
}) => {
    const handleConfigFieldChange = (field: string, value: any) => {
        onConfigChange({
            ...config,
            [field]: value,
        });
    };

    switch (actionType) {
        case 'email':
            return (
                <div className="action-config-editor">
                    <div className="action-config-editor__field">
                        <label>Получатели (через запятую)</label>
                        <input
                            type="text"
                            value={
                                Array.isArray(config.to)
                                    ? config.to.join(', ')
                                    : ''
                            }
                            onChange={(e) =>
                                handleConfigFieldChange(
                                    'to',
                                    e.target.value
                                        .split(',')
                                        .map((email) => email.trim()),
                                )
                            }
                            placeholder="admin@example.com, manager@example.com"
                        />
                    </div>
                    <div className="action-config-editor__field">
                        <label>Тема письма</label>
                        <input
                            type="text"
                            value={config.subject || ''}
                            onChange={(e) =>
                                handleConfigFieldChange(
                                    'subject',
                                    e.target.value,
                                )
                            }
                        />
                    </div>
                </div>
            );

        case 'webhook':
            return (
                <div className="action-config-editor">
                    <div className="action-config-editor__field">
                        <label>URL</label>
                        <input
                            type="url"
                            value={config.url || ''}
                            onChange={(e) =>
                                handleConfigFieldChange('url', e.target.value)
                            }
                            placeholder="https://example.com/webhook"
                        />
                    </div>
                    <div className="action-config-editor__field">
                        <label>Метод</label>
                        <select
                            value={config.method || 'POST'}
                            onChange={(e) =>
                                handleConfigFieldChange(
                                    'method',
                                    e.target.value,
                                )
                            }
                        >
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="PATCH">PATCH</option>
                        </select>
                    </div>
                    <div className="action-config-editor__field">
                        <label>Таймаут (секунды)</label>
                        <input
                            type="number"
                            value={config.timeout || 30}
                            onChange={(e) =>
                                handleConfigFieldChange(
                                    'timeout',
                                    parseInt(e.target.value),
                                )
                            }
                        />
                    </div>
                </div>
            );

        case 'database':
            return (
                <div className="action-config-editor">
                    <div className="action-config-editor__field">
                        <label>Таблица</label>
                        <input
                            type="text"
                            value={config.table || ''}
                            onChange={(e) =>
                                handleConfigFieldChange('table', e.target.value)
                            }
                            placeholder="form_submissions_data"
                        />
                    </div>
                </div>
            );

        case 'telegram':
            return (
                <div className="action-config-editor">
                    <div className="action-config-editor__field">
                        <label>Токен бота</label>
                        <input
                            type="text"
                            value={config.bot_token || ''}
                            onChange={(e) =>
                                handleConfigFieldChange(
                                    'bot_token',
                                    e.target.value,
                                )
                            }
                            placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                        />
                    </div>
                    <div className="action-config-editor__field">
                        <label>ID чата</label>
                        <input
                            type="text"
                            value={config.chat_id || ''}
                            onChange={(e) =>
                                handleConfigFieldChange(
                                    'chat_id',
                                    e.target.value,
                                )
                            }
                            placeholder="-1001234567890"
                        />
                    </div>
                    <div className="action-config-editor__field">
                        <label>Сообщение</label>
                        <textarea
                            value={config.message || ''}
                            onChange={(e) =>
                                handleConfigFieldChange(
                                    'message',
                                    e.target.value,
                                )
                            }
                            rows={3}
                            placeholder="Новая отправка формы: {form_name}"
                        />
                    </div>
                </div>
            );

        case 'custom':
            return (
                <div className="action-config-editor">
                    <div className="action-config-editor__field">
                        <label>Класс PHP</label>
                        <input
                            type="text"
                            value={config.class || ''}
                            onChange={(e) =>
                                handleConfigFieldChange('class', e.target.value)
                            }
                            placeholder="App\Services\CustomFormAction"
                        />
                    </div>
                    <div className="action-config-editor__field">
                        <label>Метод</label>
                        <input
                            type="text"
                            value={config.method || 'execute'}
                            onChange={(e) =>
                                handleConfigFieldChange(
                                    'method',
                                    e.target.value,
                                )
                            }
                        />
                    </div>
                </div>
            );

        default:
            return <div>Неизвестный тип экшена</div>;
    }
};
