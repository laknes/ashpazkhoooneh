
import React, { useRef, useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, X, Loader2, Link as LinkIcon, Cloud } from 'lucide-react';

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
  const [mode, setMode] = useState<'UPLOAD' | 'URL'>('UPLOAD');

  // Auto-detect mode based on current image content
  useEffect(() => {
    if (currentImage && !currentImage.startsWith('data:')) {
        setMode('URL');
    }
  }, []);

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

          if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, width, height);
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
        
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: resizedImage })
            });

            if (res.ok) {
                const data = await res.json();
                onImageSelect(data.url);
            } else {
                onImageSelect(resizedImage); 
            }
        } catch (uploadError) {
            onImageSelect(resizedImage);
        }
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
        {/* Mode Toggles */}
        <div className="flex mb-3 bg-gray-100 p-1 rounded-lg">
            <button 
                type="button"
                onClick={() => setMode('UPLOAD')}
                className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all flex items-center justify-center gap-2 ${mode === 'UPLOAD' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
            >
                <Upload size={14} />
                آپلود
            </button>
            <button 
                type="button"
                onClick={() => setMode('URL')}
                className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all flex items-center justify-center gap-2 ${mode === 'URL' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
            >
                <LinkIcon size={14} />
                لینک
            </button>
        </div>

        {/* URL Input Mode */}
        {mode === 'URL' && (
            <div className="mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="relative">
                    <input 
                        type="text"
                        value={currentImage?.startsWith('data:') ? '' : currentImage}
                        onChange={(e) => onImageSelect(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full pl-3 pr-9 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none dir-ltr bg-white"
                    />
                    <LinkIcon size={16} className="absolute right-3 top-3 text-gray-400" />
                </div>
            </div>
        )}

        {/* File Upload Mode */}
        {mode === 'UPLOAD' && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
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
                        {!currentImage || mode === 'UPLOAD' ? (
                            <div className="py-4 flex flex-col items-center text-gray-400">
                                <div className="p-2 bg-white rounded-full mb-2 shadow-sm">
                                    <ImageIcon size={20} className="text-gray-500" />
                                </div>
                                <span className="text-xs font-bold text-gray-600">انتخاب تصویر</span>
                            </div>
                        ) : null}
                    </div>

                    {isProcessing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-10">
                            <div className="flex flex-col items-center text-primary">
                                <Loader2 size={24} className="animate-spin mb-2" />
                                <span className="text-xs font-bold">...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Preview (Always visible if image exists) */}
        {currentImage && (
            <div className="mt-4 relative group">
                <div className="text-xs font-bold text-gray-500 mb-1 flex justify-between items-center">
                    <span>پیش‌نمایش:</span>
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onImageSelect('');
                        }}
                        className="text-red-500 hover:text-red-700 text-[10px] flex items-center bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                    >
                        <X size={12} className="ml-1" /> حذف
                    </button>
                </div>
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 checkerboard-bg">
                    <img 
                        src={currentImage} 
                        alt="Preview" 
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/600x400/f3f4f6/9ca3af?text=Broken+Image";
                        }}
                    />
                    {currentImage.includes('cloudinary.com') && (
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-blue-600 p-1 rounded shadow-sm" title="ذخیره شده در فضای ابری">
                            <Cloud size={14} />
                        </div>
                    )}
                </div>
            </div>
        )}
        
        <style>{`
            .checkerboard-bg {
                background-image: linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
            }
        `}</style>
    </div>
  );
};

export default ImageUploader;
