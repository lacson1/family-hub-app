import { useState } from 'react'

interface BudgetFormProps {
    onSubmit: (data: {
        category: string
        amount: number
        period: 'monthly' | 'yearly'
    }) => void
    onCancel: () => void
    initialData?: {
        category: string
        amount: number
        period: 'monthly' | 'yearly'
    }
    categories: string[]
}

export function BudgetForm({ onSubmit, onCancel, initialData, categories }: BudgetFormProps) {
    const [formData, setFormData] = useState({
        category: initialData?.category || '',
        amount: initialData?.amount?.toString() || '',
        period: initialData?.period || ('monthly' as 'monthly' | 'yearly')
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors: Record<string, string> = {}

        if (!formData.category) newErrors.category = 'Category is required'
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        onSubmit({
            category: formData.category,
            amount: parseFloat(formData.amount),
            period: formData.period
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                    value={formData.category}
                    onChange={(e) => {
                        setFormData({ ...formData, category: e.target.value })
                        setErrors({ ...errors, category: '' })
                    }}
                    disabled={!!initialData}
                    aria-label="Budget category"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.category ? 'border-red-500' : 'border-gray-300'
                        } ${initialData ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Amount</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => {
                            setFormData({ ...formData, amount: e.target.value })
                            setErrors({ ...errors, amount: '' })
                        }}
                        placeholder="0.00"
                        className={`w-full pl-8 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.amount ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                </div>
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, period: 'monthly' })}
                        className={`p-3 rounded-xl border-2 transition-all font-medium ${formData.period === 'monthly'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-700 hover:border-blue-300'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, period: 'yearly' })}
                        className={`p-3 rounded-xl border-2 transition-all font-medium ${formData.period === 'yearly'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-700 hover:border-blue-300'
                            }`}
                    >
                        Yearly
                    </button>
                </div>
            </div>

            <div className="flex space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium"
                >
                    {initialData ? 'Update' : 'Create'} Budget
                </button>
            </div>
        </form>
    )
}

