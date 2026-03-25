import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ThanksLayout } from '../types';

interface Props {
    data: ThanksLayout;
    onChange: (data: ThanksLayout) => void;
}

const FIELDS: { key: keyof ThanksLayout; label: string; placeholder: string }[] = [
    { key: 'collected_amount',   label: 'Собранная сумма',                              placeholder: '203 600 000 ₽' },
    { key: 'profile_link_text',  label: 'Текст ссылки на профиль',                      placeholder: 'Подписку можно настроить в личном кабинете' },
    { key: 'profile_url',        label: 'URL профиля',                                  placeholder: '/my-account' },
    { key: 'cta_text',           label: 'Текст кнопки CTA',                             placeholder: 'Перейти на главную' },
    { key: 'cta_url',            label: 'URL кнопки CTA',                               placeholder: '/' },
    { key: 'requisites_url',     label: 'URL для «Скачать реквизиты» (опционально)',    placeholder: '/storage/requisites.pdf' },
];

export function SchoolThanksSection({ data, onChange }: Props) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Заголовок и подзаголовок берутся из полей выше. Три фотографии
                для мозаики — из вкладки «Медиа» (галерея).
            </p>
            {FIELDS.map(({ key, label, placeholder }) => (
                <div key={key}>
                    <Label>{label}</Label>
                    <Input
                        value={data[key]}
                        onChange={(e) => onChange({ ...data, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="mt-1"
                    />
                </div>
            ))}
        </div>
    );
}
