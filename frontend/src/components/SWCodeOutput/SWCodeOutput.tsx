import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { copyToClipboard, downloadJS } from '../../services/fileService';
import styles from './SWCodeOutput.module.scss';

interface SWCodeOutputProps {
  config: {
    precacheMode?: 'simple' | 'advanced';
    cacheVersion: string;
    cacheName: string;
    offlinePage: string;
    skipWaiting: boolean;
    clientsClaim: boolean;
    precacheList: string[];
    runtimeCaching: Array<{
      urlPattern: string;
      handler: string;
      cacheName?: string;
      maxEntries?: number;
      maxAgeSeconds?: number;
    }>;
    enablePushNotifications: boolean;
    enableBackgroundSync: boolean;
    maximumFileSizeToCacheInBytes: number;
  };
}

const SWCodeOutput: React.FC<SWCodeOutputProps> = ({ config }) => {
  const [copied, setCopied] = useState(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  const handleOpenInstruction = () => setIsInstructionOpen(true);
  const handleCloseInstruction = () => setIsInstructionOpen(false);

  // ========== ПРОСТОЙ РЕЖИМ ==========
  const generateSimpleSW = () => {
    return `// Service Worker ${config.cacheVersion}
// Простой режим — работает из коробки

const CACHE_NAME = '${config.cacheName}-${config.cacheVersion}';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// ========== УСТАНОВКА ==========
self.addEventListener('install', (event) => {
  console.log('[SW] Установка');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Кэширование файлов...');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        if (${config.skipWaiting}) {
          console.log('[SW] Немедленная активация');
          self.skipWaiting();
        }
      })
      .catch((err) => console.warn('[SW] Ошибка кэширования:', err))
  );
});

// ========== АКТИВАЦИЯ ==========
self.addEventListener('activate', (event) => {
  console.log('[SW] Активация');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Удаляем старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      if (${config.clientsClaim}) {
        console.log('[SW] Захват управления страницами');
        self.clients.claim();
      }
    })
  );
});

// ========== ПЕРЕХВАТ ЗАПРОСОВ ==========
self.addEventListener('fetch', (event) => {
  console.log('[SW] Запрос:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('[SW] Из кэша:', event.request.url);
          return response;
        }
        console.log('[SW] Из сети и кэшируем:', event.request.url);
        return fetch(event.request).then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return networkResponse;
        });
      })
      .catch(() => {
        console.log('[SW] Ошибка, возвращаем главную страницу');
        return caches.match('/');
      })
  );
});

${config.enablePushNotifications ? `
// ========== PUSH УВЕДОМЛЕНИЯ ==========
self.addEventListener('push', (event) => {
  console.log('[SW] Получено push-уведомление');
  
  if (Notification.permission !== 'granted') {
    console.log('[SW] Нет разрешения на показ уведомлений');
    return;
  }
  
  let title = 'PWA Generator';
  let options = {
    body: 'Новое уведомление',
    icon: '/icon-192x192.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200]
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      options.body = data.body || options.body;
      if (data.icon) options.icon = data.icon;
      if (data.badge) options.badge = data.badge;
    } catch (e) {
      options.body = event.data.text();
      console.log('[SW] Текст уведомления:', options.body);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('[SW] Уведомление показано'))
      .catch(err => console.error('[SW] Ошибка показа:', err))
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Клик по уведомлению');
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
  );
});
` : ''}

${config.enableBackgroundSync ? `
// ========== BACKGROUND SYNC ==========
self.addEventListener('sync', (event) => {
  console.log('[SW] Событие синхронизации:', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[SW] Синхронизация данных...');
}
` : ''}

console.log('[SW] Service Worker загружен, версия: ${config.cacheVersion}');`;
  };

  // ========== РАСШИРЕННЫЙ РЕЖИМ ==========
  const generateAdvancedSW = () => {
    const precacheList = JSON.stringify(config.precacheList, null, 2);
    const hasOfflinePage = config.offlinePage && config.offlinePage.trim() !== '';
    const offlinePageValue = hasOfflinePage ? `'${config.offlinePage}'` : 'null';

    const runtimeRules = config.runtimeCaching
      .map((rule) => {
        return `  {
    urlPattern: /${rule.urlPattern.replace(/\//g, '\\/')}/,
    handler: '${rule.handler}',
    cacheName: '${rule.cacheName || config.cacheName}',
    maxEntries: ${rule.maxEntries || 100},
    maxAgeSeconds: ${rule.maxAgeSeconds || 86400}
  }`;
      })
      .join(',');

    const offlineCode = hasOfflinePage
      ? `const OFFLINE_URL = ${offlinePageValue};`
      : `const OFFLINE_URL = null;`;

    const networkFirstStrategy = hasOfflinePage
      ? `
  NetworkFirst: async (request) => {
    try {
      const response = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;
      return caches.match(OFFLINE_URL);
    }
  },`
      : `
  NetworkFirst: async (request) => {
    try {
      const response = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;
      return new Response('Офлайн-режим', { status: 200 });
    }
  },`;

    return `// Service Worker ${config.cacheVersion}
// Расширенный режим — полный контроль

const CACHE_NAME = '${config.cacheName}-${config.cacheVersion}';
${offlineCode}

const PRECACHE_URLS = ${precacheList};

// ========== УСТАНОВКА ==========
self.addEventListener('install', (event) => {
  console.log('[SW] Установка');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Кэширование файлов...');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        if (${config.skipWaiting}) {
          console.log('[SW] Немедленная активация');
          self.skipWaiting();
        }
      })
      .catch((err) => console.warn('[SW] Ошибка кэширования:', err))
  );
});

// ========== АКТИВАЦИЯ ==========
self.addEventListener('activate', (event) => {
  console.log('[SW] Активация');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Удаляем старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      if (${config.clientsClaim}) {
        console.log('[SW] Захват управления страницами');
        self.clients.claim();
      }
    })
  );
});

// ========== СТРАТЕГИИ КЭШИРОВАНИЯ ==========
const strategies = {
  ${networkFirstStrategy}
  
  CacheFirst: async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  },
  
  StaleWhileRevalidate: async (request) => {
    const cachedResponse = await caches.match(request);
    const fetchPromise = fetch(request).then((response) => {
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, response.clone());
      });
      return response;
    });
    return cachedResponse || fetchPromise;
  },
  
  NetworkOnly: async (request) => {
    return fetch(request);
  },
  
  CacheOnly: async (request) => {
    return caches.match(request);
  }
};

// ========== ПРАВИЛА КЭШИРОВАНИЯ ==========
const RUNTIME_CACHING_RULES = [${runtimeRules}];

// ========== ПЕРЕХВАТ ЗАПРОСОВ ==========
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/manifest.json' || url.pathname === '/service-worker.js') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  const rule = RUNTIME_CACHING_RULES.find((r) => r.urlPattern.test(url.pathname));
  
  if (rule && strategies[rule.handler]) {
    event.respondWith(strategies[rule.handler](event.request));
  } else if (event.request.mode === 'navigate') {
    event.respondWith(strategies.NetworkFirst(event.request));
  } else {
    event.respondWith(strategies.StaleWhileRevalidate(event.request));
  }
});

${config.enablePushNotifications ? `
// ========== PUSH УВЕДОМЛЕНИЯ ==========
self.addEventListener('push', (event) => {
  console.log('[SW] Получено push-уведомление');
  
  if (Notification.permission !== 'granted') {
    console.log('[SW] Нет разрешения на показ уведомлений');
    return;
  }
  
  let title = 'PWA Generator';
  let options = {
    body: 'Новое уведомление',
    icon: '/icon-192x192.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200]
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      options.body = data.body || options.body;
      if (data.icon) options.icon = data.icon;
      if (data.badge) options.badge = data.badge;
    } catch (e) {
      options.body = event.data.text();
      console.log('[SW] Текст уведомления:', options.body);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('[SW] Уведомление показано'))
      .catch(err => console.error('[SW] Ошибка показа:', err))
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Клик по уведомлению');
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
  );
});
` : ''}

${config.enableBackgroundSync ? `
// ========== BACKGROUND SYNC ==========
self.addEventListener('sync', (event) => {
  console.log('[SW] Событие синхронизации:', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[SW] Синхронизация данных...');
}
` : ''}

console.log('[SW] Service Worker загружен, версия: ${config.cacheVersion}');`;
  };

  const generateServiceWorker = () => {
    const precacheMode = config.precacheMode || 'simple';
    return precacheMode === 'simple' ? generateSimpleSW() : generateAdvancedSW();
  };

  const handleCopy = async () => {
    const swCode = generateServiceWorker();
    const success = await copyToClipboard(swCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const swCode = generateServiceWorker();
    downloadJS(swCode, 'service-worker.js');
  };

  const swCode = generateServiceWorker();

  return (
    <div className={styles.container}>
      <h2>Сгенерированный Service Worker</h2>

      <div className={styles.codeActions}>
        <button onClick={handleCopy} className={styles.btnSecondary}>
          {copied ? 'Скопировано!' : 'Копировать SW'}
        </button>
        <button onClick={handleDownload} className={styles.btnSecondary}>
          Скачать service-worker.js
        </button>
        <button onClick={handleOpenInstruction} className={styles.btnSecondary}>
          Инструкция
        </button>
      </div>

      <pre className={styles.codeBlock}>
        <code>{swCode}</code>
      </pre>

      {isInstructionOpen && ReactDOM.createPortal(
        <div className={styles.overlay} onClick={handleCloseInstruction}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleCloseInstruction}>
              ×
            </button>

            <h2 className={styles.modalTitle}>
              Инструкция по подключению Service Worker
            </h2>

            <div className={styles.modalBody}>
              <p>
                <strong>1. Поместите файл в корень сайта</strong>
              </p>
              <p>
                Скопируйте <code>service-worker.js</code> в корневую папку вашего сайта
              </p>

              <p>
                <strong>2. Убедитесь, что файлы из PRECACHE_URLS существуют</strong>
              </p>
              <p>
                Все файлы из списка <code>PRECACHE_URLS</code> должны быть доступны на сервере
              </p>

              <p>
                <strong>3. Зарегистрируйте Service Worker в index.html</strong>
              </p>
              <p>
                Добавьте этот код перед закрывающим тегом <code>&lt;/body&gt;</code>:
              </p>
              <pre className={styles.codeSnippet}>
{`<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('SW зарегистрирован:', reg))
        .catch(err => console.log('Ошибка SW:', err));
    });
  }
</script>`}
              </pre>

              <p>
                <strong>4. Проверка в браузере</strong>
              </p>
              <ul>
                <li><code>F12 → Application → Service Workers</code> — статус <strong>activated and running</strong></li>
                <li><code>Application → Cache Storage</code> — есть файлы в кэше</li>
                <li>Включите <strong>Offline</strong> и обновите страницу — должна работать</li>
              </ul>

              <div className={styles.warningNote}>
                <strong>Важные замечания</strong>
                <ul>
                  <li>Service Worker работает только на <strong>HTTPS</strong> или <strong>localhost</strong></li>
                  <li>После изменений в SW нужно обновить страницу <strong>дважды</strong></li>
                  <li>Все файлы кэшируются автоматически при первом запросе</li>
                  <li>Если файл не закэшировался — просто откройте страницу с интернетом один раз</li>
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

export default SWCodeOutput;