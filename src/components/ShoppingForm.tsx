import React, { useState } from 'react'
import { ShoppingCart, AlertCircle } from 'lucide-react'

interface ShoppingFormProps {
    onSubmit: (item: {
        name: string
        quantity: string
        category: 'Groceries' | 'Household' | 'Personal' | 'Other'
        notes?: string
    }) => void
    onCancel: () => void
    initialData?: {
        name: string
        quantity: string
        category: 'Groceries' | 'Household' | 'Personal' | 'Other'
        notes?: string
    }
}

export const ShoppingForm: React.FC<ShoppingFormProps> = ({
    onSubmit,
    onCancel,
    initialData
}) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        quantity: initialData?.quantity || '',
        category: initialData?.category || 'Groceries' as 'Groceries' | 'Household' | 'Personal' | 'Other',
        notes: initialData?.notes || ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Item name is required'
        }
        if (!formData.quantity.trim()) {
            newErrors.quantity = 'Quantity is required'
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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                </label>
                <div className="relative">
                    <ShoppingCart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                        placeholder="Enter item name..."
                        aria-label="Shopping item name"
                    />
                </div>
                {errors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                </label>
                <input
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.quantity ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                    placeholder="e.g., 2 gallons, 1 bottle..."
                    aria-label="Item quantity"
                />
                {errors.quantity && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.quantity}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                </label>
                <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Groceries' | 'Household' | 'Personal' | 'Other' })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                    aria-label="Select item category"
                >
                    <option value="Groceries">Groceries</option>
                    <option value="Household">Household</option>
                    <option value="Personal">Personal</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                </label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                    placeholder="Add any additional notes..."
                    aria-label="Item notes"
                />
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
                    className="flex-1 px-4 py-2.5 text-white bg-purple-500 rounded-xl hover:bg-purple-600 transition-all font-medium btn-press shadow-soft hover:shadow-medium"
                >
                    {initialData ? 'Update Item' : 'Add Item'}
                </button>
            </div>
        </form>
    )
}
