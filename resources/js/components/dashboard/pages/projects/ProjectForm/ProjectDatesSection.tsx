import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import type { ProjectDatesSectionProps } from './types';

export function ProjectDatesSection({
    data,
    errors,
    onDataChange,
}: ProjectDatesSectionProps) {
    return (
        <div className="create-organization__section">
            <div className="create-organization__section-header">
                <Calendar className="create-organization__section-icon" />
                <h2 className="create-organization__section-title">
                    Даты проекта
                </h2>
            </div>
            <div className="create-organization__section-content">
                <div className="create-organization__field-group create-organization__field-group--two-columns">
                    <div className="create-organization__field">
                        <Label htmlFor="start_date">Дата начала</Label>
                        <Input
                            id="start_date"
                            type="date"
                            value={data.start_date || ''}
                            onChange={(e) =>
                                onDataChange(
                                    'start_date',
                                    e.target.value || null,
                                )
                            }
                            className={
                                errors.start_date ? 'border-red-500' : ''
                            }
                        />
                        {errors.start_date && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.start_date}
                            </p>
                        )}
                    </div>

                    <div className="create-organization__field">
                        <Label htmlFor="end_date">Дата окончания</Label>
                        <Input
                            id="end_date"
                            type="date"
                            value={data.end_date || ''}
                            onChange={(e) =>
                                onDataChange('end_date', e.target.value || null)
                            }
                            min={data.start_date || undefined}
                            className={errors.end_date ? 'border-red-500' : ''}
                        />
                        {errors.end_date && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.end_date}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
