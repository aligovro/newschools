import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DocumentUploader from '@/components/ui/DocumentUploader';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ContactCard, ContactDoc, ContactsLayout } from '../types';
import { ContactCardEditor } from './ContactCardEditor';

interface Props {
    data: ContactsLayout;
    onChange: (data: ContactsLayout) => void;
}

export function SchoolContactsSection({ data, onChange }: Props) {
    const [expandedCards, setExpandedCards] = useState<Set<number>>(() => new Set());

    const patchCards = (cards: ContactCard[]) => onChange({ ...data, cards });
    const patchDocs = (documents: ContactDoc[]) => onChange({ ...data, documents });

    const addCard = () => {
        const newIdx = data.cards.length;
        patchCards([
            ...data.cards,
            { label: '', value: '', hours: '', email: '', action_text: '', action_url: '', action_variant: 'primary' },
        ]);
        setExpandedCards((prev) => new Set([...prev, newIdx]));
    };

    const deleteCard = (idx: number) => {
        patchCards(data.cards.filter((_, i) => i !== idx));
        setExpandedCards((prev) => {
            const next = new Set<number>();
            prev.forEach((i) => {
                if (i < idx) next.add(i);
                else if (i > idx) next.add(i - 1);
            });
            return next;
        });
    };

    const updateCard = (idx: number, patch: Partial<ContactCard>) => {
        const next = [...data.cards];
        next[idx] = { ...next[idx], ...patch };
        patchCards(next);
    };

    const toggleCard = (idx: number) =>
        setExpandedCards((prev) => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx); else next.add(idx);
            return next;
        });

    const updateDoc = (idx: number, patch: Partial<ContactDoc>) => {
        const next = [...data.documents];
        next[idx] = { ...next[idx], ...patch };
        patchDocs(next);
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Заголовок страницы берётся из поля «Заголовок» выше.
                Настройте карточки контактов и список документов.
            </p>

            {/* Contact cards */}
            <div>
                <div className="mb-2 flex items-center justify-between">
                    <Label>Карточки контактов</Label>
                    {data.cards.length < 4 && (
                        <Button type="button" variant="outline" size="sm" onClick={addCard}>
                            <Plus className="mr-1 h-4 w-4" />
                            Карточка
                        </Button>
                    )}
                </div>
                <div className="space-y-2">
                    {data.cards.map((card, idx) => (
                        <ContactCardEditor
                            key={idx}
                            card={card}
                            index={idx}
                            isExpanded={expandedCards.has(idx)}
                            onToggle={() => toggleCard(idx)}
                            onChange={(patch) => updateCard(idx, patch)}
                            onDelete={() => deleteCard(idx)}
                        />
                    ))}
                </div>
            </div>

            {/* Documents */}
            <div>
                <div className="mb-2 flex items-center justify-between">
                    <Label>Официальные документы</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => patchDocs([...data.documents, { name: '', url: '', meta: '' }])}
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Документ
                    </Button>
                </div>

                {data.documents.length > 0 && (
                    <div>
                        <div className="mb-2">
                            <Label>Заголовок раздела документов</Label>
                            <Input
                                value={data.docs_title}
                                onChange={(e) => onChange({ ...data, docs_title: e.target.value })}
                                placeholder="Официальные документы"
                                className="mt-1"
                            />
                        </div>
                        <div className="space-y-3">
                            {data.documents.map((doc, idx) => (
                                <div key={idx} className="space-y-2 rounded-md border p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-muted-foreground">
                                            Документ {idx + 1}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => patchDocs(data.documents.filter((_, i) => i !== idx))}
                                            aria-label="Удалить"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="Название документа"
                                        value={doc.name || ''}
                                        onChange={(e) => updateDoc(idx, { name: e.target.value })}
                                    />
                                    <DocumentUploader
                                        value={doc.url || ''}
                                        onChange={(path, fileInfo) => {
                                            const patch: Partial<ContactDoc> = { url: path };
                                            if (fileInfo && path && !doc.meta?.trim()) {
                                                const d = new Date();
                                                const months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
                                                const sizeStr = fileInfo.size >= 1_048_576
                                                    ? `${(fileInfo.size / 1_048_576).toFixed(1)} MB`
                                                    : `${(fileInfo.size / 1024).toFixed(1)} kb`;
                                                patch.meta = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${fileInfo.ext} · ${sizeStr}`;
                                            }
                                            updateDoc(idx, patch);
                                        }}
                                    />
                                    <Input
                                        placeholder="Мета (необязательно, напр. 28 фев 2026 · PDF · 132 kb)"
                                        value={doc.meta || ''}
                                        onChange={(e) => updateDoc(idx, { meta: e.target.value })}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
