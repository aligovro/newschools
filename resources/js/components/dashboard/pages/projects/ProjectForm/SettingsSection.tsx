import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tag } from 'lucide-react';
import type { SettingsSectionProps } from './types';

export function SettingsSection({ data, onDataChange }: SettingsSectionProps) {
    return (
        <div className="create-organization__section">
            <div className="create-organization__section-header">
                <Tag className="create-organization__section-icon" />
                <h2 className="create-organization__section-title">
                    Настройки
                </h2>
            </div>
            <div className="create-organization__section-content">
                <div className="create-organization__checkbox-group">
                    <Checkbox
                        id="featured"
                        checked={data.featured}
                        onCheckedChange={(checked) =>
                            onDataChange('featured', !!checked)
                        }
                    />
                    <Label
                        htmlFor="featured"
                        className="create-organization__checkbox-label"
                    >
                        Рекомендуемый проект
                    </Label>
                </div>
            </div>
        </div>
    );
}
