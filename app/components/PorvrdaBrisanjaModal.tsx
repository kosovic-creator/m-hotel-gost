// app/components/ConfirmDeleteModal.tsx
'use client';
import React from "react";
import { useTranslation } from "react-i18next";

interface PotvrdaBrisanjaModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function PotvrdaBrisanjaModal({ open, onCancel, onConfirm }: PotvrdaBrisanjaModalProps) {
  const { t } = useTranslation("common");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="mb-4">{t("delete_confirmation")}</h2>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            type="button"
          >
            {t("cancel") || "Otkaži"}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
            type="button"
          >
            {t("delete") || "Obriši"}
          </button>
        </div>
      </div>
    </div>
  );
}