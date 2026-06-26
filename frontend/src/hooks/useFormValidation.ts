import { useState, useCallback, ChangeEvent } from 'react';

interface ValidationRule {
  (value: string): string;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface UseFormValidationReturn<T> {
  values: T;
  setValues: React.Dispatch<React.SetStateAction<T>>;
  errors: Partial<Record<keyof T, string>>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof T, string>>>>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  validateForm: () => boolean;
  resetForm: () => void;
}

/**
 * Хук для валидации форм
 * @param initialValues - Начальные значения формы
 * @param validationRules - Правила валидации для каждого поля
 * @returns Объект с состоянием формы и функциями для работы с ней
 */
export const useFormValidation = <T extends Record<string, string>>(
  initialValues: T,
  validationRules: ValidationRules
): UseFormValidationReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, type } = e.target;
      let newValue: string;
      
      // Определяем тип поля и получаем значение
      if (type === 'checkbox') {
        const target = e.target as HTMLInputElement;
        newValue = target.checked ? 'true' : 'false';
      } else {
        newValue = e.target.value;
      }
      
      // Обновляем значения
      setValues((prev) => ({ ...prev, [name]: newValue }));
      
      // Валидируем поле
      const rule = validationRules[name];
      if (rule) {
        const error = rule(newValue);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validationRules]
  );

  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    (Object.keys(values) as Array<keyof T>).forEach((key) => {
      const rule = validationRules[key as string];
      if (rule) {
        const error = rule(values[key]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    setValues,
    errors,
    setErrors,
    handleChange,
    validateForm,
    resetForm,
  };
};