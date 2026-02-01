/**
 * Validation middleware helper
 * Centralizuje validaciju i rukovanje greškama
 */

import { ZodSchema } from 'zod';
import { redirectWithValidationErrors, toDateInput } from '../helpers/url';

/**
 * Rezultat validacije
 */
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: Record<string, string[] | undefined>;
};

/**
 * Validira form data sa Zod schema
 */
export function validateFormData<T>(
  schema: ZodSchema<T>,
  data: Record<string, unknown>
): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);

    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      success: false,
      errors: { _form: ['Validation failed'] },
    };
  }
}

/**
 * Middleware funkcija za validaciju i automatski redirect kod greške
 */
export async function validateWithRedirect<T>(
  schema: ZodSchema<T>,
  formData: FormData,
  redirectPath: string,
  lang?: string
): Promise<T> {
  // Ekstrauj sve podatke iz FormData
  const data: Record<string, unknown> = {};
  const formValues: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value;
    formValues[key] = value;
  }

  // Validacija
  const result = validateFormData(schema, data);

  if (!result.success) {
    // Redirect sa greškama i vrijednostima
    redirectWithValidationErrors(redirectPath, result.errors, formValues, lang);
  }

  return result.data;
}

/**
 * Ekstrauje FormData u object
 */
export function extractFormData(formData: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }

  return data;
}

/**
 * Priprema form data za validaciju (konverzije tipova itd.)
 */
export function prepareFormDataForValidation(
  formData: FormData,
  dateFields: string[] = []
): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (dateFields.includes(key)) {
      // Konvertuj date polja
      data[key] = toDateInput(value);
    } else {
      data[key] = value;
    }
  }

  return data;
}

/**
 * Helper za kreiranje error response
 */
export function createValidationErrorResponse(
  errors: Record<string, string[] | undefined>
): {
  success: false;
  errors: Record<string, string>;
} {
  const formattedErrors: Record<string, string> = {};

  Object.entries(errors).forEach(([key, value]) => {
    if (value && value[0]) {
      formattedErrors[key] = value[0];
    }
  });

  return {
    success: false,
    errors: formattedErrors,
  };
}

/**
 * Async validacija sa custom async rules
 */
export async function validateWithAsyncRules<T>(
  schema: ZodSchema<T>,
  data: Record<string, unknown>,
  asyncRules?: Array<(data: T) => Promise<boolean>>
): Promise<ValidationResult<T>> {
  // Prvo validiraj sa Zod
  const result = validateFormData(schema, data);

  if (!result.success) {
    return result;
  }

  // Ako ima async pravila, provjeri ih
  if (asyncRules && asyncRules.length > 0) {
    for (const rule of asyncRules) {
      const isValid = await rule(result.data);
      if (!isValid) {
        return {
          success: false,
          errors: { _form: ['Async validation failed'] },
        };
      }
    }
  }

  return result;
}
