import { memo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import UniversalSelect from '@/components/ui/universal-select/UniversalSelect';
import type { SelectOption } from '@/components/ui/universal-select/UniversalSelect';

interface SettingsSectionProps {
    isPublic: boolean;
    adminUserId: number | null;
    usersOptions: SelectOption[];
    usersLoading: boolean;
    usersHasMore: boolean;
    usersLoadingMore: boolean;
    usersSearch: string;
    onIsPublicChange: (checked: boolean) => void;
    onAdminUserIdChange: (id: number | null) => void;
    onUsersSearchChange: (query: string) => void;
    onUsersLoadMore: () => void;
}

export const SettingsSection = memo(function SettingsSection({
    isPublic,
    adminUserId,
    usersOptions,
    usersLoading,
    usersHasMore,
    usersLoadingMore,
    usersSearch,
    onIsPublicChange,
    onAdminUserIdChange,
    onUsersSearchChange,
    onUsersLoadMore,
}: SettingsSectionProps) {
    return (
        <>
            <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="is_public"
                        checked={!!isPublic}
                        onCheckedChange={(checked) =>
                            onIsPublicChange(!!checked)
                        }
                    />
                    <Label htmlFor="is_public">Публичная организация</Label>
                </div>
            </div>

            <div className="rounded-lg border bg-white p-4">
                <Label className="mb-2 block">Администратор</Label>
                <UniversalSelect
                    options={usersOptions}
                    value={adminUserId}
                    onChange={(value) =>
                        onAdminUserIdChange(value as number | null)
                    }
                    error={undefined}
                    label="Назначить администратора"
                    placeholder="Выберите пользователя"
                    searchable
                    clearable
                    loading={usersLoading}
                    hasMore={usersHasMore}
                    onLoadMore={onUsersLoadMore}
                    loadingMore={usersLoadingMore}
                    onSearch={onUsersSearchChange}
                    searchValue={usersSearch}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                    Администратор может быть назначен позже
                </p>
            </div>
        </>
    );
});

