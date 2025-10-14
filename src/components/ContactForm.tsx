import { useState } from 'react';
import { X } from 'lucide-react';
import type { Contact, ContactFamilyAssociation, FamilyMember } from '../services/api';

interface ContactFormProps {
    contact?: Contact;
    associations?: ContactFamilyAssociation[];
    familyMembers: FamilyMember[];
    currentUser: string;
    onSubmit: (contact: Omit<Contact, 'id' | 'is_favorite' | 'created_at' | 'updated_at'>, selectedMembers: { family_member_id: string; relationship_notes: string }[]) => void;
    onClose: () => void;
}

export const ContactForm = ({ contact, associations = [], familyMembers, currentUser, onSubmit, onClose }: ContactFormProps) => {
    const [formData, setFormData] = useState({
        name: contact?.name || '',
        category: contact?.category || 'Family' as const,
        phone: contact?.phone || '',
        email: contact?.email || '',
        address: contact?.address || '',
        company_organization: contact?.company_organization || '',
        job_title_specialty: contact?.job_title_specialty || '',
        notes: contact?.notes || '',
        created_by: contact?.created_by || currentUser,
    });

    const [selectedMembers, setSelectedMembers] = useState<{ family_member_id: string; relationship_notes: string }[]>(
        associations.map(a => ({ family_member_id: a.family_member_id, relationship_notes: a.relationship_notes || '' }))
    );

    const [errors, setErrors] = useState<Record<string, string>>({});

    const categories: Contact['category'][] = [
        'Family', 'Friends', 'Medical', 'Services', 'Emergency', 'School', 'Work', 'Other'
    ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData, selectedMembers);
        }
    };

    const handleAddMember = (memberId: string) => {
        if (!selectedMembers.find(m => m.family_member_id === memberId)) {
            setSelectedMembers([...selectedMembers, { family_member_id: memberId, relationship_notes: '' }]);
        }
    };

    const handleRemoveMember = (memberId: string) => {
        setSelectedMembers(selectedMembers.filter(m => m.family_member_id !== memberId));
    };

    const handleUpdateRelationshipNotes = (memberId: string, notes: string) => {
        setSelectedMembers(selectedMembers.map(m =>
            m.family_member_id === memberId ? { ...m, relationship_notes: notes } : m
        ));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="John Smith"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as Contact['category'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        aria-label="Contact category"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Company/Organization */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company/Organization
                    </label>
                    <input
                        type="text"
                        value={formData.company_organization}
                        onChange={(e) => setFormData({ ...formData, company_organization: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Acme Hospital"
                    />
                </div>

                {/* Job Title/Specialty */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title/Specialty
                    </label>
                    <input
                        type="text"
                        value={formData.job_title_specialty}
                        onChange={(e) => setFormData({ ...formData, job_title_specialty: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Pediatrician"
                    />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                    </label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="123 Main St, City, State 12345"
                    />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows={3}
                        placeholder="Additional information..."
                    />
                </div>
            </div>

            {/* Family Member Associations */}
            <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link to Family Members
                </label>

                {/* Add Member Dropdown */}
                <select
                    onChange={(e) => {
                        if (e.target.value) {
                            handleAddMember(e.target.value);
                            e.target.value = '';
                        }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
                    defaultValue=""
                    aria-label="Add family member"
                >
                    <option value="">Select a family member...</option>
                    {familyMembers
                        .filter(m => !selectedMembers.find(sm => sm.family_member_id === m.id))
                        .map(member => (
                            <option key={member.id} value={member.id}>
                                {member.name}
                            </option>
                        ))}
                </select>

                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                    <div className="space-y-2">
                        {selectedMembers.map(sm => {
                            const member = familyMembers.find(m => m.id === sm.family_member_id);
                            if (!member) return null;
                            return (
                                <div key={sm.family_member_id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: member.color }}
                                            />
                                            <span className="text-sm font-medium">{member.name}</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={sm.relationship_notes}
                                            onChange={(e) => handleUpdateRelationshipNotes(sm.family_member_id, e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="e.g., Emma's dentist"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMember(sm.family_member_id)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        aria-label="Remove family member"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    {contact ? 'Update Contact' : 'Create Contact'}
                </button>
            </div>
        </form>
    );
};

