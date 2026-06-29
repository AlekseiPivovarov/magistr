import React, { useState, FormEvent } from 'react';
import HelpPopover from '../HelpPopover/HelpPopover';
import { useFormValidation } from '../../hooks/useFormValidation';
import { swHelpTexts } from '../../constants/swHelpTexts';
import styles from './ServiceWorkerForm.module.scss';

interface RuntimeCachingRule {
  urlPattern: string;
  handler: 'NetworkFirst' | 'CacheFirst' | 'StaleWhileRevalidate' | 'NetworkOnly' | 'CacheOnly';
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  cacheName?: string;
  maxEntries?: number;
  maxAgeSeconds?: number;
  networkTimeoutSeconds?: number;
}

interface ServiceWorkerFormProps {
  onSubmit: (config: any) => void;
  loading: boolean;
}

const validationRules = {
  cacheVersion: (value: string) => {
    if (!value.trim()) return 'Версия кэша обязательна';
    return '';
  },
  cacheName: (value: string) => {
    if (!value.trim()) return 'Имя кэша обязательно';
    return '';
  },
  offlinePage: (value: string) => {
    if (!value.trim()) return '';
    if (!value.startsWith('/')) return 'Должен начинаться с /';
    return '';
  },
  maximumFileSizeToCacheInBytes: (value: string) => {
    const num = Number(value);
    if (isNaN(num) || num <= 0) return 'Должно быть положительным числом';
    return '';
  },
};

const initialValues = {
  cacheVersion: 'v1',
  cacheName: 'pwa-cache',
  offlinePage: '',
  skipWaiting: 'true',
  clientsClaim: 'true',
  enablePushNotifications: 'false',
  enableBackgroundSync: 'false',
  maximumFileSizeToCacheInBytes: '2097152',
};

