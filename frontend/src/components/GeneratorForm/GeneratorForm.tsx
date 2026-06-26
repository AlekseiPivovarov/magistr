import React, { useState, ChangeEvent, FormEvent } from 'react';
import HelpPopover from '../HelpPopover/HelpPopover';
import { manifestHelpTexts } from '../../constants/manifestHelpTexts';
import styles from './GeneratorForm.module.scss';

interface GeneratorFormProps {
  onSubmit: (config: any) => void;
  loading: boolean;
}

// Правила валидации
const validationRules = {
  name: (value: string) => {
    if (!value.trim()) return 'Название обязательно';
    if (value.length > 45) return 'Не более 45 символов';
    return '';
  },
  shortName: (value: string) => {
    if (!value.trim()) return 'Короткое название обязательно';
    if (value.length > 12) return 'Не более 12 символов';
    return '';
  },
  startUrl: (value: string) => {
    if (!value.trim()) return 'Start URL обязателен';
    if (!value.startsWith('/')) return 'Должен начинаться с /';
    return '';
  },
  themeColor: (value: string) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
      return 'Неверный формат. Используйте HEX (#RRGGBB)';
    }
    return '';
  },
  backgroundColor: (value: string) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
      return 'Неверный формат. Используйте HEX (#RRGGBB)';
    }
    return '';
  },
};

// Начальные значения
const initialValues = {
  name: 'Моё PWA Приложение',
  shortName: 'PWA App',
  description: 'Отличное прогрессивное веб-приложение',
  startUrl: '/',
  themeColor: '#333333',
  backgroundColor: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  scope: '/',
  lang: 'ru-RU',
};

const GeneratorForm: React.FC<GeneratorFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string): string => {
    const rule = validationRules[name as keyof typeof validationRules];
    return rule ? rule(value) : '';
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value as string);
      if (error) newErrors[key] = error;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Параметры Web App Manifest</h2>

      <div className={styles.formGrid}>
        <div className={styles.formSection}>
          <h3>Основная информация</h3>

          <div className={styles.formGroup}>
            <label htmlFor="name">
              Название приложения
              <HelpPopover textKey="name" texts={manifestHelpTexts} />
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? styles.errorInput : ''}
            />
            {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
            <small>Полное название (до 45 символов)</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="shortName">
              Короткое название
              <HelpPopover textKey="shortName" texts={manifestHelpTexts} />
            </label>
            <input
              type="text"
              id="shortName"
              name="shortName"
              value={formData.shortName}
              onChange={handleChange}
              maxLength={12}
              className={errors.shortName ? styles.errorInput : ''}
            />
            {errors.shortName && <span className={styles.errorMessage}>{errors.shortName}</span>}
            <small>Отображается под иконкой (до 12 символов)</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">
              Описание
              <HelpPopover textKey="description" texts={manifestHelpTexts} />
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Краткое описание вашего приложения"
            />
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>Визуальные настройки</h3>

          <div className={styles.formGroup}>
            <label htmlFor="themeColor">Цвет темы</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className={styles.colorInputGroup}>
                <input
                  type="color"
                  id="themeColor"
                  name="themeColor"
                  value={formData.themeColor}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="themeColor"
                  value={formData.themeColor}
                  onChange={handleChange}
                  className={errors.themeColor ? styles.errorInput : ''}
                />
              </div>
              <HelpPopover textKey="themeColor" texts={manifestHelpTexts} />
            </div>
            {errors.themeColor && <span className={styles.errorMessage}>{errors.themeColor}</span>}
            <small>Цвет панели навигации браузера</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="backgroundColor">Цвет фона</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className={styles.colorInputGroup}>
                <input
                  type="color"
                  id="backgroundColor"
                  name="backgroundColor"
                  value={formData.backgroundColor}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="backgroundColor"
                  value={formData.backgroundColor}
                  onChange={handleChange}
                  className={errors.backgroundColor ? styles.errorInput : ''}
                />
              </div>
              <HelpPopover textKey="backgroundColor" texts={manifestHelpTexts} />
            </div>
            {errors.backgroundColor && (
              <span className={styles.errorMessage}>{errors.backgroundColor}</span>
            )}
            <small>Цвет фона при загрузке приложения</small>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>Настройки отображения</h3>

          <div className={styles.formGroup}>
            <label htmlFor="display">
              Режим отображения
              <HelpPopover textKey="display" texts={manifestHelpTexts} />
            </label>
            <select id="display" name="display" value={formData.display} onChange={handleChange}>
              <option value="fullscreen">Fullscreen - Полный экран</option>
              <option value="standalone">Standalone - Отдельное окно</option>
              <option value="minimal-ui">Minimal UI - Минимальный интерфейс</option>
              <option value="browser">Browser - Обычный браузер</option>
            </select>
            <small>Как будет открываться приложение</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="orientation">
              Ориентация
              <HelpPopover textKey="orientation" texts={manifestHelpTexts} />
            </label>
            <select
              id="orientation"
              name="orientation"
              value={formData.orientation}
              onChange={handleChange}
            >
              <option value="any">Any - Любая</option>
              <option value="portrait">Portrait - Портретная</option>
              <option value="landscape">Landscape - Ландшафтная</option>
            </select>
            <small>Предпочтительная ориентация экрана</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="startUrl">
              Start URL
              <HelpPopover textKey="startUrl" texts={manifestHelpTexts} />
            </label>
            <input
              type="text"
              id="startUrl"
              name="startUrl"
              value={formData.startUrl}
              onChange={handleChange}
              className={errors.startUrl ? styles.errorInput : ''}
            />
            {errors.startUrl && <span className={styles.errorMessage}>{errors.startUrl}</span>}
            <small>Стартовая страница приложения</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="scope">
              Область действия (Scope)
              <HelpPopover textKey="scope" texts={manifestHelpTexts} />
            </label>
            <input
              type="text"
              id="scope"
              name="scope"
              value={formData.scope}
              onChange={handleChange}
              placeholder="/"
            />
            <small>Какие URL принадлежат приложению</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lang">
              Язык
              <HelpPopover textKey="lang" texts={manifestHelpTexts} />
            </label>
            <select id="lang" name="lang" value={formData.lang} onChange={handleChange}>
              <option value="ru-RU">Русский</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="de-DE">Deutsch</option>
              <option value="fr-FR">Français</option>
            </select>
            <small>Предпочтительный язык приложения</small>
          </div>
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="submit" disabled={loading} className={styles.btnPrimary}>
          {loading ? 'Генерация...' : 'Сгенерировать Manifest'}
        </button>
      </div>
    </form>
  );
};

export default GeneratorForm;