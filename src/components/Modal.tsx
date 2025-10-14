import React from 'react'
import { X } from 'lucide-react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-large max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:scale-110 btn-press"
                        title="Close modal"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-large max-w-sm w-full mx-4 animate-scale-in">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium btn-press"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all font-medium btn-press shadow-soft hover:shadow-medium"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface ToastProps {
    message: string
    type: 'success' | 'error' | 'info'
    isVisible: boolean
    onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
    if (!isVisible) return null

    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    }

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-up">
            <div className={`${bgColor[type]} text-white px-6 py-3.5 rounded-xl shadow-large flex items-center space-x-3 backdrop-blur-sm`}>
                <span className="font-medium">{message}</span>
                <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-all hover:scale-110 btn-press"
                    title="Close notification"
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
