import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Globe, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface BegetDomain {
    id: number;
    fqdn: string;
}

interface DomainSettingsProps {
    siteId: number;
    organizationId: number;
    domain?: {
        id: number;
        domain: string;
        custom_domain?: string;
        beget_domain_id?: number;
    } | null;
}

export const DomainSettings: React.FC<DomainSettingsProps> = ({
    siteId,
    organizationId,
    domain,
}) => {
    const [begetDomains, setBegetDomains] = useState<BegetDomain[]>([]);
    const [loading, setLoading] = useState(false);
    const [binding, setBinding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDomainId, setSelectedDomainId] = useState<string | null>(
        domain?.beget_domain_id?.toString() ?? null,
    );

    const fetchDomains = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `/dashboard/organizations/${organizationId}/sites/${siteId}/beget/domains`,
            );
            const data = await res.json();

            if (data.available && Array.isArray(data.domains)) {
                setBegetDomains(data.domains);
            } else {
                setError(data.message || 'Beget API недоступен');
            }
        } catch {
            setError('Ошибка загрузки доменов');
        } finally {
            setLoading(false);
        }
    }, [organizationId, siteId]);

    useEffect(() => {
        fetchDomains();
    }, [fetchDomains]);

    const handleBind = async () => {
        if (!selectedDomainId) return;
        const selected = begetDomains.find(
            (d) => d.id.toString() === selectedDomainId,
        );
        if (!selected) return;

        setBinding(true);
        setError(null);
        try {
            const res = await fetch(
                `/dashboard/organizations/${organizationId}/sites/${siteId}/beget/bind`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        beget_domain_id: parseInt(selectedDomainId, 10),
                        fqdn: selected.fqdn,
                    }),
                },
            );
            const data = await res.json();

            if (res.ok) {
                router.reload();
            } else {
                setError(data.message || 'Ошибка привязки');
            }
        } catch {
            setError('Ошибка привязки домена');
        } finally {
            setBinding(false);
        }
    };

    const handleUnbind = async () => {
        setBinding(true);
        setError(null);
        try {
            const res = await fetch(
                `/dashboard/organizations/${organizationId}/sites/${siteId}/beget/unbind`,
                {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                        Accept: 'application/json',
                    },
                },
            );

            if (res.ok) {
                router.reload();
            } else {
                const data = await res.json();
                setError(data.message || 'Ошибка отвязки');
            }
        } catch {
            setError('Ошибка отвязки домена');
        } finally {
            setBinding(false);
        }
    };

    const currentDomain = domain?.custom_domain || domain?.domain;

    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Домен (Beget)</h3>
            </div>

            {error && (
                <p className="mb-4 text-sm text-destructive">{error}</p>
            )}

            {currentDomain && (
                <div className="mb-4 flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                    <span className="text-sm font-medium">
                        Текущий домен: {currentDomain}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUnbind}
                        disabled={binding || !begetDomains.length}
                    >
                        {binding ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            'Отвязать'
                        )}
                    </Button>
                </div>
            )}

            <div className="space-y-2">
                <Label>Привязать домен из Beget</Label>
                <div className="flex gap-2">
                    <Select
                        value={selectedDomainId ?? ''}
                        onValueChange={setSelectedDomainId}
                        disabled={loading}
                    >
                        <SelectTrigger className="flex-1">
                            <SelectValue
                                placeholder={
                                    loading
                                        ? 'Загрузка...'
                                        : 'Выберите домен'
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {begetDomains.map((d) => (
                                <SelectItem
                                    key={d.id}
                                    value={d.id.toString()}
                                >
                                    {d.fqdn}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={handleBind}
                        disabled={
                            binding ||
                            loading ||
                            !selectedDomainId ||
                            !begetDomains.length
                        }
                    >
                        {binding ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            'Привязать'
                        )}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Домен должен быть в вашем аккаунте Beget. После привязки
                    сайт будет открываться по выбранному домену.
                </p>
            </div>
        </div>
    );
};
