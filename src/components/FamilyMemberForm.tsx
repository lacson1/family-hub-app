import React, { useState } from 'react'
import { User, AlertCircle, Users, Baby, Heart, UserPlus, Phone, Mail, MapPin, Calendar, FileText } from 'lucide-react'
import { Avatar } from './Avatar'

interface FamilyMemberFormData {
    name: string
    role: string
    color: string
    avatar_url?: string
    avatar_pattern?: string
    birth_date?: string
    phone?: string
    email?: string
    address?: string
    notes?: string
    generation?: number
}

interface FamilyMemberFormProps {
    onSubmit: (member: FamilyMemberFormData) => void
    onCancel: () => void
    initialData?: Partial<FamilyMemberFormData>
}

export const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({
    onSubmit,
    onCancel,
    initialData
}) => {
    const [formData, setFormData] = useState<FamilyMemberFormData>({
        name: initialData?.name || '',
        role: initialData?.role || 'Parent',
        color: initialData?.color || 'bg-blue-500',
        avatar_url: initialData?.avatar_url || '',
        avatar_pattern: initialData?.avatar_pattern || 'solid',
        birth_date: initialData?.birth_date || '',
        phone: initialData?.phone || '',
        email: initialData?.email || '',
        address: initialData?.address || '',
        notes: initialData?.notes || '',
        generation: initialData?.generation || 0
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showAdvanced, setShowAdvanced] = useState(false)

    const roleOptions = [
        { value: 'Parent', label: 'Parent', icon: Users, generation: 0 },
        { value: 'Child', label: 'Child', icon: Baby, generation: 1 },
        { value: 'Grandparent', label: 'Grandparent', icon: Heart, generation: -1 },
        { value: 'Grandchild', label: 'Grandchild', icon: Baby, generation: 2 },
        { value: 'Sibling', label: 'Sibling', icon: UserPlus, generation: 0 },
        { value: 'Spouse', label: 'Spouse', icon: Heart, generation: 0 },
        { value: 'Extended Family', label: 'Extended Family', icon: Users, generation: 0 },
        { value: 'Other', label: 'Other', icon: User, generation: 0 },
    ]

    const colorOptions = [
        { value: 'bg-blue-500', label: 'Blue', preview: 'bg-blue-500' },
        { value: 'bg-green-500', label: 'Green', preview: 'bg-green-500' },
        { value: 'bg-purple-500', label: 'Purple', preview: 'bg-purple-500' },
        { value: 'bg-pink-500', label: 'Pink', preview: 'bg-pink-500' },
        { value: 'bg-orange-500', label: 'Orange', preview: 'bg-orange-500' },
        { value: 'bg-red-500', label: 'Red', preview: 'bg-red-500' },
        { value: 'bg-indigo-500', label: 'Indigo', preview: 'bg-indigo-500' },
        { value: 'bg-teal-500', label: 'Teal', preview: 'bg-teal-500' },
        { value: 'bg-yellow-500', label: 'Yellow', preview: 'bg-yellow-500' },
        { value: 'bg-cyan-500', label: 'Cyan', preview: 'bg-cyan-500' },
        { value: 'bg-rose-500', label: 'Rose', preview: 'bg-rose-500' },
        { value: 'bg-emerald-500', label: 'Emerald', preview: 'bg-emerald-500' },
    ]

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }
        if (!formData.role.trim()) {
            newErrors.role = 'Role is required'
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            onSubmit(formData)
        }
    }

    const handleRoleChange = (roleValue: string) => {
        const role = roleOptions.find(r => r.value === roleValue)
        setFormData({
            ...formData,
            role: roleValue,
            generation: role?.generation || 0
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
            {/* Avatar Section */}
            <div className="flex flex-col items-center pb-4 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Profile Picture
                </label>
                <Avatar
                    name={formData.name || 'U'}
                    color={formData.color}
                    avatarUrl={formData.avatar_url}
                    avatarPattern={formData.avatar_pattern}
                    size="xl"
                    editable={true}
                    onAvatarChange={(url) => setFormData({ ...formData, avatar_url: url })}
                    onPatternChange={(pattern) => setFormData({ ...formData, avatar_pattern: pattern })}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Click to change pattern or upload photo</p>
            </div>

            {/* Name */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full pl-10 pr-3 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                        placeholder="Enter full name..."
                    />
                </div>
                {errors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                    </p>
                )}
            </div>

            {/* Role with Icons */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role *
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {roleOptions.map((role) => {
                        const Icon = role.icon
                        return (
                            <button
                                key={role.value}
                                type="button"
                                onClick={() => handleRoleChange(role.value)}
                                className={`p-3 rounded-xl border-2 transition-all text-left hover-lift ${formData.role === role.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${formData.role === role.value ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                        <Icon className={`w-4 h-4 ${formData.role === role.value ? 'text-white' : 'text-gray-600'}`} />
                                    </div>
                                    <span className={`text-sm font-medium ${formData.role === role.value ? 'text-blue-700' : 'text-gray-700'}`}>
                                        {role.label}
                                    </span>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Color Theme */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color Theme
                </label>
                <div className="grid grid-cols-6 gap-2">
                    {colorOptions.map(color => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, color: color.value })}
                            className={`p-2 rounded-xl border-2 transition-all btn-press ${formData.color === color.value
                                ? 'border-blue-500 ring-2 ring-blue-200 shadow-soft'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                            title={color.label}
                        >
                            <div className={`w-6 h-6 ${color.preview} rounded-lg mx-auto shadow-soft`}></div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Advanced Information Toggle */}
            <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-all"
            >
                {showAdvanced ? '▼ Hide' : '▶ Show'} Additional Information
            </button>

            {showAdvanced && (
                <div className="space-y-4 pt-2 border-t border-gray-200">
                    {/* Birth Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Birth Date
                        </label>
                        <input
                            type="date"
                            value={formData.birth_date}
                            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            aria-label="Birth date"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Phone className="w-4 h-4 inline mr-1" />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="(123) 456-7890"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full px-3 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                }`}
                            placeholder="email@example.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Address
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                            rows={2}
                            placeholder="Full address..."
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-1" />
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                            rows={3}
                            placeholder="Additional notes or information..."
                        />
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
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
                    {initialData?.name ? 'Update Member' : 'Add Member'}
                </button>
            </div>
        </form>
    )
}
