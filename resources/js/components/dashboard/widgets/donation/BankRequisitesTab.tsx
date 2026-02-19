import type { BankRequisites } from './types';
import React, { useCallback, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface BankRequisitesTabProps {
    requisites: BankRequisites;
}

const CopyButton: React.FC<{ value: string; label: string }> = ({
    value,
    label,
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [value]);

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="bank-requisites__copy-btn"
            title={`Скопировать ${label}`}
        >
            {copied ? (
                <Check className="h-4 w-4 text-green-600" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
        </button>
    );
};

export const BankRequisitesTab: React.FC<BankRequisitesTabProps> = ({
    requisites,
}) => {
    const hasCards = !!(requisites.sber_card || requisites.tinkoff_card);

    return (
        <div className="bank-requisites">
            {hasCards && (
                <div className="bank-requisites__cards">
                    {requisites.sber_card && (
                        <div className="bank-requisites__card bank-requisites__card--sber">
                            <div className="bank-requisites__card-header">
                                <span className="bank-requisites__card-label">
                                    Сбер
                                </span>
                                <CopyButton
                                    value={requisites.sber_card}
                                    label="номер карты Сбер"
                                />
                            </div>
                            <span className="bank-requisites__card-number">
                                {formatCardNumber(requisites.sber_card)}
                            </span>
                            {requisites.card_recipient && (
                                <span className="bank-requisites__card-recipient">
                                    {requisites.card_recipient}
                                </span>
                            )}
                        </div>
                    )}

                    {requisites.tinkoff_card && (
                        <div className="bank-requisites__card bank-requisites__card--tinkoff">
                            <div className="bank-requisites__card-header">
                                <span className="bank-requisites__card-label">
                                    Т‑Банк
                                </span>
                                <CopyButton
                                    value={requisites.tinkoff_card}
                                    label="номер карты Т‑Банк"
                                />
                            </div>
                            <span className="bank-requisites__card-number">
                                {formatCardNumber(requisites.tinkoff_card)}
                            </span>
                            {requisites.card_recipient && (
                                <span className="bank-requisites__card-recipient">
                                    {requisites.card_recipient}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {requisites.text && (
                <div className="bank-requisites__text">
                    <div className="bank-requisites__text-header">
                        <h4 className="bank-requisites__text-title">
                            Банковские реквизиты
                        </h4>
                        <CopyButton
                            value={stripHtml(requisites.text)}
                            label="реквизиты"
                        />
                    </div>
                    <div
                        className="bank-requisites__text-content"
                        dangerouslySetInnerHTML={{
                            __html: requisites.text,
                        }}
                    />
                </div>
            )}
        </div>
    );
};

function formatCardNumber(number: string): string {
    const digits = number.replace(/\D/g, '');
    return digits.replace(/(.{4})/g, '$1 ').trim();
}

function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}
