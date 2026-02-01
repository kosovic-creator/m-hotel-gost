"use client";

import { MessageType, MessageStyles, MessageIcons } from '@/lib/constants/messages';

type MessageBannerProps = {
  type: MessageType;
  message: string;
  onClose?: () => void;
};

export function MessageBanner({ type, message, onClose }: MessageBannerProps) {
  const styles = MessageStyles[type];
  const icon = MessageIcons[type];

  return (
    <div className={`border rounded-lg p-4 mb-4 flex items-center justify-between ${styles}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">{icon}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 ml-4"
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
}

type SuccessMessageProps = {
  message: string;
  onClose?: () => void;
};

export function SuccessMessage({ message, onClose }: SuccessMessageProps) {
  return <MessageBanner type={MessageType.SUCCESS} message={message} onClose={onClose} />;
}

type ErrorMessageProps = {
  message: string;
  onClose?: () => void;
};

export function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  return <MessageBanner type={MessageType.ERROR} message={message} onClose={onClose} />;
}

type WarningMessageProps = {
  message: string;
  onClose?: () => void;
};

export function WarningMessage({ message, onClose }: WarningMessageProps) {
  return <MessageBanner type={MessageType.WARNING} message={message} onClose={onClose} />;
}

type InfoMessageProps = {
  message: string;
  onClose?: () => void;
};

export function InfoMessage({ message, onClose }: InfoMessageProps) {
  return <MessageBanner type={MessageType.INFO} message={message} onClose={onClose} />;
}
