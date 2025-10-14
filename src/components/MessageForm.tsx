import React, { useState, useRef } from 'react'
import { MessageSquare, AlertCircle, User, Paperclip } from 'lucide-react'
import { MessageAttachment } from './MessageAttachment'

interface MessageFormProps {
    onSubmit: (message: {
        content: string
        recipientId: string
        attachmentUrl?: string
        attachmentType?: string
        attachmentName?: string
    }) => void
    onCancel: () => void
    familyMembers: Array<{ id: string; name: string }>
    currentUserId: string
}

export const MessageForm: React.FC<MessageFormProps> = ({
    onSubmit,
    onCancel,
    familyMembers,
    currentUserId
}) => {
    const availableRecipients = familyMembers.filter(m => m.id !== currentUserId)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        content: '',
        recipientId: availableRecipients[0]?.id || ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [attachment, setAttachment] = useState<{
        url: string
        type: string
        name: string
        file?: File
    } | null>(null)

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.content.trim()) {
            newErrors.content = 'Message content is required'
        }
        if (!formData.recipientId) {
            newErrors.recipientId = 'Please select a recipient'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setErrors({ ...errors, attachment: 'File size must be less than 10MB' })
            return
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
        if (!allowedTypes.includes(file.type)) {
            setErrors({ ...errors, attachment: 'Invalid file type. Only images and documents allowed.' })
            return
        }

        // Create preview URL
        const url = URL.createObjectURL(file)
        setAttachment({
            url,
            type: file.type,
            name: file.name,
            file
        })
        setErrors({ ...errors, attachment: '' })
    }

    const handleRemoveAttachment = () => {
        if (attachment?.url) {
            URL.revokeObjectURL(attachment.url)
        }
        setAttachment(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            onSubmit({
                ...formData,
                attachmentUrl: attachment?.url,
                attachmentType: attachment?.type,
                attachmentName: attachment?.name
            })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Send To
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                        value={formData.recipientId}
                        onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                        className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.recipientId ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                        aria-label="Select message recipient"
                    >
                        {availableRecipients.map(member => (
                            <option key={member.id} value={member.id}>
                                {member.name}
                            </option>
                        ))}
                    </select>
                </div>
                {errors.recipientId && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.recipientId}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                </label>
                <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={4}
                        className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.content ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                        placeholder="Type your message..."
                        aria-label="Message content"
                    />
                </div>
                {errors.content && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.content}
                    </p>
                )}
                <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                        {formData.content.length} / 2000 characters
                    </span>
                </div>
            </div>

            {/* Attachment Section */}
            <div>
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                    aria-label="File attachment input"
                />

                {attachment ? (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Attachment
                        </label>
                        <MessageAttachment
                            url={attachment.url}
                            type={attachment.type}
                            name={attachment.name}
                            isPreview={true}
                            onRemove={handleRemoveAttachment}
                        />
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium"
                    >
                        <Paperclip className="w-4 h-4" />
                        <span>Attach File</span>
                    </button>
                )}
                {errors.attachment && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.attachment}
                    </p>
                )}
            </div>

            <div className="flex space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium btn-press"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-all font-medium btn-press shadow-soft hover:shadow-medium"
                >
                    Send Message
                </button>
            </div>
        </form>
    )
}
