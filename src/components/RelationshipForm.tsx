import { useState } from 'react';
import type { FormEvent } from 'react';
import { Users, Heart, Baby, UserPlus } from 'lucide-react';

interface FamilyMember {
    id: string;
    name: string;
    role: string;
    color: string;
}

interface RelationshipFormProps {
    familyMembers: FamilyMember[];
    onSubmit: (data: {
        person_id: string;
        related_person_id: string;
        relationship_type: 'parent' | 'child' | 'spouse' | 'sibling';
    }) => void;
    onCancel: () => void;
}

export function RelationshipForm({ familyMembers, onSubmit, onCancel }: RelationshipFormProps) {
    const [personId, setPersonId] = useState('');
    const [relatedPersonId, setRelatedPersonId] = useState('');
    const [relationshipType, setRelationshipType] = useState<'parent' | 'child' | 'spouse' | 'sibling'>('parent');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!personId || !relatedPersonId) {
            return;
        }

        if (personId === relatedPersonId) {
            alert('A person cannot have a relationship with themselves');
            return;
        }

        onSubmit({
            person_id: personId,
            related_person_id: relatedPersonId,
            relationship_type: relationshipType,
        });
    };

    const relationshipOptions = [
        { value: 'parent', label: 'Parent of', icon: Users, description: 'First person is parent of second person' },
        { value: 'child', label: 'Child of', icon: Baby, description: 'First person is child of second person' },
        { value: 'spouse', label: 'Spouse', icon: Heart, description: 'Both persons are married' },
        { value: 'sibling', label: 'Sibling', icon: UserPlus, description: 'Both persons are siblings' },
    ];

    const selectedPerson = familyMembers.find(m => m.id === personId);
    const selectedRelatedPerson = familyMembers.find(m => m.id === relatedPersonId);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Relationship Type Selection */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Relationship Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {relationshipOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setRelationshipType(option.value as 'parent' | 'child' | 'spouse' | 'sibling')}
                                className={`p-4 rounded-xl border-2 transition-all text-left hover-lift ${relationshipType === option.value
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg ${relationshipType === option.value ? 'bg-blue-500' : 'bg-gray-200'
                                        }`}>
                                        <Icon className={`w-4 h-4 ${relationshipType === option.value ? 'text-white' : 'text-gray-600'
                                            }`} />
                                    </div>
                                    <span className={`font-semibold ${relationshipType === option.value ? 'text-blue-700' : 'text-gray-700'
                                        }`}>
                                        {option.label}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">{option.description}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* First Person Selection */}
            <div>
                <label htmlFor="person" className="block text-sm font-semibold text-gray-700 mb-2">
                    First Person
                </label>
                <select
                    id="person"
                    value={personId}
                    onChange={(e) => setPersonId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all bg-white"
                    required
                >
                    <option value="">Select a family member...</option>
                    {familyMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                            {member.name} ({member.role})
                        </option>
                    ))}
                </select>
                {selectedPerson && (
                    <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 ${selectedPerson.color} rounded-lg flex items-center justify-center text-white font-bold shadow-soft`}>
                            {selectedPerson.name[0]}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">{selectedPerson.name}</p>
                            <p className="text-xs text-gray-500">{selectedPerson.role}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Relationship Indicator */}
            {personId && (
                <div className="flex items-center justify-center py-2">
                    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200">
                        <span className="text-sm font-medium text-gray-700">is</span>
                        <span className="text-sm font-bold text-blue-700">
                            {relationshipOptions.find(o => o.value === relationshipType)?.label}
                        </span>
                    </div>
                </div>
            )}

            {/* Second Person Selection */}
            <div>
                <label htmlFor="relatedPerson" className="block text-sm font-semibold text-gray-700 mb-2">
                    Second Person
                </label>
                <select
                    id="relatedPerson"
                    value={relatedPersonId}
                    onChange={(e) => setRelatedPersonId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all bg-white"
                    required
                >
                    <option value="">Select a family member...</option>
                    {familyMembers
                        .filter((member) => member.id !== personId)
                        .map((member) => (
                            <option key={member.id} value={member.id}>
                                {member.name} ({member.role})
                            </option>
                        ))}
                </select>
                {selectedRelatedPerson && (
                    <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 ${selectedRelatedPerson.color} rounded-lg flex items-center justify-center text-white font-bold shadow-soft`}>
                            {selectedRelatedPerson.name[0]}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">{selectedRelatedPerson.name}</p>
                            <p className="text-xs text-gray-500">{selectedRelatedPerson.role}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Preview */}
            {personId && relatedPersonId && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-green-800 mb-2">Relationship Preview:</p>
                    <div className="text-sm text-gray-700 space-y-1">
                        <p>
                            • <span className="font-medium">{selectedPerson?.name}</span> will be marked as{' '}
                            <span className="font-medium">{relationshipType}</span> of{' '}
                            <span className="font-medium">{selectedRelatedPerson?.name}</span>
                        </p>
                        {relationshipType === 'parent' && (
                            <p>
                                • <span className="font-medium">{selectedRelatedPerson?.name}</span> will automatically be marked as{' '}
                                <span className="font-medium">child</span> of{' '}
                                <span className="font-medium">{selectedPerson?.name}</span>
                            </p>
                        )}
                        {relationshipType === 'child' && (
                            <p>
                                • <span className="font-medium">{selectedRelatedPerson?.name}</span> will automatically be marked as{' '}
                                <span className="font-medium">parent</span> of{' '}
                                <span className="font-medium">{selectedPerson?.name}</span>
                            </p>
                        )}
                        {(relationshipType === 'spouse' || relationshipType === 'sibling') && (
                            <p>
                                • This relationship is reciprocal and applies to both persons
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!personId || !relatedPersonId}
                    className="flex-1 px-4 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-soft hover:shadow-medium"
                >
                    Add Relationship
                </button>
            </div>
        </form>
    );
}

