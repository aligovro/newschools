import type { WidgetData, WidgetPosition } from '@/components/dashboard/site-builder/types';
import RussianPhoneInput from '@/components/ui/RussianPhoneInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    siteAccountApi,
    type SiteAccountProfile,
    type DonationRow,
    type RecurringRow,
    type PaymentMethodRow,
} from '@/lib/api/siteAccount';
import MainLayout from '@/layouts/MainLayout';
import { apiClient } from '@/lib/api';
import { Copy, Loader2, User, CreditCard, Repeat, Wallet, UserPlus } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';

interface Site {
    id: number;
    name: string;
    slug: string;
    template: string;
    site_type: string;
    widgets_config: WidgetData[];
    custom_css?: string | null;
}

interface AccountPageProps {
    site: Site;
    positions: WidgetPosition[];
    position_settings?: Array<{ position_slug: string }>;
    section: string;
    organizationId: number;
}

const NAV_ITEMS = [
    { slug: 'personal', label: 'Личные данные', icon: User },
    { slug: 'payments', label: 'Моя помощь', icon: CreditCard },
    { slug: 'auto-payments', label: 'Автоплатежи', icon: Repeat },
    { slug: 'cards', label: 'Мои карты', icon: Wallet },
    { slug: 'invite', label: 'Пригласить друга', icon: UserPlus },
] as const;

