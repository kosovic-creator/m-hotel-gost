/**
 * Standardizovane poruke za success/error/warning/info
 */

/**
 * Tipovi poruka
 */
export enum MessageType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Success poruke - operacije
 */
export enum SuccessMessage {
  ADDED = 'added',
  UPDATED = 'updated',
  DELETED = 'deleted',
  SAVED = 'saved',
  CREATED = 'created',
  SENT = 'sent',
  UPLOADED = 'uploaded',
  CONFIRMED = 'confirmed'
}

/**
 * Error poruke - razlozi
 */
export enum ErrorMessage {
  NOT_FOUND = 'not_found',
  ALREADY_EXISTS = 'exists',
  INVALID_DATA = 'invalid',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  SERVER_ERROR = 'error',
  NETWORK_ERROR = 'network',
  VALIDATION_ERROR = 'validation',
  DATABASE_ERROR = 'database'
}

/**
 * Warning poruke
 */
export enum WarningMessage {
  UNSAVED_CHANGES = 'unsaved',
  EXPIRING_SOON = 'expiring',
  DEPRECATED = 'deprecated',
  SLOW_CONNECTION = 'slow_connection'
}

/**
 * Info poruke
 */
export enum InfoMessage {
  LOADING = 'loading',
  PROCESSING = 'processing',
  EMPTY_STATE = 'empty',
  BETA_FEATURE = 'beta'
}

/**
 * Mapa poruka za različite entitete
 */
export const EntityMessages = {
  rezervacija: {
    success: {
      added: 'rezervacija_dodana',
      updated: 'rezervacija_azurirana',
      deleted: 'rezervacija_obrisana',
    },
    error: {
      not_found: 'rezervacija_nije_pronadjena',
      exists: 'rezervacija_vec_postoji',
      invalid: 'rezervacija_nevazeca',
    }
  },
  gost: {
    success: {
      added: 'gost_dodan',
      updated: 'gost_azuriran',
      deleted: 'gost_obrisan',
    },
    error: {
      not_found: 'gost_nije_pronadjen',
      exists: 'gost_vec_postoji',
      invalid: 'gost_nevazeci',
    }
  },
  korisnik: {
    success: {
      added: 'korisnik_dodan',
      updated: 'korisnik_azuriran',
      deleted: 'korisnik_obrisan',
    },
    error: {
      not_found: 'korisnik_nije_pronadjen',
      exists: 'korisnik_vec_postoji',
      invalid: 'korisnik_nevazeci',
    }
  }
} as const;

/**
 * Helper funkcija za kreiranje message key
 */
export function createMessageKey(
  entity: keyof typeof EntityMessages,
  type: 'success' | 'error',
  action: string
): string {
  const entityMessages = EntityMessages[entity];
  if (!entityMessages) return action;

  // @ts-expect-error - Dynamic access
  const message = entityMessages[type]?.[action];
  return message || action;
}

/**
 * Helper za dobijanje lokalizovane poruke
 */
export function getLocalizedMessage(
  messages: Record<string, string>,
  key: string,
  fallback?: string
): string {
  return messages[key] || fallback || key;
}

/**
 * CSS klase za različite tipove poruka
 */
export const MessageStyles = {
  [MessageType.SUCCESS]: 'bg-green-50 border-green-200 text-green-800',
  [MessageType.ERROR]: 'bg-red-50 border-red-200 text-red-800',
  [MessageType.WARNING]: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  [MessageType.INFO]: 'bg-blue-50 border-blue-200 text-blue-800',
} as const;

/**
 * Icon klase za različite tipove poruka
 */
export const MessageIcons = {
  [MessageType.SUCCESS]: '✓',
  [MessageType.ERROR]: '✕',
  [MessageType.WARNING]: '⚠',
  [MessageType.INFO]: 'ℹ',
} as const;
