import { useState, useRef } from 'react';
import { Upload, Camera, X, Image as ImageIcon } from 'lucide-react';

interface ImagePickerProps {
    onImageSelect: (file: File) => void;
    onImageRemove?: () => void;
    currentImage?: string;
    accept?: string;
    maxSizeMB?: number;
    label?: string;
    className?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
    onImageSelect,
    onImageRemove,
    currentImage,
    accept = 'image/jpeg,image/jpg,image/png,image/webp',
    maxSizeMB = 10,
    label = 'Add Photo',
    className = ''
}) => {
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): boolean => {
        setError(null);

        // Check file type
        const acceptedTypes = accept.split(',').map(t => t.trim());
        if (!acceptedTypes.includes(file.type)) {
            setError(`File type not supported. Please use: ${accept}`);
            return false;
        }

        // Check file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            setError(`File size must be less than ${maxSizeMB}MB`);
            return false;
        }

        return true;
    };

    const handleFileSelect = (file: File) => {
        if (!validateFile(file)) return;

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Pass file to parent
        onImageSelect(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
        if (onImageRemove) onImageRemove();
    };

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    const openCamera = () => {
        cameraInputRef.current?.click();
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            {!preview ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                >
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-3">
                        Drag and drop an image, or
                    </p>
                    <div className="flex gap-2 justify-center">
                        <button
                            type="button"
                            onClick={openFilePicker}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                        </button>
                        {/* Only show camera button on mobile */}
                        {/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && (
                            <button
                                type="button"
                                onClick={openCamera}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Camera
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Max size: {maxSizeMB}MB
                    </p>

                    {/* Hidden file inputs */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleInputChange}
                        className="hidden"
                        aria-label="Choose file from device"
                        title="Choose file from device"
                    />
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleInputChange}
                        className="hidden"
                        aria-label="Take photo with camera"
                        title="Take photo with camera"
                    />
                </div>
            ) : (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        title="Remove image"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="mt-2 flex gap-2">
                        <button
                            type="button"
                            onClick={openFilePicker}
                            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                            Change Image
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default ImagePicker;

