import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './HelpPopover.module.scss';

interface HelpPopoverProps {
  textKey: string;
  texts: Record<string, { title: string; description: string; example?: string }>;
}

const HelpPopover: React.FC<HelpPopoverProps> = ({ textKey, texts }) => {
  const [isOpen, setIsOpen] = useState(false);

  const text = texts[textKey];

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Сохраняем ширину скроллбара
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // Компенсируем исчезновение скроллбара
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  const handleOpen = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!text) {
    console.warn(`HelpPopover: textKey "${textKey}" not found in texts`);
    return null;
  }

  const { title, description, example } = text;

  return (
    <>
      <span
        className={styles.helpIcon}
        onClick={handleOpen}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        role="button"
        tabIndex={0}
        aria-label="Помощь"
      >
        ?
      </span>

      {isOpen && ReactDOM.createPortal(
        <div className={styles.overlay} onClick={handleOverlayClick}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <strong>{title}</strong>
              <button
                className={styles.closeBtn}
                onClick={handleClose}
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>{description}</p>
              {example && (
                <div className={styles.example}>
                  <small>Пример:</small>
                  <code>{example}</code>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default HelpPopover;