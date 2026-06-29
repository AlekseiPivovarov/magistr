import React, { useState } from 'react';
import ReactDOM from 'react-dom';
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
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  const handleOpenInstruction = () => setIsInstructionOpen(true);
  const handleCloseInstruction = () => setIsInstructionOpen(false);

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
        <button onClick={handleOpenInstruction} className={styles.btnSecondary}>
          Инструкция
        </button>
      </div>

      <pre className={styles.codeBlock}>
        <code>{manifestString}</code>
      </pre>

      {isInstructionOpen && ReactDOM.createPortal(
        <div className={styles.overlay} onClick={handleCloseInstruction}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleCloseInstruction}>
              ×
            </button>

            <h2 className={styles.modalTitle}>
              Инструкция по подключению Web App Manifest
            </h2>

            <div className={styles.modalBody}>
              <p>
                <strong>1. Поместите файл в корень сайта</strong>
              </p>
              <p>
                Скопируйте <code>manifest.json</code> в корневую папку вашего сайта
              </p>

              <p>
                <strong>2. Добавьте ссылку на манифест в index.html</strong>
              </p>
              <p>
                Добавьте этот код в <code>&lt;head&gt;</code> вашего <code>index.html</code>:
              </p>
              <pre className={styles.codeSnippet}>
{`<link rel="manifest" href="/manifest.json">`}
              </pre>

              <p>
                <strong>3. Добавьте мета-теги для лучшей совместимости</strong>
              </p>
              <p>
                Рекомендуется также добавить следующие мета-теги в <code>&lt;head&gt;</code>:
              </p>
              <pre className={styles.codeSnippet}>
{`<meta name="theme-color" content="#333333">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="PWA App">`}
              </pre>

              <p>
                <strong>4. Проверка в браузере</strong>
              </p>
              <ul>
                <li><code>F12 → Application → Manifest</code> — должны отображаться данные манифеста</li>
                <li><code>Application → Service Workers</code> — статус <strong>activated and running</strong></li>
                <li><code>Network</code> — файл <code>manifest.json</code> должен загружаться со статусом 200</li>
              </ul>

              <p>
                <strong>5. Иконки для установки PWA</strong>
              </p>
              <p>
                Манифест содержит встроенные SVG-иконки-заглушки. 
                Для публикации замените их на реальные PNG-файлы указанных размеров:
              </p>
              <pre className={styles.codeSnippet}>
{`/icon-72x72.png
/icon-96x96.png
/icon-128x128.png
/icon-144x144.png
/icon-152x152.png
/icon-192x192.png
/icon-384x384.png
/icon-512x512.png`}
              </pre>

              <div className={styles.warningNote}>
                <strong>Важные замечания</strong>
                <ul>
                  <li>Манифест должен быть доступен по HTTPS или localhost</li>
                  <li>Поле <code>start_url</code> должно указывать на существующую страницу</li>
                  <li>Для установки PWA обязательны иконки размером 192x192 и 512x512 пикселей</li>
                  <li>После изменений в манифесте очистите кэш браузера (Ctrl+Shift+Delete)</li>
                </ul>
              </div>
            </div>

            <button className={styles.modalBtn} onClick={handleCloseInstruction}>
              Закрыть
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CodeOutput;