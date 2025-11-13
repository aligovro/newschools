import React from 'react';
import { formatCurrency } from '@/lib/helpers';
import type { DonationProgressData } from './types';

interface DonationProgressSectionProps {
    progress: DonationProgressData | null;
    showTargetAmount: boolean;
    showCollectedAmount: boolean;
}

export const DonationProgressSection: React.FC<DonationProgressSectionProps> =
    React.memo(({ progress, showCollectedAmount, showTargetAmount }) => {
        if (!progress) {
            return null;
        }

        return (
            <div className="organization-donation-info mb-6 space-y-3">
                {(showTargetAmount || showCollectedAmount) && (
                    <div className="organization-donation-labels flex justify-between text-xs uppercase tracking-wide text-gray-500">
                        {showTargetAmount && <span>{progress.labelTarget}</span>}
                        {showCollectedAmount && <span>{progress.labelCollected}</span>}
                    </div>
                )}
                <div className="organization-donation-progress-wrapper">
                    <div className="organization-donation-progress-bar relative h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                            className="organization-donation-progress-fill absolute left-0 top-0 h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                        ></div>
                    </div>
                </div>
                <div className="organization-donation-amounts flex justify-between text-sm font-semibold">
                    {showTargetAmount && (
                        <span className="organization-donation-target text-gray-800">
                            {formatCurrency(progress.targetAmount, progress.currency)}
                        </span>
                    )}
                    {showCollectedAmount && (
                        <span className="organization-donation-collected text-blue-600">
                            {formatCurrency(progress.collectedAmount, progress.currency)}
                        </span>
                    )}
                </div>
            </div>
        );
    });

DonationProgressSection.displayName = 'DonationProgressSection';

