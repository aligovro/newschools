import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';
import type { FinancialInfoSectionProps } from './types';

export function FinancialInfoSection({
    data,
    errors,
    onDataChange,
}: FinancialInfoSectionProps) {
    return (
        <div className="create-organization__section">
            <div className="create-organization__section-header">
                <DollarSign className="create-organization__section-icon" />
                <h2 className="create-organization__section-title">
                    Финансовая информация
                </h2>
            </div>
            <div className="create-organization__section-content">
                <div className="create-organization__field-group">
                    <div className="create-organization__field">
                        <Label htmlFor="target_amount">
                            Целевая сумма (руб.)
                        </Label>
                        <Input
                            id="target_amount"
                            type="number"
                            step="0.01"
                            value={data.target_amount || ''}
                            onChange={(e) =>
                                onDataChange(
                                    'target_amount',
                                    e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                )
                            }
                            placeholder="Введите целевую сумму"
                            className={
                                errors.target_amount ? 'border-red-500' : ''
                            }
                        />
                        {errors.target_amount && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.target_amount}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
