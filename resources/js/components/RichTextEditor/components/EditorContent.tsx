import React from 'react';
import clsx from 'clsx';
import styles from '../RichTextEditor.module.scss';

interface EditorContentProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  isHtmlMode: boolean;
  isActive: boolean;
  height: number;
  placeholder: string;
  onInput: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onClick: (e: React.MouseEvent) => void;
  onKeyUp: () => void;
  onMouseUp: () => void;
  isReady: boolean;
}

export const EditorContent: React.FC<EditorContentProps> = React.memo(
  ({
    editorRef,
    isHtmlMode,
    isActive,
    height,
    placeholder,
    onInput,
    onFocus,
    onBlur,
    onClick,
    onKeyUp,
    onMouseUp,
    isReady,
  }) => {
    return (
      <>
        {/* Область редактирования */}
        <div
          ref={editorRef}
          className={clsx(styles.editorContent, { [styles.htmlMode]: isHtmlMode })}
          contentEditable={isActive}
          suppressContentEditableWarning={true}
          style={{ minHeight: `${height}px` }}
          onInput={onInput}
          onPaste={onInput}
          onFocus={onFocus}
          onBlur={onBlur}
          onClick={onClick}
          onKeyUp={onKeyUp}
          onMouseUp={onMouseUp}
          data-placeholder={placeholder}
        />

        {!isReady && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
            <span>Загрузка редактора...</span>
          </div>
        )}
      </>
    );
  },
);

EditorContent.displayName = 'EditorContent';

export default EditorContent;
