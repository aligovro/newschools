import SlugGenerator from '@/components/SlugGenerator';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link } from '@inertiajs/react';
import type { Organization } from '../types';

interface SettingsTabProps {
    organization: Organization;
    createErrors: Record<string, string>;
    createData: {
        name: string;
        slug: string;
        description: string;
        template: string;
    };
    setCreateData: (
        key: 'name' | 'slug' | 'description' | 'template',
        value: string,
    ) => void;
    isCreating: boolean;
}

export default function SettingsTab({
    organization,
    createErrors,
    createData,
    setCreateData,
    isCreating,
}: SettingsTabProps) {
    return (
        <div className="h-full overflow-auto bg-white p-6">
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="space-y-2">
                    <SlugGenerator
                        value={createData.slug}
                        onChange={(slug) => setCreateData('slug', slug)}
                        onNameChange={(name) => setCreateData('name', name)}
                        placeholder="Введите название сайта"
                        table="organization_sites"
                        column="slug"
                    />
                    {createErrors.name && (
                        <p className="text-sm text-red-500">
                            {createErrors.name}
                        </p>
                    )}
                    {createErrors.slug && (
                        <p className="text-sm text-red-500">
                            {createErrors.slug}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                        id="description"
                        value={createData.description}
                        onChange={(e) =>
                            setCreateData('description', e.target.value)
                        }
                        placeholder="Краткое описание сайта"
                        rows={3}
                        className={
                            createErrors.description ? 'border-red-500' : ''
                        }
                    />
                    {createErrors.description && (
                        <p className="text-sm text-red-500">
                            {createErrors.description}
                        </p>
                    )}
                </div>

                <input
                    type="hidden"
                    name="template"
                    value={createData.template}
                />

                <div className="flex items-center gap-3">
                    <Button
                        type="submit"
                        disabled={isCreating || !createData.name}
                    >
                        {isCreating ? 'Создание...' : 'Создать сайт'}
                    </Button>
                    <Link
                        href={`/dashboard/organization/${organization.id}/admin/sites`}
                    >
                        <Button type="button" variant="outline">
                            Отмена
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
