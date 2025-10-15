import React from 'react';
import { ReferralLeaderboardOutputConfig, WidgetOutputProps } from './types';

export const ReferralLeaderboardOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as ReferralLeaderboardOutputConfig;

    const {
        title = 'Лидеры по приглашениям',
        subtitle = '',
        leaderboard = [],
        limit = 10,
        showRank = true,
        showAvatar = true,
    } = config;

    const displayLeaderboard =
        limit > 0 ? leaderboard.slice(0, limit) : leaderboard;

    if (!leaderboard || leaderboard.length === 0) {
        return (
            <div
                className={`referral-leaderboard-output referral-leaderboard-output--empty ${className || ''}`}
                style={style}
            >
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">
                        Таблица лидеров не настроена
                    </span>
                </div>
            </div>
        );
    }

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                        <svg
                            className="h-5 w-5 text-yellow-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15V9h4v6H8z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                );
            case 2:
                return (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                        <svg
                            className="h-5 w-5 text-gray-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15V9h4v6H8z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                );
            case 3:
                return (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                        <svg
                            className="h-5 w-5 text-orange-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15V9h4v6H8z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-sm font-bold text-blue-600">
                            {rank}
                        </span>
                    </div>
                );
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const renderLeader = (leader: any, index: number) => {
        return (
            <div
                key={leader.id}
                className={`leader-item flex items-center space-x-4 rounded-lg p-4 ${
                    leader.rank <= 3
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 shadow-md'
                        : 'bg-white shadow-sm'
                }`}
            >
                {/* Rank */}
                {showRank && (
                    <div className="flex-shrink-0">
                        {getRankIcon(leader.rank)}
                    </div>
                )}

                {/* Avatar */}
                {showAvatar && (
                    <div className="flex-shrink-0">
                        {leader.avatar ? (
                            <img
                                src={leader.avatar}
                                alt={leader.name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-600">
                                {getInitials(leader.name)}
                            </div>
                        )}
                    </div>
                )}

                {/* Leader info */}
                <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {leader.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {leader.referrals}{' '}
                        {leader.referrals === 1 ? 'приглашение' : 'приглашений'}
                    </p>
                </div>

                {/* Referrals count */}
                <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-gray-900">
                        {leader.referrals}
                    </div>
                    <div className="text-xs text-gray-500">приглашений</div>
                </div>
            </div>
        );
    };

    return (
        <div
            className={`referral-leaderboard-output ${className || ''}`}
            style={style}
        >
            {title && (
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    {title}
                </h2>
            )}

            {subtitle && <p className="mb-6 text-gray-600">{subtitle}</p>}

            <div className="space-y-3">
                {displayLeaderboard.map((leader, index) =>
                    renderLeader(leader, index),
                )}
            </div>

            {leaderboard.length > limit && limit > 0 && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                        Показано {limit} из {leaderboard.length} участников
                    </p>
                </div>
            )}
        </div>
    );
};