function PaymentsSection({ organizationId }: { organizationId: number }) {
    const [data, setData] = useState<DonationRow[]>([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(
        async (page: number) => {
            setLoading(true);
            try {
                const res = await siteAccountApi.getPayments(organizationId, page);
                setData(res.data);
                setPagination(res.pagination);
            } catch {
                toast.error('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        },
        [organizationId],
    );

    useEffect(() => {
        void fetch(1);
    }, [fetch]);

    const loadPage = useCallback(
        (page: number) => {
            if (page >= 1 && page <= pagination.last_page) void fetch(page);
        },
        [fetch, pagination.last_page],
    );

    if (loading && data.length === 0) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <p>Пока нет пожертвований.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ul className="divide-y rounded-lg border">
                {data.map((d) => (
                    <li key={d.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                            <span className="font-medium">{d.amount_formatted}</span>
                            <span className="ml-2 text-sm text-muted-foreground">
                                {d.date_label} {d.paid_at} · {d.payment_method_label}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
            {pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.current_page <= 1}
                        onClick={() => loadPage(pagination.current_page - 1)}
                    >
                        Назад
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {pagination.current_page} / {pagination.last_page}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.current_page >= pagination.last_page}
                        onClick={() => loadPage(pagination.current_page + 1)}
                    >
                        Вперёд
                    </Button>
                </div>
            )}
        </div>
    );
}

function AutoPaymentsSection({ organizationId }: { organizationId: number }) {
    const [data, setData] = useState<RecurringRow[]>([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(
        async (page: number) => {
            setLoading(true);
            try {
                const res = await siteAccountApi.getAutoPayments(organizationId, page);
                setData(res.data);
                setPagination(res.pagination);
            } catch {
                toast.error('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        },
        [organizationId],
    );

    useEffect(() => {
        void fetch(1);
    }, [fetch]);

    const loadPage = useCallback(
        (page: number) => {
            if (page >= 1 && page <= pagination.last_page) void fetch(page);
        },
        [fetch, pagination.last_page],
    );

    if (loading && data.length === 0) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <p>У вас пока нет автоплатежей.</p>
                <p className="mt-2 text-sm">Оформите регулярное пожертвование на странице сбора.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ul className="divide-y rounded-lg border">
                {data.map((d, i) => (
                    <li key={i} className="flex items-center justify-between px-4 py-3">
                        <div>
                            <span className="font-medium">{d.donor_label}</span>
                            <span className="ml-2 text-sm text-muted-foreground">
                                {d.donations_count} {d.donations_count === 1 ? 'платёж' : 'платежей'} · {d.duration_label}
                            </span>
                        </div>
                        <span className="font-medium">{d.total_amount_formatted}</span>
                    </li>
                ))}
            </ul>
            {pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.current_page <= 1}
                        onClick={() => loadPage(pagination.current_page - 1)}
                    >
                        Назад
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {pagination.current_page} / {pagination.last_page}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.current_page >= pagination.last_page}
                        onClick={() => loadPage(pagination.current_page + 1)}
                    >
                        Вперёд
                    </Button>
                </div>
            )}
        </div>
    );
}

function CardsSection({ organizationId }: { organizationId: number }) {
    const [data, setData] = useState<PaymentMethodRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        siteAccountApi
            .getCards(organizationId)
            .then((res) => {
                if (!cancelled) setData(res.data);
            })
            .catch(() => {
                if (!cancelled) toast.error('Не удалось загрузить данные');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [organizationId]);

    if (loading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <p>Вы ещё не использовали способы оплаты для пожертвований.</p>
                <p className="mt-2 text-sm">При следующем пожертвовании вы сможете сохранить карту для автоплатежей.</p>
            </div>
        );
    }

    return (
        <ul className="divide-y rounded-lg border">
            {data.map((m) => (
                <li key={m.payment_method} className="flex items-center gap-3 px-4 py-3">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <span>{m.label}</span>
                </li>
            ))}
        </ul>
    );
}

function InviteSection({ organizationId }: { organizationId: number }) {
    const [referralUrl, setReferralUrl] = useState('');
    const [referralsCount, setReferralsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        siteAccountApi
            .getReferral(organizationId)
            .then((res) => {
                if (!cancelled) {
                    setReferralUrl(res.referral_url);
                    setReferralsCount(res.referrals_count);
                }
            })
            .catch(() => {
                if (!cancelled) toast.error('Не удалось загрузить данные');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [organizationId]);

    const copyLink = useCallback(() => {
        if (!referralUrl) return;
        navigator.clipboard.writeText(referralUrl).then(
            () => toast.success('Ссылка скопирована'),
            () => toast.error('Не удалось скопировать'),
        );
    }, [referralUrl]);

    if (loading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Поделитесь ссылкой с друзьями. Когда они зарегистрируются по ней, вы оба получите бонусы.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                    readOnly
                    value={referralUrl}
                    className="font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={copyLink} title="Скопировать">
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
            {referralsCount > 0 && (
                <p className="text-sm text-muted-foreground">
                    По вашей ссылке зарегистрировалось: {referralsCount}{' '}
                    {referralsCount === 1 ? 'человек' : referralsCount < 5 ? 'человека' : 'человек'}.
                </p>
            )}
        </div>
    );
}

export default function AccountPage({
    site,
    positions,
    position_settings = [],
    section,
    organizationId,
}: AccountPageProps) {
    const [profile, setProfile] = useState<SiteAccountProfile | null>(null);
    const [loading, setLoading] = useState(section === 'personal');
    const [saving, setSaving] = useState(false);
    const [regions, setRegions] = useState<Array<{ id: number; name: string }>>([]);

    const formState = useState({
        name: '',
        email: '',
        last_name: '',
        user_type: '',
        edu_year: '',
        region_id: null as number | null,
    });
    const [form, setForm] = formState;

    const fetchProfile = useCallback(async () => {
        if (organizationId <= 0) return;
        setLoading(true);
        try {
            const { data } = await siteAccountApi.getProfile(organizationId);
            setProfile(data);
            setForm((p) => ({
                ...p,
                name: data.user.name || '',
                email: data.user.email || '',
                last_name: data.profile.last_name || '',
                user_type: data.profile.user_type || '',
                edu_year: data.profile.edu_year || '',
                region_id: data.profile.region_id,
            }));
        } catch {
            toast.error('Не удалось загрузить профиль');
        } finally {
            setLoading(false);
        }
    }, [organizationId, setForm]);

    const fetchRegions = useCallback(async () => {
        try {
            const r = await apiClient.getAbsolute<{ regions: Array<{ id: number; name: string }> }>(
                '/api/regions',
            );
            setRegions(r.data?.regions ?? []);
        } catch {
            setRegions([]);
        }
    }, []);

    useEffect(() => {
        if (section === 'personal') {
            fetchProfile();
            fetchRegions();
        }
    }, [section, fetchProfile, fetchRegions]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (organizationId <= 0) return;
            setSaving(true);
            try {
                const { data } = await siteAccountApi.updateProfile(organizationId, {
                    name: form.name,
                    email: form.email || null,
                    last_name: form.last_name || null,
                    user_type: form.user_type || null,
                    edu_year: form.edu_year || null,
                    region_id: form.region_id,
                });
                setProfile(data);
                toast.success('Профиль сохранён');
            } catch (err: unknown) {
                const msg =
                    (err as { response?: { data?: { message?: string } } })?.response?.data
                        ?.message || 'Ошибка сохранения';
                toast.error(msg);
            } finally {
                setSaving(false);
            }
        },
        [organizationId, form],
    );

    const showEduYear = form.user_type === 'graduate';
    const userTypeLabels = useMemo(
        () => profile?.user_type_labels ?? { graduate: 'Выпускник', friend: 'Друг лицея', parent: 'Родитель' },
        [profile?.user_type_labels],
    );

    const navContent = useMemo(
        () => (
            <nav className="space-y-1">
                {NAV_ITEMS.map(({ slug, label, icon: Icon }) => (
                    <Link
                        key={slug}
                        href={`/my-account/${slug}`}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                            section === slug
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                    </Link>
                ))}
            </nav>
        ),
        [section],
    );

    const mainContent = useMemo(() => {
        if (section === 'personal') {
            if (loading) {
                return (
                    <div className="flex min-h-[200px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                );
            }
            return (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Имя</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                placeholder="Иван"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Фамилия</Label>
                            <Input
                                id="last_name"
                                value={form.last_name}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, last_name: e.target.value }))
                                }
                                placeholder="Иванов"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Номер телефона</Label>
                        <RussianPhoneInput
                            value={profile?.user.phone ?? ''}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            Телефон изменяется в настройках аккаунта
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Электронная почта</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                            placeholder="example@mail.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="user_type">Тип участия</Label>
                        <Select
                            value={form.user_type || ''}
                            onValueChange={(v) =>
                                setForm((p) => ({ ...p, user_type: v, edu_year: v === 'graduate' ? p.edu_year : '' }))
                            }
                        >
                            <SelectTrigger id="user_type">
                                <SelectValue placeholder="Выбрать" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(userTypeLabels).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>
                                        {v}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {showEduYear && (
                        <div className="space-y-2">
                            <Label htmlFor="edu_year">Год выпуска</Label>
                            <Input
                                id="edu_year"
                                type="number"
                                min={1950}
                                max={2025}
                                value={form.edu_year}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, edu_year: e.target.value }))
                                }
                                placeholder="1990–2024"
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="region">Регион</Label>
                        <Select
                            value={form.region_id?.toString() ?? ''}
                            onValueChange={(v) =>
                                setForm((p) => ({
                                    ...p,
                                    region_id: v ? parseInt(v, 10) : null,
                                }))
                            }
                        >
                            <SelectTrigger id="region">
                                <SelectValue placeholder="Выбрать" />
                            </SelectTrigger>
                            <SelectContent>
                                {regions.map((r) => (
                                    <SelectItem key={r.id} value={r.id.toString()}>
                                        {r.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Сохранить
                    </Button>
                </form>
            );
        }

        if (section === 'payments') {
            return (
                <PaymentsSection organizationId={organizationId} />
            );
        }
        if (section === 'auto-payments') {
            return (
                <AutoPaymentsSection organizationId={organizationId} />
            );
        }
        if (section === 'cards') {
            return (
                <CardsSection organizationId={organizationId} />
            );
        }
        if (section === 'invite') {
            return (
                <InviteSection organizationId={organizationId} />
            );
        }

        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <p>Раздел «{NAV_ITEMS.find((i) => i.slug === section)?.label ?? section}» в разработке.</p>
            </div>
        );
    }, [
        section,
        loading,
        form,
        profile,
        userTypeLabels,
        showEduYear,
        regions,
        handleSubmit,
        saving,
        organizationId,
    ]);

    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            pageTitle={`Личный кабинет — ${site.name}`}
        >
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-6 text-2xl font-semibold">Личный кабинет</h1>
                <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
                    <aside className="shrink-0">{navContent}</aside>
                    <main>{mainContent}</main>
                </div>
            </div>
        </MainLayout>
    );
}
