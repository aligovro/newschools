import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

interface TerminologySettingsProps {
    terminology: any;
    raw: {
        organization: Record<string, string | null>;
        member: Record<string, string | null>;
        actions: Record<string, string | null>;
    };
}

export default function TerminologySettings({
    terminology,
    raw,
}: TerminologySettingsProps) {
    const { data, setData, put, processing } = useForm({
        // Organization
        org_singular_nominative: raw.organization.singular_nominative || '',
        org_singular_genitive: raw.organization.singular_genitive || '',
        org_singular_dative: raw.organization.singular_dative || '',
        org_singular_accusative: raw.organization.singular_accusative || '',
        org_singular_instrumental: raw.organization.singular_instrumental || '',
        org_singular_prepositional:
            raw.organization.singular_prepositional || '',
        org_plural_nominative: raw.organization.plural_nominative || '',
        org_plural_genitive: raw.organization.plural_genitive || '',
        org_plural_dative: raw.organization.plural_dative || '',
        org_plural_accusative: raw.organization.plural_accusative || '',
        org_plural_instrumental: raw.organization.plural_instrumental || '',
        org_plural_prepositional: raw.organization.plural_prepositional || '',
        // Member
        member_singular_nominative: raw.member.singular_nominative || '',
        member_singular_genitive: raw.member.singular_genitive || '',
        member_singular_dative: raw.member.singular_dative || '',
        member_singular_accusative: raw.member.singular_accusative || '',
        member_singular_instrumental: raw.member.singular_instrumental || '',
        member_singular_prepositional: raw.member.singular_prepositional || '',
        member_plural_nominative: raw.member.plural_nominative || '',
        member_plural_genitive: raw.member.plural_genitive || '',
        member_plural_dative: raw.member.plural_dative || '',
        member_plural_accusative: raw.member.plural_accusative || '',
        member_plural_instrumental: raw.member.plural_instrumental || '',
        member_plural_prepositional: raw.member.plural_prepositional || '',
        // Actions
        action_join: raw.actions.join || '',
        action_leave: raw.actions.leave || '',
        action_support: raw.actions.support || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/settings/terminology');
    };

    const renderField = (label: string, key: keyof typeof data) => (
        <div className="space-y-1">
            <label className="text-sm font-medium">{label}</label>
            <Input
                value={data[key] as string}
                onChange={(e) => setData(key, e.target.value)}
            />
        </div>
    );

    return (
        <AppLayout>
            <Head title="Терминология" />
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Организация</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        {renderField(
                            'Именительный (ед.)',
                            'org_singular_nominative',
                        )}
                        {renderField(
                            'Родительный (ед.)',
                            'org_singular_genitive',
                        )}
                        {renderField('Дательный (ед.)', 'org_singular_dative')}
                        {renderField(
                            'Винительный (ед.)',
                            'org_singular_accusative',
                        )}
                        {renderField(
                            'Творительный (ед.)',
                            'org_singular_instrumental',
                        )}
                        {renderField(
                            'Предложный (ед.)',
                            'org_singular_prepositional',
                        )}
                        {renderField(
                            'Именительный (мн.)',
                            'org_plural_nominative',
                        )}
                        {renderField(
                            'Родительный (мн.)',
                            'org_plural_genitive',
                        )}
                        {renderField('Дательный (мн.)', 'org_plural_dative')}
                        {renderField(
                            'Винительный (мн.)',
                            'org_plural_accusative',
                        )}
                        {renderField(
                            'Творительный (мн.)',
                            'org_plural_instrumental',
                        )}
                        {renderField(
                            'Предложный (мн.)',
                            'org_plural_prepositional',
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Участник</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        {renderField(
                            'Именительный (ед.)',
                            'member_singular_nominative',
                        )}
                        {renderField(
                            'Родительный (ед.)',
                            'member_singular_genitive',
                        )}
                        {renderField(
                            'Дательный (ед.)',
                            'member_singular_dative',
                        )}
                        {renderField(
                            'Винительный (ед.)',
                            'member_singular_accusative',
                        )}
                        {renderField(
                            'Творительный (ед.)',
                            'member_singular_instrumental',
                        )}
                        {renderField(
                            'Предложный (ед.)',
                            'member_singular_prepositional',
                        )}
                        {renderField(
                            'Именительный (мн.)',
                            'member_plural_nominative',
                        )}
                        {renderField(
                            'Родительный (мн.)',
                            'member_plural_genitive',
                        )}
                        {renderField('Дательный (мн.)', 'member_plural_dative')}
                        {renderField(
                            'Винительный (мн.)',
                            'member_plural_accusative',
                        )}
                        {renderField(
                            'Творительный (мн.)',
                            'member_plural_instrumental',
                        )}
                        {renderField(
                            'Предложный (мн.)',
                            'member_plural_prepositional',
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Действия</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                        {renderField('Присоединиться', 'action_join')}
                        {renderField('Покинуть', 'action_leave')}
                        {renderField('Поддержать', 'action_support')}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button disabled={processing} onClick={submit}>
                        Сохранить
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
