import React from 'react';
import {
    DonationItem,
    DonationsListOutputConfig,
    WidgetOutputProps,
} from './types';

export const DonationsListOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as DonationsListOutputConfig;

    const {
        title = 'Последние пожертвования',
        show_title = true, // По умолчанию true для обратной совместимости
        subtitle = '',
        donations = [],
        limit = 10,
        showAmount = true,
        showDate = true,
        showMessage = true,
        showDonorName = true,
    } = config;

    const displayDonations = limit > 0 ? donations.slice(0, limit) : donations;

    if (!donations || donations.length === 0) {
        return (
            <div
                className={`donations-list-output donations-list-output--empty ${className || ''}`}
                style={style}
            >
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">
                        Пожертвования не найдены
                    </span>
                </div>
            </div>
        );
    }

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const renderDonation = (donation: DonationItem, index: number) => {
        return (
            <div
                key={donation.id}
                className="donation-item flex items-center space-x-4 rounded-lg bg-white p-4 shadow-sm"
            >
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {donation.isAnonymous ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                            <svg
                                className="h-5 w-5 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-600">
                            {donation.donorName
                                ? getInitials(donation.donorName)
                                : '?'}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            {showDonorName &&
                                !donation.isAnonymous &&
                                donation.donorName && (
                                    <p className="truncate text-sm font-medium text-gray-900">
                                        {donation.donorName}
                                    </p>
                                )}
                            {donation.isAnonymous && (
                                <p className="text-sm font-medium text-gray-500">
                                    Анонимный донор
                                </p>
                            )}
                            {showDate && (
                                <p className="text-xs text-gray-500">
                                    {formatDate(donation.date)}
                                </p>
                            )}
                        </div>
                        {showAmount && (
                            <div className="ml-4 flex-shrink-0">
                                <p className="text-lg font-semibold text-green-600">
                                    {formatCurrency(
                                        donation.amount,
                                        donation.currency,
                                    )}
                                </p>
                            </div>
                        )}
                    </div>

                    {showMessage && donation.message && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                            "{donation.message}"
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div
            className={`donations-list-output ${className || ''}`}
            style={style}
        >
            {title && show_title && (
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    {title}
                </h2>
            )}

            {subtitle && <p className="mb-6 text-gray-600">{subtitle}</p>}

            <div className="space-y-3">
                {displayDonations.map((donation, index) =>
                    renderDonation(donation, index),
                )}
            </div>

            {donations.length > limit && limit > 0 && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                        Показано {limit} из {donations.length} пожертвований
                    </p>
                </div>
            )}
        </div>
    );
};
