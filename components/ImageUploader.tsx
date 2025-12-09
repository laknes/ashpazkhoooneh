
import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  currentImage?: string;
  onImageSelect: (base64: string) => void;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ currentImage, onImageSelect, className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file?: File) => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit warning
        alert('حجم تصویر بهتر است کمتر از ۲ مگابایت باشد تا سرعت سایت کند نشود.');
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onImageSelect(base64String);
      };
      reader.readAsDataURL(file);
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
    processFile(file);
  };

  return (
    <div className={`w-full ${className}`}>
        <div 
            className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-300 ${
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
            
            <div className="flex flex-col items-center justify-center space-y-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {currentImage ? (
                    <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden group">
                        <img src={currentImage} alt="Preview" className="w-full h-full object-contain bg-gray-100" />
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
                        <span className="text-xs mt-1">(حداکثر ۲ مگابایت)</span>
                    </div>
                )}
            </div>
            
            {currentImage && (
                <button 
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageSelect('');
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 transition-colors"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    </div>
  );
};

export default ImageUploader;
