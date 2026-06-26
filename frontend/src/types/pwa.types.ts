export type DisplayMode = 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
export type Orientation = 'any' | 'natural' | 'landscape' | 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';
export type CacheStrategy = 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only' | 'cache-only';

export interface Icon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

export interface Shortcut {
  name: string;
  short_name?: string;
  description?: string;
  url: string;
  icons?: Icon[];
}

export interface RuntimeCachingRule {
  urlPattern: string | RegExp;
  handler: CacheStrategy;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  options?: {
    cacheName?: string;
    expiration?: {
      maxEntries?: number;
      maxAgeSeconds?: number;
    };
    networkTimeoutSeconds?: number;
    backgroundSync?: {
      name: string;
      options?: object;
    };
  };
}

export interface PWAConfig {
  // Manifest config
  appName: string;
  shortName: string;
  description?: string;
  startUrl: string;
  themeColor: string;
  backgroundColor: string;
  display: DisplayMode;
  orientation?: Orientation;
  icons?: Icon[];
  shortcuts?: Shortcut[];
  categories?: string[];
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  preferRelatedApplications?: boolean;
  relatedApplications?: Array<{
    platform: string;
    url: string;
    id?: string;
  }>;
  
  // Service Worker config
  cacheVersion?: string;
  cacheName?: string;
  cacheStrategy: CacheStrategy;
  offlinePage?: string;
  offlineFallback?: boolean;
  runtimeCaching: RuntimeCachingRule[];
  precacheList?: string[];
  skipWaiting?: boolean;
  clientsClaim?: boolean;
  navigateFallback?: string;
  navigateFallbackAllowlist?: RegExp[];
  cleanupOutdatedCaches?: boolean;
  maximumFileSizeToCacheInBytes?: number;
  
  // Additional settings
  enablePushNotifications?: boolean;
  vapidPublicKey?: string;
  enableBackgroundSync?: boolean;
  enablePeriodicSync?: boolean;
}

export interface GeneratedServiceWorker {
  code: string;
  version: string;
  timestamp: string;
  size: number;
}

export interface GeneratedManifest {
  code: string;
  json: object;
  timestamp: string;
  size: number;
}

export interface GenerationResult {
  serviceWorker: GeneratedServiceWorker;
  manifest: GeneratedManifest;
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}