const ServiceWorkerForm: React.FC<ServiceWorkerFormProps> = ({ onSubmit, loading }) => {
  const { values, errors, handleChange, validateForm, resetForm } = useFormValidation(
    initialValues,
    validationRules
  );

  // ⭐ Только для Precache!
  const [precacheMode, setPrecacheMode] = useState<'simple' | 'advanced'>('simple');
  const [precacheList, setPrecacheList] = useState<string[]>([
    '/',
    '/index.html',
    '/manifest.json',
  ]);
  const [runtimeCaching, setRuntimeCaching] = useState<RuntimeCachingRule[]>([]);
  const [newRule, setNewRule] = useState<RuntimeCachingRule>({
    urlPattern: '/api/.*',
    handler: 'NetworkFirst',
    method: 'GET',
    cacheName: 'api-cache',
    maxEntries: 50,
    maxAgeSeconds: 86400,
    networkTimeoutSeconds: 5,
  });

  const handlePrecacheChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const items = value.split(',').map((item) => item.trim());
    setPrecacheList(items);
  };

  const addRuntimeRule = () => {
    if (newRule.urlPattern) {
      setRuntimeCaching([...runtimeCaching, { ...newRule }]);
      setNewRule({
        urlPattern: '/api/.*',
        handler: 'NetworkFirst',
        method: 'GET',
        cacheName: 'api-cache',
        maxEntries: 50,
        maxAgeSeconds: 86400,
        networkTimeoutSeconds: 5,
      });
    }
  };

  const removeRuntimeRule = (index: number) => {
    setRuntimeCaching(runtimeCaching.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        precacheMode,
        ...values,
        skipWaiting: values.skipWaiting === 'true',
        clientsClaim: values.clientsClaim === 'true',
        enablePushNotifications: values.enablePushNotifications === 'true',
        enableBackgroundSync: values.enableBackgroundSync === 'true',
        maximumFileSizeToCacheInBytes: Number(values.maximumFileSizeToCacheInBytes),
        precacheList: precacheMode === 'simple' 
          ? ['/', '/index.html', '/manifest.json'] 
          : precacheList,
        runtimeCaching,
      });
    }
  };

  const handleResetClick = () => {
    resetForm();
    setPrecacheMode('simple');
    setPrecacheList(['/', '/index.html', '/manifest.json']);
    setRuntimeCaching([]);
  };

  const getCheckboxValue = (value: string) => value === 'true';
  const isSimpleMode = precacheMode === 'simple';

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Service Worker Configuration</h2>

      <div className={styles.formGrid}>
        {/* Колонка 1: Основные настройки */}
        <div className={styles.formSection}>
          <h3>Основные настройки</h3>

          <div className={styles.formGroup}>
            <label htmlFor="cacheVersion">
              Версия кэша
              <HelpPopover textKey="cacheVersion" texts={swHelpTexts} />
            </label>
            <input
              type="text"
              id="cacheVersion"
              name="cacheVersion"
              value={values.cacheVersion}
              onChange={handleChange}
              placeholder="v1"
              className={errors.cacheVersion ? styles.errorInput : ''}
            />
            {errors.cacheVersion && <span className={styles.errorMessage}>{errors.cacheVersion}</span>}
            <small>Измените версию, чтобы обновить кэш</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cacheName">
              Имя кэша
              <HelpPopover textKey="cacheName" texts={swHelpTexts} />
            </label>
            <input
              type="text"
              id="cacheName"
              name="cacheName"
              value={values.cacheName}
              onChange={handleChange}
              placeholder="pwa-cache"
              className={errors.cacheName ? styles.errorInput : ''}
            />
            {errors.cacheName && <span className={styles.errorMessage}>{errors.cacheName}</span>}
            <small>Базовое имя хранилища кэша</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="offlinePage">
              Страница офлайн режима
              <HelpPopover textKey="offlinePage" texts={swHelpTexts} />
            </label>
            <input
              type="text"
              id="offlinePage"
              name="offlinePage"
              value={values.offlinePage}
              onChange={handleChange}
              placeholder=" /offline.html (оставьте пустым)"
              className={errors.offlinePage ? styles.errorInput : ''}
            />
            {errors.offlinePage && <span className={styles.errorMessage}>{errors.offlinePage}</span>}
            <small>Если оставить пустым, офлайн-страница не используется</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="maximumFileSizeToCacheInBytes">
              Максимальный размер файла (байт)
              <HelpPopover textKey="maximumFileSizeToCacheInBytes" texts={swHelpTexts} />
            </label>
            <input
              type="number"
              id="maximumFileSizeToCacheInBytes"
              name="maximumFileSizeToCacheInBytes"
              value={values.maximumFileSizeToCacheInBytes}
              onChange={handleChange}
              className={errors.maximumFileSizeToCacheInBytes ? styles.errorInput : ''}
            />
            {errors.maximumFileSizeToCacheInBytes && (
              <span className={styles.errorMessage}>{errors.maximumFileSizeToCacheInBytes}</span>
            )}
            <small>По умолчанию: 2MB (2097152 байт)</small>
          </div>
        </div>

        {/* Колонка 2: Поведение */}
        <div className={styles.formSection}>
          <h3>Поведение</h3>

          <div className={styles.checkboxGroup}>
            <label htmlFor="skipWaiting">
              <input
                type="checkbox"
                id="skipWaiting"
                name="skipWaiting"
                checked={getCheckboxValue(values.skipWaiting)}
                onChange={handleChange}
              />
              <span className={styles.customCheckbox}></span>
              Skip Waiting
              <HelpPopover textKey="skipWaiting" texts={swHelpTexts} />
            </label>
          </div>

          <div className={styles.checkboxGroup}>
            <label htmlFor="clientsClaim">
              <input
                type="checkbox"
                id="clientsClaim"
                name="clientsClaim"
                checked={getCheckboxValue(values.clientsClaim)}
                onChange={handleChange}
              />
              <span className={styles.customCheckbox}></span>
              Clients Claim
              <HelpPopover textKey="clientsClaim" texts={swHelpTexts} />
            </label>
          </div>

          <div className={styles.checkboxGroup}>
            <label htmlFor="enablePushNotifications">
              <input
                type="checkbox"
                id="enablePushNotifications"
                name="enablePushNotifications"
                checked={getCheckboxValue(values.enablePushNotifications)}
                onChange={handleChange}
              />
              <span className={styles.customCheckbox}></span>
              Push уведомления
              <HelpPopover textKey="enablePushNotifications" texts={swHelpTexts} />
            </label>
          </div>

          <div className={styles.checkboxGroup}>
            <label htmlFor="enableBackgroundSync">
              <input
                type="checkbox"
                id="enableBackgroundSync"
                name="enableBackgroundSync"
                checked={getCheckboxValue(values.enableBackgroundSync)}
                onChange={handleChange}
              />
              <span className={styles.customCheckbox}></span>
              Background Sync
              <HelpPopover textKey="enableBackgroundSync" texts={swHelpTexts} />
            </label>
          </div>
        </div>

        {/* Колонка 3: Precache */}
        <div className={styles.formSection}>
          <div className={styles.precacheHeader}>
            <h3>Предварительное кэширование</h3>
            <div className={styles.precacheModeToggle}>
              <button
                type="button"
                className={`${styles.modeBtn} ${precacheMode === 'simple' ? styles.active : ''}`}
                onClick={() => setPrecacheMode('simple')}
              >
                Простой
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${precacheMode === 'advanced' ? styles.active : ''}`}
                onClick={() => setPrecacheMode('advanced')}
              >
                Расширенный
              </button>
            </div>
          </div>

          {isSimpleMode ? (
            <div className={styles.simpleModeInfo}>
              <p>Кэширует только:</p>
              <ul>
                <li><code>/</code> — главная страница</li>
                <li><code>/index.html</code> — HTML</li>
                <li><code>/manifest.json</code> — манифест</li>
              </ul>
              <small>Остальные файлы кэшируются автоматически при запросе</small>
            </div>
          ) : (
            <div className={styles.formGroup}>
              <label htmlFor="precacheList">
                Список файлов для кэширования
                <HelpPopover textKey="precacheList" texts={swHelpTexts} />
              </label>
              <textarea
                id="precacheList"
                name="precacheList"
                value={precacheList.join(', ')}
                onChange={handlePrecacheChange}
                rows={6}
                placeholder="/, /index.html, /manifest.json, /styles.css, /app.js"
              />
              <small>Укажите файлы через запятую</small>
            </div>
          )}
        </div>
      </div>

      {/* Динамическое кэширование */}
      <div className={styles.fullWidthSection}>
        <h3>Динамическое кэширование (Runtime Caching)</h3>

        <div className={styles.addRulePanel}>
          <h4>Добавить правило</h4>
          <div className={styles.addRuleGrid}>
            <div>
              <label>
                URL Pattern
                <HelpPopover textKey="urlPattern" texts={swHelpTexts} />
              </label>
              <input
                type="text"
                value={newRule.urlPattern}
                onChange={(e) => setNewRule({ ...newRule, urlPattern: e.target.value })}
                placeholder="/api/.*"
              />
            </div>
            <div>
              <label>
                Стратегия
                <HelpPopover textKey="handler" texts={swHelpTexts} />
              </label>
              <select
                value={newRule.handler}
                onChange={(e) =>
                  setNewRule({
                    ...newRule,
                    handler: e.target.value as RuntimeCachingRule['handler'],
                  })
                }
              >
                <option value="NetworkFirst">Network First</option>
                <option value="CacheFirst">Cache First</option>
                <option value="StaleWhileRevalidate">Stale While Revalidate</option>
                <option value="NetworkOnly">Network Only</option>
                <option value="CacheOnly">Cache Only</option>
              </select>
            </div>
            <div>
              <label>
                Имя кэша
                <HelpPopover textKey="cacheName" texts={swHelpTexts} />
              </label>
              <input
                type="text"
                value={newRule.cacheName}
                onChange={(e) => setNewRule({ ...newRule, cacheName: e.target.value })}
                placeholder="api-cache"
              />
            </div>
            <div>
              <label>
                Макс. записей
                <HelpPopover textKey="maxEntries" texts={swHelpTexts} />
              </label>
              <input
                type="number"
                value={newRule.maxEntries}
                onChange={(e) => setNewRule({ ...newRule, maxEntries: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label>
                Время жизни (сек)
                <HelpPopover textKey="maxAgeSeconds" texts={swHelpTexts} />
              </label>
              <input
                type="number"
                value={newRule.maxAgeSeconds}
                onChange={(e) =>
                  setNewRule({ ...newRule, maxAgeSeconds: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
          <button type="button" onClick={addRuntimeRule} className={styles.addRuleBtn}>
            Добавить правило
          </button>
        </div>

        {runtimeCaching.length > 0 && (
          <div className={styles.rulesList}>
            <h4>Активные правила ({runtimeCaching.length})</h4>
            {runtimeCaching.map((rule, index) => (
              <div key={index} className={styles.ruleItem}>
                <div className={styles.ruleInfo}>
                  <strong>{rule.urlPattern}</strong> → {rule.handler}
                  {rule.cacheName && ` (cache: ${rule.cacheName})`}
                </div>
                <button
                  type="button"
                  onClick={() => removeRuntimeRule(index)}
                  className={styles.removeRuleBtn}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.formActions}>
        <button type="submit" disabled={loading} className={styles.btnPrimary}>
          {loading ? 'Генерация Service Worker...' : 'Сгенерировать Service Worker'}
        </button>
        <button type="button" onClick={handleResetClick} className={styles.btnSecondary}>
          Сбросить
        </button>
      </div>
    </form>
  );
};

export default ServiceWorkerForm;