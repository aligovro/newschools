import React from 'react';

interface Stat {
    icon: string;
    value: string;
    label: string;
}

interface Props {
    donorsCount: number;
    autoPaymentsCount: number;
    topPaymentKopecks: number;
}

const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU').format(Math.round(n));

const fmtRubles = (kopecks: number) =>
    `${fmt(kopecks / 100)} ₽`;

const ProjectStatsBar: React.FC<Props> = ({
    donorsCount,
    autoPaymentsCount,
    topPaymentKopecks,
}) => {
    const stats: Stat[] = [
        {
            icon: '/icons/school-template/heart-blue.svg',
            value: fmt(donorsCount),
            label: 'Доноров',
        },
        {
            icon: '/icons/school-template/flash-circle-blue.svg',
            value: fmt(autoPaymentsCount),
            label: 'Автоплатежей',
        },
        {
            icon: '/icons/school-template/cup.svg',
            value: fmtRubles(topPaymentKopecks),
            label: 'Топ платёж',
        },
    ];

    return (
        <div className="project-stats-bar">
            {stats.map((stat) => (
                <div key={stat.label} className="project-stats-bar__card">
                    <div className="project-stats-bar__text">
                        <span className="project-stats-bar__value">{stat.value}</span>
                        <span className="project-stats-bar__label">{stat.label}</span>
                    </div>
                    <img
                        src={stat.icon}
                        alt=""
                        className="project-stats-bar__icon"
                        aria-hidden="true"
                    />
                </div>
            ))}
        </div>
    );
};

export default React.memo(ProjectStatsBar);
