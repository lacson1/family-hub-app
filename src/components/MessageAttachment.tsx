import React, { useState } from 'react'
import { FileText, Download, X } from 'lucide-react'

interface MessageAttachmentProps {
    url: string
    type: string
    name: string
    isPreview?: boolean
    onRemove?: () => void
}

export const MessageAttachment: React.FC<MessageAttachmentProps> = ({
    url,
    type,
    name,
    isPreview = false,
    onRemove
}) => {
    const [showLightbox, setShowLightbox] = useState(false)
    const isImage = type.startsWith('image/')

    const handleDownload = () => {
        const link = document.createElement('a')
        link.href = url
        link.download = name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (isImage) {
        return (
            <>
                <div className="relative group">
                    <img
                        src={url}
                        alt={name}
                        className="max-w-xs max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => !isPreview && setShowLightbox(true)}
                    />
                    {isPreview && onRemove && (
                        <button
                            onClick={onRemove}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            aria-label="Remove attachment"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    {!isPreview && (
                        <button
                            onClick={handleDownload}
                            className="absolute bottom-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100"
                            aria-label="Download image"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Lightbox */}
                {showLightbox && (
                    <div
                        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
                        onClick={() => setShowLightbox(false)}
                    >
                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-colors"
                            aria-label="Close lightbox"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={url}
                            alt={name}
                            className="max-w-full max-h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={handleDownload}
                            className="absolute bottom-4 right-4 flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                            aria-label="Download image"
                        >
                            <Download className="w-5 h-5" />
                            <span>Download</span>
                        </button>
                    </div>
                )}
            </>
        )
    }

    // Document attachment
    return (
        <div className={`flex items-center space-x-3 p-3 rounded-lg border ${isPreview ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50'
            } max-w-xs`}>
            <div className="flex-shrink-0">
                <FileText className="w-8 h-8 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                <p className="text-xs text-gray-500">Document</p>
            </div>
            {isPreview && onRemove ? (
                <button
                    onClick={onRemove}
                    className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remove attachment"
                >
                    <X className="w-5 h-5" />
                </button>
            ) : (
                <button
                    onClick={handleDownload}
                    className="flex-shrink-0 p-2 text-blue-500 hover:text-blue-700 transition-colors"
                    aria-label="Download document"
                >
                    <Download className="w-5 h-5" />
                </button>
            )}
        </div>
    )
}

