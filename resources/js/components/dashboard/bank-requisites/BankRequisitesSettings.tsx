import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Save, Building2 } from 'lucide-react';
import React, { useCallback, useState, useMemo, useEffect } from 'react';

export interface BankRequisitesData {
    // Структурированные поля
    recipient_name?: string | null;
    bank_name?: string | null;
    inn?: string | null;
    kpp?: string | null;
    bik?: string | null;
    account?: string | null;
    corr_account?: string | null;
    beneficiary_name?: string | null;
    ogrn?: string | null;
    address?: string | null;
    // Старые поля для обратной совместимости
    bank_requisites?: string | { text_reqs?: string } | null;
    sber_card?: string | null;
    tinkoff_card?: string | null;
    card_recipient?: string | null;
}

export interface BankRequisitesSettingsProps {
    /** Идентификатор сущности (organizationId, projectId или siteId) */
    entityId: number;
    /** Тип сущности */
    entityType: 'organization' | 'project' | 'site';
    /** Начальные значения реквизитов */
    initialRequisites?: BankRequisitesData | null;
    /** Реквизиты организации для отображения как fallback */
    organizationRequisites?: BankRequisitesData | null;
    /** Callback при успешном сохранении */
    onSaved?: (requisites: BankRequisitesData) => void;
    /** Показывать ли информацию о наследовании от организации */
    showInheritanceInfo?: boolean;
}

/**
 * Универсальный компонент для редактирования банковских реквизитов
 * Используется в настройках организации, проектов и сайтов
 */
