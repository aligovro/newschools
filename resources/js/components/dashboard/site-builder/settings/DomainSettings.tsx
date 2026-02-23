import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const getCsrfToken = (): string =>
    (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
        ?.content ?? '';

interface BegetDomain {
    id: number;
    fqdn: string;
    already_bound_to?: { site_id: number; site_name: string };
}

interface CurrentDomain {
    id: number;
    domain: string;
    custom_domain?: string | null;
    beget_domain_id?: number | null;
}

interface DomainStatusResponse {
    current_domain: CurrentDomain | null;
    beget: {
        available: boolean;
        message: string | null;
        hosting_mode?: boolean;
        domains: BegetDomain[];
    };
}

interface DomainSettingsProps {
    siteId: number;
    organizationId: number;
    domain?: CurrentDomain | null;
}

const domainApi = (
    organizationId: number,
    siteId: number,
): { status: string; custom: string; bind: string; unbind: string } => {
    const base = `/dashboard/organizations/${organizationId}/sites/${siteId}`;
    return {
        status: `${base}/domain`,
        custom: `${base}/domain/custom`,
        bind: `${base}/beget/bind`,
        unbind: `${base}/beget/unbind`,
    };
};

export const DomainSettings: React.FC<DomainSettingsProps> = React.memo(
    ({ siteId, organizationId, domain: initialDomain }) => {
        const api = useMemo(
            () => domainApi(organizationId, siteId),
            [organizationId, siteId],
        );

        const [status, setStatus] = useState<DomainStatusResponse | null>(null);
        const [loading, setLoading] = useState(true);
        const [actionLoading, setActionLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [selectedBegetId, setSelectedBegetId] = useState<string | null>(
            null,
        );
        const [customDomainInput, setCustomDomainInput] = useState('');
        const [customDomainError, setCustomDomainError] = useState<
            string | null
        >(null);

        const fetchStatus = useCallback(async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(api.status);
                const data: DomainStatusResponse = await res.json();
                setStatus(data);
                if (data.current_domain?.beget_domain_id) {
                    setSelectedBegetId(
                        String(data.current_domain.beget_domain_id),
                    );
                }
            } catch {
                setError('Ошибка загрузки данных домена');
            } finally {
                setLoading(false);
            }
        }, [api.status]);

        useEffect(() => {
            fetchStatus();
        }, [fetchStatus]);

        const current =
            status?.current_domain ?? (initialDomain ? { ...initialDomain } : null);
        const primary = current?.domain ?? null;
        const custom = current?.custom_domain ?? null;
        const displayDomain = custom || primary;
        const beget = status?.beget ?? {
            available: false,
            message: null,
            domains: [],
        };

        const request = useCallback(
            async (
                url: string,
                options: RequestInit,
            ): Promise<{ ok: boolean; data: Record<string, unknown> }> => {
                const res = await fetch(url, {
                    ...options,
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                        ...(options.headers as Record<string, string>),
                    },
                });
                const data = await res.json().catch(() => ({}));
                return { ok: res.ok, data };
            },
            [],
        );

        const handleBegetBind = useCallback(async () => {
            if (!selectedBegetId || !beget.domains.length) return;
            const selected = beget.domains.find(
                (d) => d.id.toString() === selectedBegetId,
            );
            if (!selected?.fqdn || selected.already_bound_to) return;

            setActionLoading(true);
            setError(null);
            const { ok, data } = await request(api.bind, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    beget_domain_id: parseInt(selectedBegetId, 10),
                    fqdn: selected.fqdn,
                }),
            });
            setActionLoading(false);
            if (ok) router.reload();
            else setError((data.message as string) ?? 'Ошибка привязки');
        }, [api.bind, beget.domains, selectedBegetId, request]);

        const handleBegetUnbind = useCallback(async () => {
            setActionLoading(true);
            setError(null);
            const { ok, data } = await request(api.unbind, { method: 'DELETE' });
            setActionLoading(false);
            if (ok) router.reload();
            else setError((data.message as string) ?? 'Ошибка отвязки');
        }, [api.unbind, request]);

        const handleCustomDomainSubmit = useCallback(async () => {
            const fqdn = customDomainInput.trim().toLowerCase();
            if (!fqdn) {
                setCustomDomainError('Введите домен');
                return;
            }
            setActionLoading(true);
            setCustomDomainError(null);
            setError(null);
            const { ok, data } = await request(api.custom, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ custom_domain: fqdn }),
            });
            setActionLoading(false);
            if (ok) {
                setCustomDomainInput('');
                router.reload();
            } else {
                const msg =
                    (data.message as string) ??
                    (data.errors as { custom_domain?: string[] })
                        ?.custom_domain?.[0];
                setCustomDomainError(msg ?? 'Ошибка сохранения');
            }
        }, [api.custom, customDomainInput, request]);

        if (loading) {
            return (
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Загрузка настроек домена…</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="rounded-lg border bg-card p-4">
                <div className="mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Домен сайта</h3>
                </div>

                {error && (
                    <p className="mb-4 text-sm text-destructive">{error}</p>
                )}

                {displayDomain && (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2">
                        <div className="text-sm">
                            <span className="font-medium">
                                Текущий домен: {displayDomain}
                            </span>
                            {primary && custom && primary !== custom && (
                                <span className="ml-1 text-muted-foreground">
                                    (основной: {primary})
                                </span>
                            )}
                        </div>
                        {current?.beget_domain_id && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBegetUnbind}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Отвязать от Beget'
                                )}
                            </Button>
                        )}
                    </div>
                )}

                {beget.available ? (
                    <div className="mb-6 space-y-2">
                        <Label>Привязать домен из Beget</Label>
                        <div className="flex flex-wrap gap-2">
                            <Select
                                value={selectedBegetId ?? ''}
                                onValueChange={setSelectedBegetId}
                                disabled={actionLoading}
                            >
                                <SelectTrigger className="min-w-[200px] flex-1">
                                    <SelectValue placeholder="Выберите домен" />
                                </SelectTrigger>
                                <SelectContent>
                                    {beget.domains.map((d) => {
                                        const bound = d.already_bound_to;
                                        const label = bound
                                            ? `${d.fqdn} (привязан к сайту «${bound.site_name}»)`
                                            : d.fqdn;
                                        return (
                                            <SelectItem
                                                key={d.id}
                                                value={d.id.toString()}
                                                disabled={!!bound}
                                            >
                                                {label}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleBegetBind}
                                disabled={
                                    actionLoading ||
                                    !selectedBegetId ||
                                    !beget.domains.length ||
                                    !!beget.domains.find(
                                        (d) =>
                                            d.id.toString() ===
                                                selectedBegetId &&
                                            d.already_bound_to,
                                    )
                                }
                            >
                                {actionLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Привязать'
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Домен из аккаунта Beget (VPS/хостинг). После
                            привязки сайт будет открываться по выбранному
                            домену.
                        </p>
                        {beget.hosting_mode === false && (
                            <p className="text-xs text-amber-600 dark:text-amber-500">
                                Режим VPS: привязка сохраняется только в нашей системе. Настройте nginx на сервере для этого домена вручную.
                            </p>
                        )}
                    </div>
                ) : (
                    beget.message && (
                        <p className="mb-4 text-xs text-muted-foreground">
                            {beget.message}
                        </p>
                    )
                )}

                <div className="space-y-2">
                    <Label>Дополнительный домен (поддомен)</Label>
                    <div className="flex flex-wrap gap-2">
                        <Input
                            type="text"
                            placeholder="например po500.shkolaplat.ru"
                            value={customDomainInput}
                            onChange={(e) => {
                                setCustomDomainInput(e.target.value);
                                setCustomDomainError(null);
                            }}
                            disabled={actionLoading}
                            className="min-w-[220px] flex-1"
                        />
                        <Button
                            onClick={handleCustomDomainSubmit}
                            disabled={actionLoading || !customDomainInput.trim()}
                        >
                            {actionLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Сохранить'
                            )}
                        </Button>
                    </div>
                    {customDomainError && (
                        <p className="text-xs text-destructive">
                            {customDomainError}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Поддомен или отдельный домен, настроенный на сервере
                        (DNS, nginx). Сайт будет открываться и по этому адресу.
                    </p>
                </div>
            </div>
        );
    },
);

DomainSettings.displayName = 'DomainSettings';
