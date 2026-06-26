import React, { useState } from 'react';
import { copyToClipboard, downloadJSON } from '../../services/fileService';
import styles from './CodeOutput.module.scss';

interface CodeOutputProps {
  config: {
    name: string;
    shortName: string;
    description: string;
    startUrl: string;
    themeColor: string;
    backgroundColor: string;
    display: string;
    orientation: string;
    scope: string;
    lang: string;
  };
}

const CodeOutput: React.FC<CodeOutputProps> = ({ config }) => {
  const [copied, setCopied] = useState(false);

  // Функция для создания SVG-иконки-заглушки
  const generateIconPlaceholder = (size: number, color: string, letter: string): string => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="${color}" rx="${size * 0.15}" />
      <text x="50%" y="50%" font-size="${size * 0.5}" text-anchor="middle" dy=".35em" fill="white" font-family="Arial, sans-serif" font-weight="bold">${letter}</text>
    </svg>`;
    const encoded = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${encoded}`;
  };

  const generateManifest = () => {
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    const letter = config.shortName.charAt(0).toUpperCase() || 'P';
    const color = config.themeColor || '#667eea';

    const icons = sizes.map((size) => ({
      src: generateIconPlaceholder(size, color, letter),
      sizes: `${size}x${size}`,
      type: 'image/svg+xml',
      purpose: size === 512 ? 'maskable' : 'any',
    }));

    const manifest = {
      name: config.name,
      short_name: config.shortName,
      description: config.description,
      start_url: config.startUrl,
      display: config.display,
      theme_color: config.themeColor,
      background_color: config.backgroundColor,
      orientation: config.orientation,
      scope: config.scope,
      lang: config.lang,
      icons: icons,
    };
    return manifest;
  };

  const handleCopy = async () => {
    const manifest = generateManifest();
    const success = await copyToClipboard(JSON.stringify(manifest, null, 2));
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const manifest = generateManifest();
    downloadJSON(manifest, 'manifest.json');
  };

  const manifestString = JSON.stringify(generateManifest(), null, 2);

  return (
    <div className={styles.container}>
      <h2>Сгенерированный код</h2>

      <div className={styles.codeActions}>
        <button onClick={handleCopy} className={styles.btnSecondary}>
          {copied ? 'Скопировано!' : 'Копировать JSON'}
        </button>
        <button onClick={handleDownload} className={styles.btnSecondary}>
          Скачать manifest.json
        </button>
      </div>

      <pre className={styles.codeBlock}>
        <code>{manifestString}</code>
      </pre>

      <div className={styles.infoNote}>
        <strong>Подсказка:</strong> Поместите файл &quot;manifest.json&quot; в корень вашего сайта и
        добавьте в <code>head</code>:
        <br />
        <code>&lt;link rel=&quot;manifest&quot; href=&quot;/manifest.json&quot;&gt;</code>
        <br /><br />
        <strong>Примечание:</strong> Иконки генерируются автоматически на основе цвета темы и первой буквы названия.
      </div>
    </div>
  );
};

export default CodeOutput;