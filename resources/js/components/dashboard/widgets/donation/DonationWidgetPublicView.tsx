import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ApiPaymentMethod, DonationPaymentData } from '@/lib/api/index';
import { AlertCircle, CheckCircle2, Heart, Loader2 } from 'lucide-react';
import { DonationPaymentModal } from './DonationPaymentModal';
import { DonationPaymentMethods } from './DonationPaymentMethods';
import { DonationProgressSection } from './DonationProgressSection';
import { DonationRecurringSection } from './DonationRecurringSection';
import type { DonationProgressData, DonationWidgetConfig } from './types';
import { CURRENCY_SYMBOLS } from './utils';

interface DonationPaymentModalState {
    visible: boolean;
    payment: DonationPaymentData | null;
    qrImageSrc: string | null;
    onClose: () => void;
}

interface DonationFormProps {
    amount: number;
    onAmountInputChange: (value: number) => void;
    onPresetAmountSelect: (value: number) => void;
    presetAmounts: number[];
    minAmount: number;
    maxAmount?: number;
    currency: 'RUB' | 'USD' | 'EUR';
    allowRecurring: boolean;
    recurringPeriods: string[];
    isRecurring: boolean;
    onRecurringChange: (value: boolean) => void;
    recurringPeriod: 'daily' | 'weekly' | 'monthly';
    onRecurringPeriodChange: (value: 'daily' | 'weekly' | 'monthly') => void;
    agreedToRecurring: boolean;
    onAgreedToRecurringChange: (value: boolean) => void;
    donorName: string;
    onDonorNameChange: (value: string) => void;
    donorEmail: string;
    onDonorEmailChange: (value: string) => void;
    donorPhone: string;
    onDonorPhoneChange: (value: string) => void;
    donorMessage: string;
    onDonorMessageChange: (value: string) => void;
    isAnonymous: boolean;
    onAnonymousChange: (value: boolean) => void;
    agreedToPolicy: boolean;
    onAgreedToPolicyChange: (value: boolean) => void;
    requireName: boolean;
    requireEmail: boolean;
    requirePhone: boolean;
    allowAnonymous: boolean;
    showMessageField: boolean;
    isProcessing: boolean;
    isSelectedMethodAvailable: boolean;
    error: string | null;
    success: string | null;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

interface DonationPaymentMethodsState {
    items: ApiPaymentMethod[];
    selectedMethod: string;
    onSelect: (slug: string) => void;
    isMerchantActive: boolean;
}

interface DonationWidgetPublicViewProps {
    config: DonationWidgetConfig;
    title: string;
    description?: string;
    showTitle: boolean;
    progressData: DonationProgressData | null;
    borderRadiusClass: string;
    shadowClass: string;
    buttonStyleClass: string;
    buttonText: string;
    paymentModal: DonationPaymentModalState;
    form: DonationFormProps;
    paymentMethods: DonationPaymentMethodsState;
}

export const DonationWidgetPublicView: React.FC<DonationWidgetPublicViewProps> =
    React.memo(
        ({
            borderRadiusClass,
            buttonStyleClass,
            buttonText,
            config,
            description,
            form,
            paymentMethods,
            paymentModal,
            progressData,
            shadowClass,
            showTitle,
            title,
        }) => {
            return (
                <>
                    <DonationPaymentModal
                        visible={paymentModal.visible}
                        payment={paymentModal.payment}
                        qrImageSrc={paymentModal.qrImageSrc}
                        onClose={paymentModal.onClose}
                    />
                    <div className={`donation-widget ${borderRadiusClass} ${shadowClass}`}>
                        <div className="p-6">
                            {(title && showTitle) || description ? (
                                <div className="donation-widget__header">
                                    {title && showTitle && (
                                        <h3 className="donation-widget__title">{title}</h3>
                                    )}
                                    {description && (
                                        <p className="text-sm text-gray-600">{description}</p>
                                    )}
                                </div>
                            ) : null}

                            <DonationProgressSection
                                progress={progressData}
                                showTargetAmount={config.show_target_amount ?? true}
                                showCollectedAmount={config.show_collected_amount ?? true}
                            />

                            <form onSubmit={form.onSubmit} className="space-y-4">
                                {!form.isAnonymous && form.requireName && (
                                    <div>
                                        <Label htmlFor="donor_name">Ваше имя</Label>
                                        <Input
                                            id="donor_name"
                                            value={form.donorName}
                                            onChange={(e) => form.onDonorNameChange(e.target.value)}
                                            placeholder="Александр"
                                            required={form.requireName}
                                        />
                                    </div>
                                )}

                                {form.requireEmail && (
                                    <div>
                                        <Label htmlFor="donor_email">Email</Label>
                                        <Input
                                            id="donor_email"
                                            type="email"
                                            value={form.donorEmail}
                                            onChange={(e) => form.onDonorEmailChange(e.target.value)}
                                            placeholder="example@mail.ru"
                                            required={form.requireEmail}
                                        />
                                    </div>
                                )}

                                {form.requirePhone && (
                                    <div>
                                        <Label htmlFor="donor_phone">Телефон</Label>
                                        <Input
                                            id="donor_phone"
                                            type="tel"
                                            value={form.donorPhone}
                                            onChange={(e) => form.onDonorPhoneChange(e.target.value)}
                                            placeholder="+7 (___) ___-__-__"
                                            required={form.requirePhone}
                                        />
                                    </div>
                                )}

                                {form.showMessageField && (
                                    <div>
                                        <Label htmlFor="donor_message">Комментарий</Label>
                                        <textarea
                                            id="donor_message"
                                            value={form.donorMessage}
                                            onChange={(e) => form.onDonorMessageChange(e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            placeholder="Сообщение для организации"
                                            rows={3}
                                        ></textarea>
                                    </div>
                                )}

                                {form.allowAnonymous && (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_anonymous"
                                            checked={form.isAnonymous}
                                            onCheckedChange={(checked) =>
                                                form.onAnonymousChange(checked as boolean)
                                            }
                                        />
                                        <Label htmlFor="is_anonymous" className="text-sm">
                                            Анонимное пожертвование
                                        </Label>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="amount">Сумма</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={form.amount}
                                        onChange={(e) =>
                                            form.onAmountInputChange(
                                                Number.parseInt(e.target.value, 10) || 0,
                                            )
                                        }
                                        min={form.minAmount}
                                        max={form.maxAmount || undefined}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {form.presetAmounts.map((presetAmount) => (
                                        <button
                                            key={presetAmount}
                                            type="button"
                                            onClick={() => form.onPresetAmountSelect(presetAmount)}
                                            className={`px-4 py-2 ${borderRadiusClass} border transition-colors ${
                                                form.amount === presetAmount
                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {presetAmount} {CURRENCY_SYMBOLS[form.currency]}
                                        </button>
                                    ))}
                                </div>

                                <DonationRecurringSection
                                    enabled={form.allowRecurring}
                                    isRecurring={form.isRecurring}
                                    onRecurringChange={form.onRecurringChange}
                                    recurringPeriod={form.recurringPeriod}
                                    onRecurringPeriodChange={form.onRecurringPeriodChange}
                                    recurringPeriods={form.recurringPeriods}
                                    agreedToRecurring={form.agreedToRecurring}
                                    onAgreedToRecurringChange={form.onAgreedToRecurringChange}
                                    amount={form.amount}
                                    currency={form.currency}
                                    borderRadiusClass={borderRadiusClass}
                                />

                                <DonationPaymentMethods
                                    methods={paymentMethods.items}
                                    selectedMethod={paymentMethods.selectedMethod}
                                    onSelect={paymentMethods.onSelect}
                                    borderRadiusClass={borderRadiusClass}
                                    isMerchantActive={paymentMethods.isMerchantActive}
                                />

                                <div className="flex items-start space-x-2 border-t pt-4">
                                    <Checkbox
                                        id="agreed_to_policy"
                                        checked={form.agreedToPolicy}
                                        onCheckedChange={(checked) =>
                                            form.onAgreedToPolicyChange(checked as boolean)
                                        }
                                        required
                                    />
                                    <Label
                                        htmlFor="agreed_to_policy"
                                        className="text-xs text-gray-600"
                                    >
                                        Принимаю{' '}
                                        <a
                                            href="/policy/"
                                            target="_blank"
                                            className="text-blue-600 underline"
                                        >
                                            условия обработки
                                        </a>{' '}
                                        персональных данных
                                    </Label>
                                </div>

                                {form.error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{form.error}</AlertDescription>
                                    </Alert>
                                )}
                                {form.success && (
                                    <Alert>
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="text-green-600">
                                            {form.success}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <button
                                    type="submit"
                                    disabled={form.isProcessing || !form.isSelectedMethodAvailable}
                                    className={`btn-accent w-full px-6 py-3 ${borderRadiusClass} flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyleClass || ''}`}
                                >
                                    {form.isProcessing ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Обработка...
                                        </>
                                    ) : (
                                        <>
                                            <Heart className="h-5 w-5" />
                                            {buttonText}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </>
            );
        },
    );

DonationWidgetPublicView.displayName = 'DonationWidgetPublicView';

