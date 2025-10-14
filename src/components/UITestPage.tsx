import React, { useState } from 'react'
import { User, Mail, Phone, Calendar, AlertCircle, Check, Loader, Home, Settings, Trash2, Edit2, Plus, Heart, ShoppingCart } from 'lucide-react'
import { Modal, ConfirmDialog, Toast } from './Modal'

export const UITestPage: React.FC = () => {
    const [showModal, setShowModal] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [toastConfig, setToastConfig] = useState<{
        visible: boolean
        message: string
        type: 'success' | 'error' | 'info'
    }>({
        visible: false,
        message: '',
        type: 'success'
    })
    const [inputValue, setInputValue] = useState('')
    const [emailValue, setEmailValue] = useState('')
    const [emailError, setEmailError] = useState('')
    const [dateValue, setDateValue] = useState('')
    const [phoneValue, setPhoneValue] = useState('')
    const [textareaValue, setTextareaValue] = useState('')
    const [selectValue, setSelectValue] = useState('option1')
    const [isLoading, setIsLoading] = useState(false)

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToastConfig({ visible: true, message, type })
        setTimeout(() => {
            setToastConfig(prev => ({ ...prev, visible: false }))
        }, 3000)
    }

    const validateEmail = (email: string) => {
        if (!email) {
            setEmailError('')
            return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Invalid email format')
        } else {
            setEmailError('')
        }
    }

    const simulateLoading = () => {
        setIsLoading(true)
        setTimeout(() => setIsLoading(false), 2000)
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">UI Component Test Suite</h1>
                <p className="text-gray-600">Testing all buttons, inputs, cards, dialogs, and alerts</p>
            </div>

            {/* Buttons Section */}
            <section className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Buttons</h2>

                <div className="space-y-6">
                    {/* Primary Buttons */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Primary Buttons</h3>
                        <div className="flex flex-wrap gap-3">
                            <button className="px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press">
                                Primary Button
                            </button>
                            <button className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press">
                                <Plus className="w-4 h-4" />
                                <span>With Icon</span>
                            </button>
                            <button
                                className="px-5 py-2.5 bg-blue-500 text-white rounded-xl transition-all font-medium shadow-soft opacity-50 cursor-not-allowed"
                                disabled
                            >
                                Disabled
                            </button>
                            <button
                                onClick={simulateLoading}
                                className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        <span>Loading...</span>
                                    </>
                                ) : (
                                    <span>Click to Load</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Secondary Buttons */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Secondary Buttons</h3>
                        <div className="flex flex-wrap gap-3">
                            <button className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium btn-press">
                                Secondary Button
                            </button>
                            <button className="flex items-center space-x-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium btn-press">
                                <Settings className="w-4 h-4" />
                                <span>With Icon</span>
                            </button>
                        </div>
                    </div>

                    {/* Danger Buttons */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Danger Buttons</h3>
                        <div className="flex flex-wrap gap-3">
                            <button className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press">
                                Delete
                            </button>
                            <button className="flex items-center space-x-2 px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press">
                                <Trash2 className="w-4 h-4" />
                                <span>Remove Item</span>
                            </button>
                        </div>
                    </div>

                    {/* Success Buttons */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Success Buttons</h3>
                        <div className="flex flex-wrap gap-3">
                            <button className="px-5 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press">
                                Confirm
                            </button>
                            <button className="flex items-center space-x-2 px-5 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press">
                                <Check className="w-4 h-4" />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </div>

                    {/* Icon Buttons */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Icon Buttons</h3>
                        <div className="flex flex-wrap gap-3">
                            <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all btn-press" title="Edit">
                                <Edit2 className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all btn-press" title="Delete">
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all btn-press" title="Favorite">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-xl transition-all btn-press" title="Settings">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Input Fields Section */}
            <section className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Input Fields</h2>

                <div className="space-y-6 max-w-2xl">
                    {/* Text Input */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Text Input</h3>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300"
                            placeholder="Enter text..."
                        />
                    </div>

                    {/* Text Input with Icon */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Text Input with Icon</h3>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300"
                                placeholder="Enter your name..."
                            />
                        </div>
                    </div>

                    {/* Email Input with Validation */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Email Input with Validation</h3>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="email"
                                value={emailValue}
                                onChange={(e) => {
                                    setEmailValue(e.target.value)
                                    validateEmail(e.target.value)
                                }}
                                className={`w-full pl-10 pr-3 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${emailError
                                    ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-200 hover:border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                placeholder="email@example.com"
                            />
                        </div>
                        {emailError && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {emailError}
                            </p>
                        )}
                    </div>

                    {/* Date Input */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Date Input</h3>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="date"
                                value={dateValue}
                                onChange={(e) => setDateValue(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300"
                                aria-label="Select date"
                            />
                        </div>
                    </div>

                    {/* Tel Input */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Phone Input</h3>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="tel"
                                value={phoneValue}
                                onChange={(e) => setPhoneValue(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300"
                                placeholder="(123) 456-7890"
                            />
                        </div>
                    </div>

                    {/* Select/Dropdown */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Select Dropdown</h3>
                        <select
                            value={selectValue}
                            onChange={(e) => setSelectValue(e.target.value)}
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300"
                            aria-label="Select an option"
                        >
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                            <option value="option4">Option 4</option>
                        </select>
                    </div>

                    {/* Textarea */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Textarea</h3>
                        <textarea
                            value={textareaValue}
                            onChange={(e) => setTextareaValue(e.target.value)}
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 resize-none"
                            rows={4}
                            placeholder="Enter multiple lines of text..."
                            aria-label="Multi-line text input"
                        />
                    </div>

                    {/* Disabled Input */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Disabled Input</h3>
                        <input
                            type="text"
                            value="Disabled field"
                            disabled
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                            aria-label="Disabled text field"
                        />
                    </div>
                </div>
            </section>

            {/* Cards Section */}
            <section className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cards</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Basic Card */}
                    <div className="bg-white rounded-xl shadow-soft p-5">
                        <h3 className="font-semibold text-gray-900 mb-2">Basic Card</h3>
                        <p className="text-gray-600 text-sm">Simple card with shadow-soft styling</p>
                    </div>

                    {/* Hover Lift Card */}
                    <div className="bg-white rounded-xl shadow-soft p-5 hover-lift cursor-pointer">
                        <h3 className="font-semibold text-gray-900 mb-2">Hover Lift Card</h3>
                        <p className="text-gray-600 text-sm">Hover over me to see the lift effect</p>
                    </div>

                    {/* Stat Card - Blue */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-soft p-5 text-white hover-lift">
                        <div className="flex items-center justify-between mb-2">
                            <Home className="w-6 h-6" />
                            <span className="text-3xl font-bold">24</span>
                        </div>
                        <p className="text-blue-100 text-sm font-medium">Total Items</p>
                    </div>

                    {/* Stat Card - Green */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-soft p-5 text-white hover-lift">
                        <div className="flex items-center justify-between mb-2">
                            <Check className="w-6 h-6" />
                            <span className="text-3xl font-bold">18</span>
                        </div>
                        <p className="text-green-100 text-sm font-medium">Completed</p>
                    </div>

                    {/* Content Card with Actions */}
                    <div className="bg-gray-50 rounded-xl p-5 hover-lift">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-semibold text-gray-900">Action Card</h4>
                                <p className="text-sm text-gray-500">With action buttons</p>
                            </div>
                            <div className="flex space-x-1">
                                <button
                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all btn-press"
                                    aria-label="Edit card"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all btn-press"
                                    aria-label="Delete card"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm">Card content with hover and action buttons</p>
                    </div>

                    {/* Empty State Card */}
                    <div className="bg-white rounded-xl shadow-soft p-8 text-center">
                        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">No Items</h4>
                        <p className="text-gray-500 text-sm">Empty state card example</p>
                    </div>
                </div>
            </section>

            {/* Dialogs Section */}
            <section className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dialogs & Modals</h2>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
                    >
                        Open Modal
                    </button>
                    <button
                        onClick={() => setShowConfirmDialog(true)}
                        className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
                    >
                        Open Confirm Dialog
                    </button>
                </div>

                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Test Modal">
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            This is a test modal with backdrop blur and scale-in animation.
                        </p>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Test input in modal..."
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                            <button className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium btn-press">
                                Submit
                            </button>
                        </div>
                    </div>
                </Modal>

                <ConfirmDialog
                    isOpen={showConfirmDialog}
                    onClose={() => setShowConfirmDialog(false)}
                    onConfirm={() => {
                        showToast('Action confirmed!', 'success')
                        setShowConfirmDialog(false)
                    }}
                    title="Confirm Action"
                    message="Are you sure you want to perform this action? This is a test of the confirm dialog component."
                    confirmText="Yes, Continue"
                    cancelText="Cancel"
                />
            </section>

            {/* Alerts/Toasts Section */}
            <section className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Alerts & Toasts</h2>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => showToast('Success! Operation completed successfully.', 'success')}
                        className="px-5 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
                    >
                        Show Success Toast
                    </button>
                    <button
                        onClick={() => showToast('Error! Something went wrong.', 'error')}
                        className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
                    >
                        Show Error Toast
                    </button>
                    <button
                        onClick={() => showToast('Info: This is an informational message.', 'info')}
                        className="px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
                    >
                        Show Info Toast
                    </button>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600">
                        <strong>Note:</strong> Toasts will auto-dismiss after 3 seconds and appear in the top-right corner.
                    </p>
                </div>
            </section>

            {/* Animations Section */}
            <section className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Animations</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-soft p-5 text-white animate-fade-in">
                        <h3 className="font-semibold mb-2">Fade In</h3>
                        <p className="text-purple-100 text-sm">animate-fade-in class</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-soft p-5 text-white animate-scale-in">
                        <h3 className="font-semibold mb-2">Scale In</h3>
                        <p className="text-pink-100 text-sm">animate-scale-in class</p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-soft p-5 text-white animate-slide-up">
                        <h3 className="font-semibold mb-2">Slide Up</h3>
                        <p className="text-indigo-100 text-sm">animate-slide-up class</p>
                    </div>
                </div>
            </section>

            <Toast
                message={toastConfig.message}
                type={toastConfig.type}
                isVisible={toastConfig.visible}
                onClose={() => setToastConfig(prev => ({ ...prev, visible: false }))}
            />
        </div>
    )
}

