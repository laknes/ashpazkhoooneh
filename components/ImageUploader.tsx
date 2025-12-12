
import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  currentImage?: string;
  onImageSelect: (base64: string) => void;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  currentImage, 
  onImageSelect, 
  className,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          // Additional check to ensure neither dimension exceeds limits (for unusual aspect ratios)
          if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
              // High quality smoothing
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, width, height);
              
              // Compress to JPEG to optimize size for LocalStorage
              // Using JPEG is safer for size, even if input is PNG (transparency will turn black/white depending on browser, usually black)
              const dataUrl = canvas.toDataURL('image/jpeg', quality);
              resolve(dataUrl);
          } else {
              reject(new Error('Canvas context not available'));
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file?: File) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
          alert('لطفاً یک فایل تصویر معتبر انتخاب کنید.');
          return;
      }

      setIsProcessing(true);
      try {
        const resizedImage = await resizeImage(file);
        onImageSelect(resizedImage);
      } catch (error) {
        console.error("Image processing error:", error);
        alert('خطا در پردازش تصویر.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className={`w-full ${className}`}>
        <div 
            className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-300 overflow-hidden ${
                isDragging ? 'border-primary bg-orange-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                onClick={(e) => (e.currentTarget.value = '')} 
                accept="image/*"
                className="hidden"
            />
            
            <div 
                className={`flex flex-col items-center justify-center space-y-2 cursor-pointer ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`} 
                onClick={() => fileInputRef.current?.click()}
            >
                {currentImage ? (
                    <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden group bg-white shadow-inner">
                        <img src={currentImage} alt="Preview" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium flex items-center gap-2">
                                <Upload size={20} />
                                تغییر تصویر
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 flex flex-col items-center text-gray-400">
                        <div className="p-4 bg-gray-200 rounded-full mb-2">
                            <ImageIcon size={32} />
                        </div>
                        <span className="text-sm font-medium">برای آپلود کلیک کنید یا تصویر را اینجا بکشید</span>
                        <span className="text-xs mt-1 text-gray-400 text-center px-4 dir-ltr">
                            (Auto-resize: max {maxWidth}x{maxHeight}px)
                        </span>
                    </div>
                )}
            </div>

            {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center text-primary">
                        <Loader2 size={32} className="animate-spin mb-2" />
                        <span className="text-sm font-bold">در حال بهینه‌سازی...</span>
                    </div>
                </div>
            )}
            
            {currentImage && !isProcessing && (
                <button 
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageSelect('');
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 transition-colors z-20"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    </div>
  );
};

export default ImageUploader;