import React from 'react';
import styles from './PreviewPanel.module.scss';

interface PreviewPanelProps {
  config: {
    name: string;
    shortName: string;
    description: string;
    themeColor: string;
    backgroundColor: string;
    display: string;
    orientation: string;
    startUrl: string;
    scope: string;
    lang: string;
  };
}

function getContrastColor(hexColor: string): string {
  if (!hexColor || hexColor === '#') return '#ffffff';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ config }) => {
  return (
    <div className={styles.container}>
      <h2>Предпросмотр</h2>

      <div
        className={styles.previewCard}
        style={{
          backgroundColor: config.backgroundColor,
          color: getContrastColor(config.backgroundColor),
        }}
      >
        <div
          className={styles.previewHeader}
          style={{
            backgroundColor: config.themeColor,
            color: getContrastColor(config.themeColor),
          }}
        >
          <span className={styles.previewTitle}>{config.shortName}</span>
        </div>

        <div className={styles.previewContent}>
          <h3>{config.name}</h3>
          <p>{config.description || 'Описание не указано'}</p>

          <div className={styles.previewInfo}>
            <div className={styles.infoItem}>
              <strong>Режим:</strong> {config.display}
            </div>
            <div className={styles.infoItem}>
              <strong>Ориентация:</strong> {config.orientation}
            </div>
            <div className={styles.infoItem}>
              <strong>Start URL:</strong> {config.startUrl}
            </div>
            <div className={styles.infoItem}>
              <strong>Scope:</strong> {config.scope}
            </div>
            <div className={styles.infoItem}>
              <strong>Язык:</strong> {config.lang}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;