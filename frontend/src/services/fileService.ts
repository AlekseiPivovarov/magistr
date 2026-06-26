// Сервис для работы с файлами и буфером обмена

/**
 * Копирует текст в буфер обмена
 * @param text - Текст для копирования
 * @returns Promise<boolean> - успешность операции
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Ошибка копирования:', error);
    return false;
  }
};

/**
 * Скачивает файл
 * @param content - Содержимое файла
 * @param filename - Имя файла
 * @param type - MIME тип файла
 */
export const downloadFile = (content: string, filename: string, type: string): void => {
  try {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка скачивания:', error);
  }
};

/**
 * Скачивает JSON файл
 * @param json - JSON объект
 * @param filename - Имя файла
 */
export const downloadJSON = (json: object, filename: string): void => {
  const content = JSON.stringify(json, null, 2);
  downloadFile(content, filename, 'application/json');
};

/**
 * Скачивает JavaScript файл
 * @param content - Содержимое JS файла
 * @param filename - Имя файла
 */
export const downloadJS = (content: string, filename: string): void => {
  downloadFile(content, filename, 'text/javascript');
};