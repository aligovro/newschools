import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ChevronDown, Trash2 } from 'lucide-react';
import type { ContactCard, SocialKey } from '../types';

const SOCIALS: { key: SocialKey; label: string }[] = [
    { key: 'vk', label: 'ВКонтакте' },
    { key: 'telegram', label: 'Telegram' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'max', label: 'Max' },
    { key: 'youtube', label: 'YouTube' },
];

interface Props {
    card: ContactCard;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    onChange: (patch: Partial<ContactCard>) => void;
    onDelete: () => void;
}

export function ContactCardEditor({ card, index, isExpanded, onToggle, onChange, onDelete }: Props) {
    const summary = card.label?.trim() || card.value?.trim() || `Карточка ${index + 1}`;

    const updateSocial = (net: SocialKey, patch: { enabled?: boolean; url?: string }) => {
        const prev = card.socials ?? {};
        onChange({ socials: { ...prev, [net]: { ...prev[net], ...patch } } });
    };

    return (
        <div className="rounded-md border">
            {/* Header — always visible */}
            <div
                className="flex cursor-pointer select-none items-center gap-2 px-3 py-2"
                onClick={onToggle}
            >
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}
                />
                <span className="flex-1 truncate text-xs font-semibold text-muted-foreground">
                    {summary}
                </span>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    aria-label="Удалить карточку"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Body — only when expanded */}
            {isExpanded && (
                <div className="space-y-2 border-t px-3 pb-3 pt-3">
                    <Input
                        placeholder="Категория (напр. «По всем вопросам»)"
                        value={card.label || ''}
                        onChange={(e) => onChange({ label: e.target.value })}
                    />
                    <Input
                        placeholder="Значение (телефон, адрес…)"
                        value={card.value || ''}
                        onChange={(e) => onChange({ value: e.target.value })}
                    />
                    <Input
                        placeholder="Режим работы (напр. Пн-Пт с 10:00 до 19:00)"
                        value={card.hours || ''}
                        onChange={(e) => onChange({ hours: e.target.value })}
                    />
                    <Input
                        placeholder="Email (необязательно)"
                        value={card.email || ''}
                        onChange={(e) => onChange({ email: e.target.value })}
                    />

                    <div className="flex gap-2">
                        <Input
                            placeholder="Текст кнопки (необязательно)"
                            value={card.action_text || ''}
                            onChange={(e) => onChange({ action_text: e.target.value })}
                            className="flex-1"
                        />
                        <Input
                            placeholder="URL кнопки"
                            value={card.action_url || ''}
                            onChange={(e) => onChange({ action_url: e.target.value })}
                            className="flex-1"
                        />
                        <Select
                            value={card.action_variant || 'primary'}
                            onValueChange={(v) => onChange({ action_variant: v as 'primary' | 'outline' })}
                        >
                            <SelectTrigger className="w-28">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="primary">Градиент</SelectItem>
                                <SelectItem value="outline">Контур</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Map toggle */}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`map-${index}`}
                            checked={card.map_enabled ?? false}
                            onCheckedChange={(v) => onChange({ map_enabled: !!v })}
                        />
                        <Label htmlFor={`map-${index}`} className="cursor-pointer text-sm font-normal">
                            Кнопка «Открыть на карте»
                        </Label>
                    </div>

                    {/* Socials */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Социальные сети</Label>
                        {SOCIALS.map(({ key: net, label }) => {
                            const s = card.socials?.[net];
                            const enabled = s?.enabled ?? false;
                            return (
                                <div key={net} className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id={`social-${index}-${net}`}
                                            checked={enabled}
                                            onCheckedChange={(v) => updateSocial(net, { enabled: !!v })}
                                        />
                                        <Label
                                            htmlFor={`social-${index}-${net}`}
                                            className="cursor-pointer text-sm font-normal"
                                        >
                                            {label}
                                        </Label>
                                    </div>
                                    {enabled && (
                                        <Input
                                            placeholder={`Ссылка на ${net}`}
                                            value={s?.url ?? ''}
                                            onChange={(e) => updateSocial(net, { url: e.target.value })}
                                            className="ml-6"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
