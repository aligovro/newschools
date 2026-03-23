import { usePage } from '@inertiajs/react';
import React from 'react';
import { WidgetOutputProps } from './types';

/**
 * Виджет "Скачать реквизиты организации".
 *
 * Логика видимости:
 *  - has_bank_requisites === true  → настоящая ссылка на PDF
 *  - has_bank_requisites === false → скрыт (реквизиты не заполнены)
 *  - has_bank_requisites === undefined → конструктор / превью: рендерим
 *    кнопку-заглушку без href, чтобы редактор видел внешний вид виджета
 *
 * Данные берём из Inertia page props (site.has_bank_requisites / site.bank_requisites_pdf_url),
 * которые инжектируются бэкендом в GetsSiteWidgetsData — без дополнительных запросов.
 */
export const OrgRequisitesDownloadOutput: React.FC<WidgetOutputProps> = ({
    widget,
}) => {
    const { props } = usePage();
    const site = (props as Record<string, unknown>)?.site as
        | Record<string, unknown>
        | undefined;

    const config = (widget.config || {}) as Record<string, unknown>;
    const label =
        (config.button_label as string) || 'Скачать реквизиты школы';

    const hasRequisites = site?.has_bank_requisites as boolean | undefined;
    const pdfUrl = site?.bank_requisites_pdf_url as string | null | undefined;

    // Публичный сайт без реквизитов — не рендерим вообще
    if (hasRequisites === false) return null;

    // Есть реквизиты — настоящая ссылка-скачивание
    if (hasRequisites === true && pdfUrl) {
        return (
            <div className="org-requisites-download">
                <a
                    href={pdfUrl}
                    className="org-requisites-download__btn"
                    download
                    target="_blank"
                    rel="noreferrer"
                >
                    <img
                        src="/icons/school-template/notification-status.svg"
                        alt=""
                        className="org-requisites-download__icon"
                        width={16}
                        height={16}
                        aria-hidden="true"
                    />
                    <span className="org-requisites-download__label">
                        {label}
                    </span>
                </a>
            </div>
        );
    }

    // Конструктор / неизвестный контекст — визуальный превью без href
    return (
        <div className="org-requisites-download">
            <span className="org-requisites-download__btn">
                <img
                    src="/icons/school-template/notification-status.svg"
                    alt=""
                    className="org-requisites-download__icon"
                    width={16}
                    height={16}
                    aria-hidden="true"
                />
                <span className="org-requisites-download__label">{label}</span>
            </span>
        </div>
    );
};
