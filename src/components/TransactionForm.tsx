import { useState } from 'react'

interface TransactionFormProps {
    onSubmit: (data: {
        type: 'income' | 'expense'
        category: string
        amount: number
        description?: string
        date: string
        payment_method?: string
    }) => void
    onCancel: () => void
    initialData?: {
        type: 'income' | 'expense'
        category: string
        amount: number
        description?: string
        date: string
        payment_method?: string
    }
}

const incomeCategories = [
    'Salary',
    'Freelance',
    'Investment',
    'Gift',
    'Refund',
    'Other Income'
]

const expenseCategories = [
    'Groceries',
    'Dining',
    'Transportation',
    'Utilities',
    'Rent/Mortgage',
    'Entertainment',
    'Healthcare',
    'Education',
    'Shopping',
    'Insurance',
    'Other Expense'
]

const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Mobile Payment',
    'Check',
    'Other'
]

export function TransactionForm({ onSubmit, onCancel, initialData }: TransactionFormProps) {
    const [formData, setFormData] = useState({
        type: initialData?.type || ('expense' as 'income' | 'expense'),
        category: initialData?.category || '',
        amount: initialData?.amount?.toString() || '',
        description: initialData?.description || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        payment_method: initialData?.payment_method || ''
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors: Record<string, string> = {}

        if (!formData.type) newErrors.type = 'Type is required'
        if (!formData.category) newErrors.category = 'Category is required'
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0'
        }
        if (!formData.date) newErrors.date = 'Date is required'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        onSubmit({
            type: formData.type,
            category: formData.category,
            amount: parseFloat(formData.amount),
            description: formData.description || undefined,
            date: formData.date,
            payment_method: formData.payment_method || undefined
        })
    }

    const categories = formData.type === 'income' ? incomeCategories : expenseCategories

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            setFormData({ ...formData, type: 'income', category: '' })
                            setErrors({ ...errors, type: '' })
                        }}
                        className={`p-3 rounded-xl border-2 transition-all font-medium ${formData.type === 'income'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 text-gray-700 hover:border-green-300'
                            }`}
                    >
                        Income
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setFormData({ ...formData, type: 'expense', category: '' })
                            setErrors({ ...errors, type: '' })
                        }}
                        className={`p-3 rounded-xl border-2 transition-all font-medium ${formData.type === 'expense'
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-gray-200 text-gray-700 hover:border-red-300'
                            }`}
                    >
                        Expense
                    </button>
                </div>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                    value={formData.category}
                    onChange={(e) => {
                        setFormData({ ...formData, category: e.target.value })
                        setErrors({ ...errors, category: '' })
                    }}
                    aria-label="Category"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.category ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                        setFormData({ ...formData, date: e.target.value })
                        setErrors({ ...errors, date: '' })
                    }}
                    aria-label="Transaction date"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.date ? 'border-red-500' : 'border-gray-300'
                        }`}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method (Optional)</label>
                <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    aria-label="Payment method"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                    <option value="">Select payment method</option>
                    {paymentMethods.map((method) => (
                        <option key={method} value={method}>
                            {method}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add a note..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
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
                    {initialData ? 'Update' : 'Add'} Transaction
                </button>
            </div>
        </form>
    )
}

