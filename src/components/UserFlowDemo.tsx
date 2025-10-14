import React, { useState, useEffect } from 'react'
import { Send, AlertCircle, Check } from 'lucide-react'
import { ConfirmDialog, Toast } from './Modal'

/**
 * UserFlowDemo Component
 * Demonstrates the complete user flow:
 * 1. Page loads → alert shows
 * 2. User fills input in card → clicks Submit button
 * 3. Submit triggers success alert
 * 4. User opens dialog → confirms action
 * 5. Dialog closes → error alert shows (simulating failure)
 * 6. Responsive design testing
 * 7. Full keyboard navigation support
 * 8. Screen reader accessibility
 */
export const UserFlowDemo: React.FC = () => {
    const [formInput, setFormInput] = useState('')
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

    // Step 1: Show welcome alert on page load
    useEffect(() => {
        const timer = setTimeout(() => {
            showToast('Welcome! Please complete the form below.', 'info')
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToastConfig({ visible: true, message, type })
        setTimeout(() => {
            setToastConfig(prev => ({ ...prev, visible: false }))
        }, 4000)
    }

    // Step 2 & 3: Handle form submission and show success alert
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (formInput.trim()) {
            showToast('Form submitted successfully!', 'success')
            // Wait a moment then prompt for confirmation dialog
            setTimeout(() => {
                setShowConfirmDialog(true)
            }, 1500)
        }
    }

    // Step 4 & 5: Handle dialog confirmation and show error alert
    const handleConfirm = () => {
        setShowConfirmDialog(false)
        // Simulate a failure after dialog closes
        setTimeout(() => {
            showToast('Error: Action failed. Please try again.', 'error')
        }, 500)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <header className="text-center mb-8 animate-fade-in">
                    <h1
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                        tabIndex={0}
                        aria-label="User Flow Simulation Demo"
                    >
                        User Flow Simulation
                    </h1>
                    <p
                        className="text-base sm:text-lg text-gray-600"
                        tabIndex={0}
                    >
                        Complete interactive demonstration with accessibility features
                    </p>
                </header>

                {/* Main Card with Form */}
                <div
                    className="bg-white rounded-2xl shadow-soft p-6 sm:p-8 animate-scale-in"
                    role="region"
                    aria-label="Interactive form card"
                >
                    <div className="flex items-center mb-6">
                        <div className="bg-blue-100 p-3 rounded-xl mr-4">
                            <Send className="w-6 h-6 text-blue-600" aria-hidden="true" />
                        </div>
                        <div>
                            <h2
                                className="text-xl sm:text-2xl font-semibold text-gray-900"
                                id="form-title"
                            >
                                Interactive Form
                            </h2>
                            <p className="text-sm text-gray-500">
                                Fill in the form and submit to continue
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                        aria-labelledby="form-title"
                    >
                        {/* Input Field */}
                        <div>
                            <label
                                htmlFor="user-input"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Your Message
                            </label>
                            <input
                                id="user-input"
                                type="text"
                                value={formInput}
                                onChange={(e) => setFormInput(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300"
                                placeholder="Enter your message here..."
                                aria-required="true"
                                aria-describedby="input-description"
                                required
                            />
                            <p
                                id="input-description"
                                className="text-xs text-gray-500 mt-2"
                            >
                                This field is required. Press Tab to navigate to the submit button.
                            </p>
                        </div>

                        {/* Character Count */}
                        <div
                            className="text-sm text-gray-500"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            Characters: {formInput.length}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            aria-label="Submit form"
                        >
                            <span className="flex items-center justify-center">
                                <Send className="w-5 h-5 mr-2" aria-hidden="true" />
                                Submit
                            </span>
                        </button>
                    </form>
                </div>

                {/* Info Cards Grid - Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Card 1 */}
                    <div
                        className="bg-white rounded-xl shadow-soft p-5 hover-lift"
                        role="article"
                        tabIndex={0}
                        aria-label="Step 1 Information"
                    >
                        <div className="flex items-center mb-3">
                            <div className="bg-green-100 p-2 rounded-lg mr-3">
                                <Check className="w-5 h-5 text-green-600" aria-hidden="true" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Step 1</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            Page loads with welcome alert
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div
                        className="bg-white rounded-xl shadow-soft p-5 hover-lift"
                        role="article"
                        tabIndex={0}
                        aria-label="Step 2 Information"
                    >
                        <div className="flex items-center mb-3">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                <Send className="w-5 h-5 text-blue-600" aria-hidden="true" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Step 2</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            Fill form and submit
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div
                        className="bg-white rounded-xl shadow-soft p-5 hover-lift"
                        role="article"
                        tabIndex={0}
                        aria-label="Step 3 Information"
                    >
                        <div className="flex items-center mb-3">
                            <div className="bg-red-100 p-2 rounded-lg mr-3">
                                <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Step 3</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            Confirm dialog and handle error
                        </p>
                    </div>
                </div>

                {/* Keyboard Navigation Help */}
                <div
                    className="bg-indigo-50 rounded-xl p-5 border-2 border-indigo-200"
                    role="complementary"
                    aria-label="Keyboard navigation help"
                >
                    <h3 className="font-semibold text-indigo-900 mb-3 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" aria-hidden="true" />
                        Keyboard Navigation
                    </h3>
                    <ul className="text-sm text-indigo-700 space-y-2">
                        <li>• Press <kbd className="px-2 py-1 bg-white rounded border border-indigo-300">Tab</kbd> to navigate forward</li>
                        <li>• Press <kbd className="px-2 py-1 bg-white rounded border border-indigo-300">Shift + Tab</kbd> to navigate backward</li>
                        <li>• Press <kbd className="px-2 py-1 bg-white rounded border border-indigo-300">Enter</kbd> to activate buttons</li>
                        <li>• Press <kbd className="px-2 py-1 bg-white rounded border border-indigo-300">Esc</kbd> to close dialogs</li>
                    </ul>
                </div>

                {/* Responsive Test Info */}
                <div
                    className="bg-purple-50 rounded-xl p-5 border-2 border-purple-200"
                    role="complementary"
                    aria-label="Responsive design information"
                >
                    <h3 className="font-semibold text-purple-900 mb-3">
                        Responsive Design Test
                    </h3>
                    <p className="text-sm text-purple-700">
                        Resize your browser window to see responsive breakpoints:
                        <span className="block mt-2 font-mono">
                            Mobile (&lt;640px) → Tablet (640-1024px) → Desktop (&gt;1024px)
                        </span>
                    </p>
                </div>

                {/* Button Group for Manual Testing */}
                <div
                    className="bg-white rounded-xl shadow-soft p-6"
                    role="region"
                    aria-label="Additional test controls"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Test Controls
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => showToast('Success alert triggered!', 'success')}
                            className="px-5 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            aria-label="Show success alert"
                        >
                            Success Alert
                        </button>
                        <button
                            onClick={() => showToast('Error alert triggered!', 'error')}
                            className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            aria-label="Show error alert"
                        >
                            Error Alert
                        </button>
                        <button
                            onClick={() => setShowConfirmDialog(true)}
                            className="px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            aria-label="Open confirm dialog"
                        >
                            Open Dialog
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleConfirm}
                title="Confirm Action"
                message="Are you sure you want to proceed with this action? This will simulate a failure scenario."
                confirmText="Yes, Continue"
                cancelText="Cancel"
            />

            {/* Toast Notifications */}
            <Toast
                message={toastConfig.message}
                type={toastConfig.type}
                isVisible={toastConfig.visible}
                onClose={() => setToastConfig(prev => ({ ...prev, visible: false }))}
            />
        </div>
    )
}

