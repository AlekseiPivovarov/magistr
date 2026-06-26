import { PWAConfig, CacheStrategy, DisplayMode } from '../types/pwa.types';

export const defaultConfig: PWAConfig = {
  appName: 'My PWA App',
  shortName: 'PWA App',
  description: 'Моё первое Progressive Web App',
  startUrl: '/',
  themeColor: '#ffffff',
  backgroundColor: '#000000',
  display: 'standalone' as DisplayMode,
  orientation: 'portrait',
  cacheStrategy: 'cache-first' as CacheStrategy,
  offlinePage: '/offline.html',
  offlineFallback: true,
  runtimeCaching: [
    {
      urlPattern: '/api/*',
      handler: 'network-first' as CacheStrategy,
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 86400, // 24 часа
        },
      },
    },
    {
      urlPattern: '\\.(?:png|gif|jpg|jpeg|svg|webp)$',
      handler: 'cache-first' as CacheStrategy,
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 604800, // 7 дней
        },
      },
    },
  ],
  precacheList: ['/', '/index.html', '/offline.html', '/styles.css', '/main.js'],
  skipWaiting: true,
  clientsClaim: true,
  navigateFallback: '/offline.html',
  cleanupOutdatedCaches: true,
  maximumFileSizeToCacheInBytes: 2 * 1024 * 1024, // 2MB
  enablePushNotifications: false,
  enableBackgroundSync: false,
  enablePeriodicSync: false,
};
