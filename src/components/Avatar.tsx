import { Camera, User } from 'lucide-react';
import { useState } from 'react';

interface AvatarProps {
    name: string;
    color: string;
    avatarUrl?: string;
    avatarPattern?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    editable?: boolean;
    onAvatarChange?: (url: string) => void;
    onPatternChange?: (pattern: string) => void;
}

export function Avatar({
    name,
    color,
    avatarUrl,
    avatarPattern = 'solid',
    size = 'md',
    editable = false,
    onAvatarChange,
    onPatternChange,
}: AvatarProps) {
    const [showPatternSelector, setShowPatternSelector] = useState(false);
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-12 h-12 text-xl',
        lg: 'w-16 h-16 text-2xl',
        xl: 'w-24 h-24 text-4xl',
    };

    const patterns = [
        { id: 'solid', name: 'Solid', class: '' },
        { id: 'gradient', name: 'Gradient', class: 'bg-gradient-to-br' },
        { id: 'dots', name: 'Dots', class: 'dots-pattern' },
        { id: 'stripes', name: 'Stripes', class: 'stripes-pattern' },
        { id: 'waves', name: 'Waves', class: 'waves-pattern' },
    ];

    const getPatternClass = () => {
        const pattern = patterns.find(p => p.id === avatarPattern);
        return pattern?.class || '';
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onAvatarChange) {
            // In a real app, you'd upload to a server and get back a URL
            // For now, we'll use a local object URL
            const url = URL.createObjectURL(file);
            onAvatarChange(url);
            setImageError(false);
        }
    };

    const handleRemoveAvatar = () => {
        if (onAvatarChange) {
            onAvatarChange('');
            setImageError(false);
        }
    };

    // If we have an avatar URL and it hasn't errored, show the image
    if (avatarUrl && !imageError) {
        return (
            <div className="relative group inline-block">
                <div className={`${sizeClasses[size]} rounded-xl overflow-hidden shadow-medium relative`}>
                    <img
                        src={avatarUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                </div>
                {editable && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center rounded-xl">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <label className="cursor-pointer p-2 bg-white rounded-lg hover:bg-gray-100 transition-all" title="Change photo">
                                <Camera className="w-4 h-4 text-gray-700" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    aria-label="Upload new photo"
                                />
                            </label>
                            <button
                                onClick={handleRemoveAvatar}
                                className="p-2 bg-white rounded-lg hover:bg-red-50 transition-all"
                                title="Remove photo"
                            >
                                <User className="w-4 h-4 text-red-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Show pattern-based avatar with initials
    return (
        <div className="relative inline-block">
            <div
                className={`${sizeClasses[size]} ${color} ${getPatternClass()} rounded-xl flex items-center justify-center text-white font-bold shadow-medium relative overflow-hidden cursor-pointer`}
                onClick={() => editable && setShowPatternSelector(!showPatternSelector)}
            >
                {/* Pattern overlay effects */}
                {avatarPattern === 'dots' && (
                    <div className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '8px 8px'
                        }}
                    />
                )}
                {avatarPattern === 'stripes' && (
                    <div className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, white, white 4px, transparent 4px, transparent 8px)'
                        }}
                    />
                )}
                {avatarPattern === 'waves' && (
                    <div className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'repeating-radial-gradient(circle at 0 0, transparent 0, white 10px, transparent 20px)'
                        }}
                    />
                )}

                <span className="relative z-10">{name[0]?.toUpperCase()}</span>

                {editable && (
                    <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-3 h-3 text-gray-600" />
                    </div>
                )}
            </div>

            {/* Pattern Selector */}
            {showPatternSelector && editable && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50 min-w-max">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Choose Pattern:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {patterns.map((pattern) => (
                                <button
                                    key={pattern.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPatternChange?.(pattern.id);
                                        setShowPatternSelector(false);
                                    }}
                                    className={`px-3 py-2 text-xs rounded-lg border-2 transition-all ${avatarPattern === pattern.id
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {pattern.name}
                                </button>
                            ))}
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                            <label className="flex items-center gap-2 px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-all">
                                <Camera className="w-4 h-4" />
                                <span>Upload Photo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        handleFileChange(e);
                                        setShowPatternSelector(false);
                                    }}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

