import React, { useMemo } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  IndentIncrease,
  IndentDecrease,
  Link as LinkIcon,
  Image as ImageIcon,
  Eraser,
  Minus,
  Code,
  Quote,
  Video,
  Palette,
  Table,
  LayoutTemplate,
  Eye,
  EyeOff,
  Loader2,
  RectangleHorizontal,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import clsx from 'clsx';
import styles from '../RichTextEditor.module.scss';
// ToolbarButton уже определен в основном файле, импортируем его
interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  tooltip: string;
  shortcut?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = React.memo(
  ({ icon, onClick, disabled = false, active = false, tooltip, shortcut }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={clsx(styles.toolbarButton, { [styles.active]: active })}
          type="button"
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{`${tooltip}${shortcut ? ` (${shortcut})` : ''}`}</p>
      </TooltipContent>
    </Tooltip>
  ),
);

ToolbarButton.displayName = 'ToolbarButton';

interface ToolbarProps {
  isAdmin: boolean;
  isActive: boolean;
  showTemplates: boolean;
  showHtmlToggle: boolean;
  showImageUpload?: boolean;
  isHtmlMode: boolean;
  selectedColor: string;
  selectedImage: HTMLImageElement | null;
  onExecCommand: (command: string, value?: string) => void;
  onImageButtonClick: () => void;
  onInsertLink: () => void;
  onInsertButton: () => void;
  onVideoClick: (e: React.MouseEvent<HTMLElement>) => void;
  onColorClick: (e: React.MouseEvent<HTMLElement>) => void;
  onTableClick: (e: React.MouseEvent<HTMLElement>) => void;
  onTemplatesClick: (e: React.MouseEvent<HTMLElement>) => void;
  onHtmlToggle: () => void;
  onImageEdit: (img: HTMLImageElement) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isImageUploading?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = React.memo(
  ({
    isAdmin,
    isActive,
    showTemplates,
    showHtmlToggle,
    showImageUpload = true,
    isHtmlMode,
    selectedColor,
    selectedImage,
    onExecCommand,
    onImageButtonClick,
    onInsertLink,
    onInsertButton,
    onVideoClick,
    onColorClick,
    onTableClick,
    onTemplatesClick,
    onHtmlToggle,
    onImageEdit,
    fileInputRef,
    onImageUpload,
    isImageUploading,
  }) => {
    const toolbarButtons = useMemo(
      () => [
        // Форматирование текста
        {
          group: 'format',
          buttons: [
            { icon: <Bold className="h-4 w-4" />, command: 'bold', tooltip: 'Жирный', shortcut: 'Ctrl+B' },
            { icon: <Italic className="h-4 w-4" />, command: 'italic', tooltip: 'Курсив', shortcut: 'Ctrl+I' },
            {
              icon: <Underline className="h-4 w-4" />,
              command: 'underline',
              tooltip: 'Подчеркнутый',
              shortcut: 'Ctrl+U',
            },
            ...(isAdmin
              ? [
                  {
                    icon: <Strikethrough className="h-4 w-4" />,
                    command: 'strikeThrough',
                    tooltip: 'Зачеркнутый',
                  },
                ]
              : []),
          ],
        },
        // Выравнивание
        {
          group: 'align',
          buttons: [
            { icon: <AlignLeft className="h-4 w-4" />, command: 'justifyLeft', tooltip: 'По левому краю' },
            { icon: <AlignCenter className="h-4 w-4" />, command: 'justifyCenter', tooltip: 'По центру' },
            { icon: <AlignRight className="h-4 w-4" />, command: 'justifyRight', tooltip: 'По правому краю' },
            ...(isAdmin
              ? [{ icon: <AlignJustify className="h-4 w-4" />, command: 'justifyFull', tooltip: 'По ширине' }]
              : []),
          ],
        },
        // Списки
        {
          group: 'lists',
          buttons: [
            {
              icon: <List className="h-4 w-4" />,
              command: 'insertUnorderedList',
              tooltip: 'Маркированный список',
            },
            {
              icon: <ListOrdered className="h-4 w-4" />,
              command: 'insertOrderedList',
              tooltip: 'Нумерованный список',
            },
            ...(isAdmin
              ? [
                  {
                    icon: <IndentIncrease className="h-4 w-4" />,
                    command: 'indent',
                    tooltip: 'Увеличить отступ',
                  },
                  {
                    icon: <IndentDecrease className="h-4 w-4" />,
                    command: 'outdent',
                    tooltip: 'Уменьшить отступ',
                  },
                ]
              : []),
          ],
        },
        // Медиа и ссылки
        {
          group: 'media',
          buttons: [
            {
              icon: <LinkIcon className="h-4 w-4" />,
              command: 'link',
              tooltip: 'Вставить ссылку',
              shortcut: 'Ctrl+K',
            },
            {
              icon: <RectangleHorizontal className="h-4 w-4" />,
              command: 'button',
              tooltip: 'Вставить кнопку',
            },
            // Показываем если разрешена загрузка изображений (независимо от уровня)
            ...(showImageUpload
              ? [{ icon: <ImageIcon className="h-4 w-4" />, command: 'image', tooltip: 'Вставить изображение' }]
              : []),
            ...(isAdmin
              ? [{ icon: <Video className="h-4 w-4" />, command: 'video', tooltip: 'Вставить видео' }]
              : []),
          ],
        },
        // Дополнительные функции для админов
        ...(isAdmin
          ? [
              {
                group: 'advanced',
                buttons: [
                  {
                    icon: <Minus className="h-4 w-4" />,
                    command: 'insertHorizontalRule',
                    tooltip: 'Горизонтальная линия',
                  },
                  {
                    icon: <Eraser className="h-4 w-4" />,
                    command: 'removeFormat',
                    tooltip: 'Убрать форматирование',
                  },
                  { icon: <Quote className="h-4 w-4" />, command: 'blockquote', tooltip: 'Цитата' },
                  { icon: <Code className="h-4 w-4" />, command: 'code', tooltip: 'Код' },
                ],
              },
            ]
          : []),
      ],
      [isAdmin, showImageUpload],
    );

    return (
      <div className={styles.toolbar}>
        {/* Основные группы кнопок */}
        {toolbarButtons.map((group, groupIndex) => (
          <React.Fragment key={group.group}>
            <div className={styles.toolbarGroup}>
              {group.buttons.map((button, buttonIndex) => {
                if (button.command === 'image') {
                  return (
                    <div key={buttonIndex} className={styles.imageButton}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            disabled={!isActive || !!isImageUploading}
                            onClick={onImageButtonClick}
                            className={styles.toolbarButton}
                          >
                            {isImageUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              button.icon
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isImageUploading ? 'Загрузка...' : button.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={onImageUpload}
                        disabled={!isActive || !!isImageUploading}
                        className={styles.hiddenFileInput}
                      />
                    </div>
                  );
                }

                if (button.command === 'video') {
                  return (
                    <Tooltip key={buttonIndex}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={onVideoClick}
                          disabled={!isActive}
                          className={styles.toolbarButton}
                        >
                          {button.icon}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{button.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                if (button.command === 'link') {
                  return (
                    <ToolbarButton
                      key={buttonIndex}
                      icon={button.icon}
                      onClick={onInsertLink}
                      disabled={!isActive}
                      tooltip={button.tooltip}
                      shortcut={button.shortcut}
                    />
                  );
                }

                if (button.command === 'button') {
                  return (
                    <ToolbarButton
                      key={buttonIndex}
                      icon={button.icon}
                      onClick={onInsertButton}
                      disabled={!isActive}
                      tooltip={button.tooltip}
                    />
                  );
                }

                return (
                  <ToolbarButton
                    key={buttonIndex}
                    icon={button.icon}
                    onClick={() => onExecCommand(button.command)}
                    disabled={!isActive}
                    tooltip={button.tooltip}
                    shortcut={button.shortcut}
                  />
                );
              })}
            </div>
            {groupIndex < toolbarButtons.length - 1 && (
              <Separator orientation="vertical" className="h-6" />
            )}
          </React.Fragment>
        ))}

        {/* Дополнительные функции для админов */}
        {isAdmin && (
          <>
            <Separator orientation="vertical" className="h-6" />

            {/* Цвет текста */}
            <div className={styles.toolbarGroup}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onColorClick}
                    disabled={!isActive}
                    className={styles.toolbarButton}
                    style={{ color: selectedColor }}
                  >
                    <Palette className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Цвет текста</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Таблицы */}
            <div className={styles.toolbarGroup}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onTableClick}
                    disabled={!isActive}
                    className={styles.toolbarButton}
                  >
                    <Table className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Вставить таблицу</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Шаблоны */}
            {showTemplates && (
              <div className={styles.toolbarGroup}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onTemplatesClick}
                      disabled={!isActive}
                      className={styles.toolbarButton}
                    >
                      <LayoutTemplate className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Шаблоны</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </>
        )}

        {/* HTML режим - доступен всем с showHtmlToggle */}
        {showHtmlToggle && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <div className={styles.toolbarGroup}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onHtmlToggle}
                    disabled={!isActive}
                    className={clsx(styles.toolbarButton, { [styles.active]: isHtmlMode })}
                  >
                    {isHtmlMode ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isHtmlMode ? 'Режим WYSIWYG' : 'HTML режим'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </>
        )}

        {/* Настройки изображения - показываем только при выборе изображения */}
        {selectedImage && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <div className={styles.toolbarGroup}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onImageEdit(selectedImage)}
                    disabled={!isActive}
                    className={clsx(styles.toolbarButton, {
                      [styles.active]: !!selectedImage,
                    })}
                  >
                    <LayoutTemplate className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Настройки изображения</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    );
  },
);

Toolbar.displayName = 'Toolbar';

export default Toolbar;
