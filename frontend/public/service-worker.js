// Service Worker v1
// Простой режим — работает из коробки

const CACHE_NAME = 'pwa-cache-v1';

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
        if (true) {
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
      if (true) {
        console.log('[SW] Захват управления страницами');
        self.clients.claim();
      }
    })
  );
});

// ========== ПЕРЕХВАТ ЗАПРОСОВ С АВТОМАТИЧЕСКИМ КЭШИРОВАНИЕМ ==========
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
          // Сохраняем в кэш для следующих раз
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
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




console.log('[SW] Service Worker загружен, версия: v1');