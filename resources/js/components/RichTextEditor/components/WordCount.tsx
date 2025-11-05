import React from 'react';
import styles from '../RichTextEditor.module.scss';

interface WordCountProps {
  wordCount: number;
  charCount: number;
  show: boolean;
}

export const WordCount: React.FC<WordCountProps> = React.memo(({ wordCount, charCount, show }) => {
  if (!show) return null;

  return (
    <>
      <div className={styles.wordCount}>
        <span>{wordCount} слов</span>
        <span>{charCount} символов</span>
      </div>
    </>
  );
});

WordCount.displayName = 'WordCount';

export default WordCount;


