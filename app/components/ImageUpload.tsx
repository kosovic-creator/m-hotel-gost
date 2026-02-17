'use client';

import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useI18n } from '@/i18n/I18nProvider';

interface ImageUploadProps {
  name: string;
  defaultValue?: string;
  error?: string;
  label: string;
}

export function ImageUpload({ name, defaultValue = '', error, label }: ImageUploadProps) {
  const { t } = useI18n();
  const tr = (key: string) => t('common', key);
  const [images, setImages] = useState<string[]>(
    defaultValue ? defaultValue.split(',').map(img => img.trim()).filter(Boolean) : []
  );
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        try {
          const url = await uploadToCloudinary(file);
          uploadedUrls.push(url);
        } catch (error) {
          console.error('Upload greška:', error);
        }
      }
    }

    setImages(prev => [...prev, ...uploadedUrls]);
    setUploading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getImagesForSubmit = () => {
    return images.filter(img => !img.startsWith('data:')).join(',');
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium">{label}</label>

      <input type="hidden" name={name} value={getImagesForSubmit()} />

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <Upload className="mx-auto mb-2 text-gray-400" size={40} />
        <p className="text-sm text-gray-600 mb-2">
          {tr('image_upload_hint')}
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id={`file-input-${name}`}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById(`file-input-${name}`)?.click()}
          disabled={uploading}
        >
          {uploading ? tr('uploading') : tr('image_upload_select')}
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <Image
                src={img.trim()}
                alt={`${tr('image_upload_preview')} ${index + 1}`}
                width={100}
                height={100}
                className="w-full h-24 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <span className="text-red-600 text-xs">{error}</span>}
    </div>
  );
}