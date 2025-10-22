import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    ListItemNode,
    ListNode,
} from '@lexical/list';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import {
    $getRoot,
    $insertNodes,
    EditorState,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    REDO_COMMAND,
    UNDO_COMMAND,
    type LexicalEditor,
} from 'lexical';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold as BoldIcon,
    Italic as ItalicIcon,
    Link as LinkIcon,
    List as ListIcon,
    ListOrdered as ListOrderedIcon,
    Redo2,
    Underline as UnderlineIcon,
    Undo2,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface RichTextEditorProps {
    valueHTML: string;
    onChangeHTML: (html: string) => void;
    placeholder?: string;
    minHeight?: number | string;
    className?: string;
}

// Простая кнопка тулбара
const ToolbarButton: React.FC<{
    title: string;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ title, onClick, children }) => (
    <button
        type="button"
        className="h-8 rounded border px-2 text-sm hover:bg-gray-50"
        onClick={onClick}
        title={title}
    >
        {children}
    </button>
);

// Тулбар редактора с базовыми операциями
const EditorToolbar: React.FC = () => {
    const [editor] = useLexicalComposerContext();

    const applyTextFormat = (format: 'bold' | 'italic' | 'underline') => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    const applyAlign = (align: 'left' | 'center' | 'right') => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, align);
    };

    const insertList = (type: 'ul' | 'ol') => {
        if (type === 'ul') {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }
    };

    const toggleLink = () => {
        const url = window.prompt(
            'Введите URL (оставьте пустым, чтобы удалить ссылку):',
        );
        if (url === null) return;
        const trimmed = url.trim();
        editor.dispatchCommand(
            TOGGLE_LINK_COMMAND,
            trimmed === '' ? null : trimmed,
        );
    };

    return (
        <div className="flex flex-wrap items-center gap-2 border-b bg-gray-50 p-2">
            <div className="flex items-center gap-2">
                <ToolbarButton
                    title="Полужирный"
                    onClick={() => applyTextFormat('bold')}
                >
                    <BoldIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    title="Курсив"
                    onClick={() => applyTextFormat('italic')}
                >
                    <ItalicIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    title="Подчеркнутый"
                    onClick={() => applyTextFormat('underline')}
                >
                    <UnderlineIcon className="h-4 w-4" />
                </ToolbarButton>
            </div>
            <div className="mx-2 h-5 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
                <ToolbarButton
                    title="Маркированный список"
                    onClick={() => insertList('ul')}
                >
                    <ListIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    title="Нумерованный список"
                    onClick={() => insertList('ol')}
                >
                    <ListOrderedIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton title="Ссылка" onClick={toggleLink}>
                    <LinkIcon className="h-4 w-4" />
                </ToolbarButton>
            </div>
            <div className="mx-2 h-5 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
                <ToolbarButton
                    title="Выровнять слева"
                    onClick={() => applyAlign('left')}
                >
                    <AlignLeft className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    title="По центру"
                    onClick={() => applyAlign('center')}
                >
                    <AlignCenter className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    title="Выровнять справа"
                    onClick={() => applyAlign('right')}
                >
                    <AlignRight className="h-4 w-4" />
                </ToolbarButton>
            </div>
            <div className="mx-2 h-5 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
                <ToolbarButton
                    title="Отменить"
                    onClick={() =>
                        editor.dispatchCommand(UNDO_COMMAND, undefined)
                    }
                >
                    <Undo2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    title="Повторить"
                    onClick={() =>
                        editor.dispatchCommand(REDO_COMMAND, undefined)
                    }
                >
                    <Redo2 className="h-4 w-4" />
                </ToolbarButton>
            </div>
        </div>
    );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    valueHTML,
    onChangeHTML,
    placeholder = 'Введите текст...',
    minHeight = 200,
    className = '',
}) => {
    const [mode, setMode] = useState<'wysiwyg' | 'html'>('wysiwyg');
    const [htmlDraft, setHtmlDraft] = useState<string>(valueHTML || '');

    const theme = useMemo(
        () => ({
            paragraph: 'mb-2',
            text: {
                bold: 'font-semibold',
                italic: 'italic',
                underline: 'underline',
            },
            link: 'text-blue-600 underline',
            list: {
                listitem: 'ml-5',
                listitemChecked: 'ml-5',
                listitemUnchecked: 'ml-5',
                nested: {
                    listitem: 'ml-5',
                },
                ul: 'list-disc ml-5',
                ol: 'list-decimal ml-5',
            },
            quote: 'border-l-4 border-gray-300 pl-3 italic text-gray-700 my-2',
            code: 'bg-gray-100 rounded px-1 py-0.5 font-mono text-sm',
        }),
        [],
    );

    const initialConfig = useMemo(
        () => ({
            namespace: 'RichTextEditor',
            onError: (error: Error) => {
                console.error('Lexical error:', error);
            },
            theme,
            editable: true,
            nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
        }),
        [theme],
    );

    const lastHtmlRef = React.useRef<string>(valueHTML || '');
    const debounceRef = React.useRef<number | null>(null);

    const handleChange = useCallback(
        (editorState: EditorState, editor: LexicalEditor) => {
            editorState.read(() => {
                const html = $generateHtmlFromNodes(editor);

                // Debounce to reduce лишние onChange и перерисовки
                if (debounceRef.current) {
                    window.clearTimeout(debounceRef.current);
                }
                debounceRef.current = window.setTimeout(() => {
                    if (lastHtmlRef.current !== html) {
                        lastHtmlRef.current = html;
                        onChangeHTML(html);
                        // Обновляем текстовую версию только в HTML-режиме
                        if (mode === 'html') {
                            setHtmlDraft(html);
                        }
                    }
                }, 120);
            });
        },
        [onChangeHTML, mode],
    );

    const handleEditorReady = useCallback(
        (editor: LexicalEditor) => {
            // Инициализация содержимого из valueHTML
            if (!valueHTML) return;
            editor.update(() => {
                const parser = new DOMParser();
                const dom = parser.parseFromString(valueHTML, 'text/html');
                const nodes = $generateNodesFromDOM(editor, dom.body);
                const root = $getRoot();
                root.clear();
                root.select();
                $insertNodes(nodes);
            });
        },
        [valueHTML],
    );

    // Синхронизируем внешний HTML в HTML-режиме
    useEffect(() => {
        if (mode === 'html') {
            setHtmlDraft(valueHTML || '');
        }
    }, [mode, valueHTML]);

    return (
        <div className={`rounded-lg border bg-white ${className}`}>
            <div className="flex items-center gap-2 border-b p-2">
                <button
                    type="button"
                    className={`form-widget-editor__tab ${mode === 'wysiwyg' ? 'active' : ''}`}
                    onClick={() => setMode('wysiwyg')}
                >
                    Визуальный
                </button>
                <button
                    type="button"
                    className={`form-widget-editor__tab ${mode === 'html' ? 'active' : ''}`}
                    onClick={() => setMode('html')}
                >
                    HTML
                </button>
            </div>

            {mode === 'html' ? (
                <textarea
                    className="w-full resize-y bg-white p-3 font-mono text-sm outline-none"
                    style={{ minHeight }}
                    value={htmlDraft}
                    onChange={(e) => {
                        setHtmlDraft(e.target.value);
                        onChangeHTML(e.target.value);
                    }}
                    placeholder="<p>Введите HTML...</p>"
                />
            ) : (
                <LexicalComposer initialConfig={initialConfig}>
                    <div>
                        <EditorToolbar />
                        <div className="relative">
                            <RichTextPlugin
                                contentEditable={
                                    <ContentEditable
                                        className="w-full p-3 outline-none"
                                        style={{ minHeight }}
                                    />
                                }
                                placeholder={
                                    <div className="pointer-events-none absolute left-3 top-3 select-none text-sm text-gray-400">
                                        {placeholder}
                                    </div>
                                }
                                ErrorBoundary={(_) => (
                                    <div className="p-2 text-sm text-red-600">
                                        Ошибка редактора
                                    </div>
                                )}
                            />
                        </div>
                        <HistoryPlugin />
                        <ListPlugin />
                        <LinkPlugin />
                        <OnChangePlugin onChange={handleChange} />
                        {/* Устанавливаем исходное значение один раз */}
                        <EditorInit
                            valueHTML={valueHTML}
                            onReady={handleEditorReady}
                        />
                    </div>
                </LexicalComposer>
            )}
        </div>
    );
};

// Вспомогательный компонент для инициализации содержимого
const EditorInit: React.FC<{
    valueHTML: string;
    onReady: (editor: LexicalEditor) => void;
}> = ({ valueHTML, onReady }) => {
    const [mounted, setMounted] = useState(false);
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!mounted) {
            onReady(editor);
            setMounted(true);
        }
    }, [editor, mounted, onReady]);

    // Реакция на изменение внешнего HTML (когда не в режиме редактирования)
    useEffect(() => {
        if (!mounted) return;
        if (!valueHTML) return;
        editor.update(() => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(valueHTML, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom.body);
            const root = $getRoot();
            root.clear();
            root.select();
            $insertNodes(nodes);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [valueHTML]);

    return null;
};

export default RichTextEditor;