export const BankRequisitesSettings: React.FC<BankRequisitesSettingsProps> = ({
    entityId,
    entityType,
    initialRequisites,
    organizationRequisites,
    onSaved,
    showInheritanceInfo = true,
}) => {
    // Нормализуем начальные значения
    const normalizeRequisites = useCallback((reqs: BankRequisitesData | null | undefined): BankRequisitesData => {
        if (!reqs) return {};
        
        // Если есть структурированные поля - используем их
        if (reqs.recipient_name || reqs.account || reqs.bik) {
            return {
                recipient_name: reqs.recipient_name || null,
                bank_name: reqs.bank_name || null,
                inn: reqs.inn || null,
                kpp: reqs.kpp || null,
                bik: reqs.bik || null,
                account: reqs.account || null,
                corr_account: reqs.corr_account || null,
                beneficiary_name: reqs.beneficiary_name || null,
                ogrn: reqs.ogrn || null,
                address: reqs.address || null,
                sber_card: reqs.sber_card || null,
                tinkoff_card: reqs.tinkoff_card || null,
                card_recipient: reqs.card_recipient || null,
            };
        }
        
        // Иначе парсим из текстового поля (для обратной совместимости)
        let textReqs = '';
        if (reqs.bank_requisites) {
            if (typeof reqs.bank_requisites === 'string') {
                textReqs = reqs.bank_requisites;
            } else if (typeof reqs.bank_requisites === 'object' && reqs.bank_requisites.text_reqs) {
                textReqs = reqs.bank_requisites.text_reqs;
            }
        }

        return {
            bank_requisites: textReqs || null,
            sber_card: reqs.sber_card || null,
            tinkoff_card: reqs.tinkoff_card || null,
            card_recipient: reqs.card_recipient || null,
        };
    }, []);

    const normalizedInitial = useMemo(() => normalizeRequisites(initialRequisites), [initialRequisites, normalizeRequisites]);
    
    const [requisites, setRequisites] = useState<BankRequisitesData>(normalizedInitial);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [success, setSuccess] = useState<string | null>(null);

    // Обновляем состояние при изменении initialRequisites
    useEffect(() => {
        const normalized = normalizeRequisites(initialRequisites);
        setRequisites(normalized);
    }, [initialRequisites, normalizeRequisites]);

    // Определяем, используются ли реквизиты организации (fallback)
    const isUsingOrganizationRequisites = useMemo(() => {
        if (entityType === 'organization' || !showInheritanceInfo) {
            return false;
        }
        
        const hasLocalRequisites = 
            requisites.recipient_name ||
            requisites.account ||
            requisites.bik ||
            requisites.bank_requisites ||
            requisites.sber_card ||
            requisites.tinkoff_card ||
            requisites.card_recipient;
        
        return !hasLocalRequisites && !!organizationRequisites;
    }, [requisites, organizationRequisites, entityType, showInheritanceInfo]);

    const updateField = useCallback((field: keyof BankRequisitesData, value: string | null) => {
        setRequisites((prev) => ({
            ...prev,
            [field]: value || null,
        }));
        setErrors([]);
        setSuccess(null);
    }, []);

    const saveRequisites = useCallback(async () => {
        setIsLoading(true);
        setErrors([]);
        setSuccess(null);

        try {
            // Для организации используем другой путь
            const url = entityType === 'organization' 
                ? `/api/organizations/${entityId}/bank-requisites`
                : `/api/${entityType}s/${entityId}/bank-requisites`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({
                    // Структурированные поля
                    recipient_name: requisites.recipient_name || null,
                    bank_name: requisites.bank_name || null,
                    inn: requisites.inn || null,
                    kpp: requisites.kpp || null,
                    bik: requisites.bik || null,
                    account: requisites.account || null,
                    corr_account: requisites.corr_account || null,
                    beneficiary_name: requisites.beneficiary_name || null,
                    ogrn: requisites.ogrn || null,
                    address: requisites.address || null,
                    // Старые поля для обратной совместимости
                    bank_requisites: requisites.bank_requisites || null,
                    sber_card: requisites.sber_card || null,
                    tinkoff_card: requisites.tinkoff_card || null,
                    card_recipient: requisites.card_recipient || null,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setErrors([
                    data.message || 'Ошибка при сохранении банковских реквизитов',
                ]);
                return;
            }

            setSuccess('Банковские реквизиты успешно сохранены');
            if (onSaved) {
                onSaved(requisites);
            }

            // Очищаем сообщение об успехе через 3 секунды
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error saving bank requisites:', error);
            setErrors(['Ошибка сети при сохранении банковских реквизитов']);
        } finally {
            setIsLoading(false);
        }
    }, [entityId, entityType, requisites, onSaved]);

    const displayRequisites = useMemo(() => {
        // Если есть локальные реквизиты - используем их
        if (requisites.bank_requisites || requisites.sber_card || requisites.tinkoff_card) {
            return requisites;
        }
        // Иначе показываем реквизиты организации для справки (только для чтения)
        return organizationRequisites || {};
    }, [requisites, organizationRequisites]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Банковские реквизиты для расчетного счета
                </CardTitle>
                <CardDescription>
                    Настройте банковские реквизиты для отображения в платежном виджете.
                    {entityType !== 'organization' && showInheritanceInfo && (
                        <span className="block mt-1 text-xs text-gray-500">
                            Если не указаны, будут использоваться реквизиты организации.
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isUsingOrganizationRequisites && (
                    <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                        <p className="text-sm text-blue-800">
                            Используются реквизиты организации. Заполните поля ниже, чтобы задать свои реквизиты.
                        </p>
                    </div>
                )}

                {errors.length > 0 && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3">
                        <ul className="space-y-1 text-sm text-red-600">
                            {errors.map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {success && (
                    <div className="rounded-md border border-green-200 bg-green-50 p-3">
                        <p className="text-sm text-green-800">{success}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="recipient_name">
                                        Получатель <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="recipient_name"
                                        type="text"
                                        value={requisites.recipient_name || ''}
                                        onChange={(e) => updateField('recipient_name', e.target.value)}
                                        placeholder="Название организации-получателя"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bank_name">
                                        Банк <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="bank_name"
                                        type="text"
                                        value={requisites.bank_name || ''}
                                        onChange={(e) => updateField('bank_name', e.target.value)}
                                        placeholder="Название банка"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="inn">
                                        ИНН <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="inn"
                                        type="text"
                                        value={requisites.inn || ''}
                                        onChange={(e) => updateField('inn', e.target.value.replace(/\D/g, ''))}
                                        placeholder="10 или 12 цифр"
                                        maxLength={12}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="kpp">КПП</Label>
                                    <Input
                                        id="kpp"
                                        type="text"
                                        value={requisites.kpp || ''}
                                        onChange={(e) => updateField('kpp', e.target.value.replace(/\D/g, ''))}
                                        placeholder="9 цифр"
                                        maxLength={9}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bik">
                                        БИК <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="bik"
                                        type="text"
                                        value={requisites.bik || ''}
                                        onChange={(e) => updateField('bik', e.target.value.replace(/\D/g, ''))}
                                        placeholder="9 цифр"
                                        maxLength={9}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="account">
                                        Расчетный счет <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="account"
                                        type="text"
                                        value={requisites.account || ''}
                                        onChange={(e) => updateField('account', e.target.value.replace(/\D/g, ''))}
                                        placeholder="20 цифр"
                                        maxLength={20}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="corr_account">Корреспондентский счет</Label>
                                    <Input
                                        id="corr_account"
                                        type="text"
                                        value={requisites.corr_account || ''}
                                        onChange={(e) => updateField('corr_account', e.target.value.replace(/\D/g, ''))}
                                        placeholder="20 цифр"
                                        maxLength={20}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="beneficiary_name">Благополучатель</Label>
                                <Input
                                    id="beneficiary_name"
                                    type="text"
                                    value={requisites.beneficiary_name || ''}
                                    onChange={(e) => updateField('beneficiary_name', e.target.value)}
                                    placeholder="Название благополучателя (если отличается от получателя)"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ogrn">ОГРН</Label>
                                    <Input
                                        id="ogrn"
                                        type="text"
                                        value={requisites.ogrn || ''}
                                        onChange={(e) => updateField('ogrn', e.target.value.replace(/\D/g, ''))}
                                        placeholder="13 или 15 цифр"
                                        maxLength={15}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Адрес</Label>
                                <Textarea
                                    id="address"
                                    value={requisites.address || ''}
                                    onChange={(e) => updateField('address', e.target.value)}
                                    placeholder="Почтовый адрес организации"
                                    rows={3}
                                    disabled={isLoading}
                                />
                            </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sber_card">Номер карты Сбербанка</Label>
                            <Input
                                id="sber_card"
                                type="text"
                                value={requisites.sber_card || ''}
                                onChange={(e) => updateField('sber_card', e.target.value)}
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tinkoff_card">Номер карты Тинькофф</Label>
                            <Input
                                id="tinkoff_card"
                                type="text"
                                value={requisites.tinkoff_card || ''}
                                onChange={(e) => updateField('tinkoff_card', e.target.value)}
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="card_recipient">Получатель для карт</Label>
                        <Input
                            id="card_recipient"
                            type="text"
                            value={requisites.card_recipient || ''}
                            onChange={(e) => updateField('card_recipient', e.target.value)}
                            placeholder="ФИО получателя"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500">
                            Имя получателя для переводов на карты. Будет отображаться во вкладке &quot;Перевод на карту&quot;.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        onClick={saveRequisites}
                        disabled={isLoading}
                        className="min-w-[140px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Сохранение...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Сохранить
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
