"use client";

import { MessageType, MessageStyles, MessageIcons } from '@/lib/constants/messages';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

type MessageBannerProps = {
  type: MessageType;
  message: string; // translation key or raw message (if rawMessage is true)
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
  clearUrlParams?: boolean;
  namespace?: string; // i18n namespace (default: 'common')
  position?: 'relative' | 'fixed'; // relative (inline) or fixed (overlay)
  rawMessage?: boolean; // if true, use message as-is instead of translating
};

export function MessageBanner({
  type,
  message,
  onClose,
  autoClose = true,
  autoCloseDuration = 3000,
  clearUrlParams = true,
  namespace = 'common',
  position = 'relative',
  rawMessage = false
}: MessageBannerProps) {
  const styles = MessageStyles[type];
  const icon = MessageIcons[type];
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation(namespace);
  const { t: tCommon } = useTranslation('common');

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      if (clearUrlParams) {
        router.replace(pathname);
      }
      onClose?.();
    }, 300);
  }, [clearUrlParams, pathname, router, onClose]);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDuration, handleClose]);

  if (!isVisible || !message) {
    return null;
  }

  const displayMessage = rawMessage ? message : t(message);

  const baseClasses = "border rounded-lg p-4 flex items-center justify-between backdrop-blur-sm bg-opacity-95 transition-opacity duration-300";
  const positionClasses = position === 'fixed'
    ? "fixed top-16 left-0 right-0 z-50 px-4 shadow-lg"
    : "mb-4";

  const containerContent = (
    <div
      className={`${baseClasses} ${positionClasses} ${styles} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">{icon}</span>
        <span>{displayMessage}</span>
      </div>
      <button
        onClick={handleClose}
        className="text-current hover:opacity-70 ml-4"
        aria-label={tCommon('close')}
      >
        ✕
      </button>
    </div>
  );

  // For fixed positioning, wrap in max-width container
  if (position === 'fixed') {
    return (
      <div className={positionClasses}>
        <div className="max-w-2xl mx-auto">
          <div className={`${baseClasses} ${styles} ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{icon}</span>
              <span>{displayMessage}</span>
            </div>
            <button
              onClick={handleClose}
              className="text-current hover:opacity-70 ml-4"
              aria-label={tCommon('close')}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return containerContent;
}

type SuccessMessageProps = {
  message: string; // translation key or raw message
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
  clearUrlParams?: boolean;
  namespace?: string;
  position?: 'relative' | 'fixed';
  rawMessage?: boolean;
};

export function SuccessMessage({ message, onClose, autoClose, autoCloseDuration, clearUrlParams, namespace, position, rawMessage }: SuccessMessageProps) {
  return <MessageBanner type={MessageType.SUCCESS} message={message} onClose={onClose} autoClose={autoClose} autoCloseDuration={autoCloseDuration} clearUrlParams={clearUrlParams} namespace={namespace} position={position} rawMessage={rawMessage} />;
}

type ErrorMessageProps = {
  message: string; // translation key or raw message
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
  clearUrlParams?: boolean;
  namespace?: string;
  position?: 'relative' | 'fixed';
  rawMessage?: boolean;
};

export function ErrorMessage({ message, onClose, autoClose, autoCloseDuration, clearUrlParams, namespace, position, rawMessage }: ErrorMessageProps) {
  return <MessageBanner type={MessageType.ERROR} message={message} onClose={onClose} autoClose={autoClose} autoCloseDuration={autoCloseDuration} clearUrlParams={clearUrlParams} namespace={namespace} position={position} rawMessage={rawMessage} />;
}

type WarningMessageProps = {
  message: string; // translation key or raw message
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
  clearUrlParams?: boolean;
  namespace?: string;
  position?: 'relative' | 'fixed';
  rawMessage?: boolean;
};

export function WarningMessage({ message, onClose, autoClose, autoCloseDuration, clearUrlParams, namespace, position, rawMessage }: WarningMessageProps) {
  return <MessageBanner type={MessageType.WARNING} message={message} onClose={onClose} autoClose={autoClose} autoCloseDuration={autoCloseDuration} clearUrlParams={clearUrlParams} namespace={namespace} position={position} rawMessage={rawMessage} />;
}

type InfoMessageProps = {
  message: string; // translation key or raw message
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
  clearUrlParams?: boolean;
  namespace?: string;
  position?: 'relative' | 'fixed';
  rawMessage?: boolean;
};

export function InfoMessage({ message, onClose, autoClose, autoCloseDuration, clearUrlParams, namespace, position, rawMessage }: InfoMessageProps) {
  return <MessageBanner type={MessageType.INFO} message={message} onClose={onClose} autoClose={autoClose} autoCloseDuration={autoCloseDuration} clearUrlParams={clearUrlParams} namespace={namespace} position={position} rawMessage={rawMessage} />;
}
