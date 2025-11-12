import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import React from 'react';

const CONSENT_TEXT =
    'Принимаю условия обработки персональных данных';

export interface PersonalDataConsentProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    id?: string;
    className?: string;
    label?: string;
    policyHref?: string;
    policyTarget?: React.HTMLAttributeAnchorTarget;
}

export const PERSONAL_DATA_CONSENT_TEST_ID =
    'personal-data-consent-checkbox';

export function PersonalDataConsent({
    checked,
    onChange,
    id,
    className,
    label = CONSENT_TEXT,
    policyHref,
    policyTarget = '_blank',
}: PersonalDataConsentProps) {
    return (
        <label
            htmlFor={id}
            className={cn(
                'inline-flex items-start gap-2 text-[9px] font-medium leading-[120%] text-[#a1a6b2]',
                className,
            )}
        >
            <Checkbox
                id={id}
                data-testid={PERSONAL_DATA_CONSENT_TEST_ID}
                checked={checked}
                onCheckedChange={(value) => onChange(Boolean(value))}
                className="mt-0.5 h-[14px] w-[14px] border border-[#a1a6b2] data-[state=checked]:bg-transparent data-[state=checked]:text-[#a1a6b2]"
            />
            <span>
                {policyHref ? (
                    <a
                        href={policyHref}
                        target={policyTarget}
                        rel="noopener noreferrer"
                        className="underline decoration-dashed underline-offset-2"
                    >
                        {label}
                    </a>
                ) : (
                    label
                )}
            </span>
        </label>
    );
}

export default PersonalDataConsent;

