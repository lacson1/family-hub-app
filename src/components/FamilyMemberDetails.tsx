import { X, Phone, Mail, MapPin, FileText, Users, Edit2 } from 'lucide-react';
import { Avatar } from './Avatar';

interface FamilyMember {
    id: string;
    name: string;
    role: string;
    color: string;
    avatar_url?: string;
    avatar_pattern?: string;
    birth_date?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    generation?: number;
}

interface FamilyRelationship {
    id: string;
    person_id: string;
    related_person_id: string;
    relationship_type: 'parent' | 'child' | 'spouse' | 'sibling';
    person_name?: string;
    person_color?: string;
    related_person_name?: string;
    related_person_color?: string;
}

interface FamilyMemberDetailsProps {
    member: FamilyMember;
    relationships: FamilyRelationship[];
    onClose: () => void;
    onEdit: (member: FamilyMember) => void;
}

export function FamilyMemberDetails({ member, relationships, onClose, onEdit }: FamilyMemberDetailsProps) {
    const personRelationships = relationships.filter(
        r => r.person_id === member.id || r.related_person_id === member.id
    );

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const groupedRelationships = {
        parents: personRelationships.filter(r =>
            (r.related_person_id === member.id && r.relationship_type === 'parent') ||
            (r.person_id === member.id && r.relationship_type === 'child')
        ),
        children: personRelationships.filter(r =>
            (r.person_id === member.id && r.relationship_type === 'child') ||
            (r.related_person_id === member.id && r.relationship_type === 'parent')
        ),
        spouses: personRelationships.filter(r => r.relationship_type === 'spouse'),
        siblings: personRelationships.filter(r => r.relationship_type === 'sibling'),
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-t-2xl border-b border-gray-200">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-lg transition-all"
                        title="Close"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>

                    <div className="flex flex-col items-center">
                        <Avatar
                            name={member.name}
                            color={member.color}
                            avatarUrl={member.avatar_url}
                            avatarPattern={member.avatar_pattern}
                            size="xl"
                        />
                        <h2 className="text-2xl font-bold text-gray-900 mt-4">{member.name}</h2>
                        <p className="text-gray-600 mt-1">{member.role}</p>
                        {member.birth_date && (
                            <p className="text-sm text-gray-500 mt-2">
                                {calculateAge(member.birth_date)} years old • Born {new Date(member.birth_date).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => onEdit(member)}
                        className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Contact Information */}
                    {(member.phone || member.email || member.address) && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                Contact Information
                            </h3>
                            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                                {member.phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Phone className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="text-sm font-medium text-gray-900">{member.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {member.email && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Mail className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <a
                                                href={`mailto:${member.email}`}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                            >
                                                {member.email}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {member.address && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <MapPin className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Address</p>
                                            <p className="text-sm font-medium text-gray-900 whitespace-pre-line">{member.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Relationships */}
                    {personRelationships.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                Family Relationships ({personRelationships.length})
                            </h3>
                            <div className="space-y-3">
                                {groupedRelationships.parents.length > 0 && (
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <h4 className="text-sm font-bold text-blue-900 mb-2">Parents</h4>
                                        <div className="space-y-2">
                                            {groupedRelationships.parents.map(rel => (
                                                <div key={rel.id} className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${rel.person_id === member.id ? rel.related_person_color : rel.person_color}`}></div>
                                                    <span className="text-sm text-gray-900">
                                                        {rel.person_id === member.id ? rel.related_person_name : rel.person_name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {groupedRelationships.spouses.length > 0 && (
                                    <div className="bg-pink-50 rounded-xl p-4">
                                        <h4 className="text-sm font-bold text-pink-900 mb-2">Spouse</h4>
                                        <div className="space-y-2">
                                            {groupedRelationships.spouses.map(rel => (
                                                <div key={rel.id} className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${rel.person_id === member.id ? rel.related_person_color : rel.person_color}`}></div>
                                                    <span className="text-sm text-gray-900">
                                                        {rel.person_id === member.id ? rel.related_person_name : rel.person_name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {groupedRelationships.siblings.length > 0 && (
                                    <div className="bg-green-50 rounded-xl p-4">
                                        <h4 className="text-sm font-bold text-green-900 mb-2">Siblings</h4>
                                        <div className="space-y-2">
                                            {groupedRelationships.siblings.map(rel => (
                                                <div key={rel.id} className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${rel.person_id === member.id ? rel.related_person_color : rel.person_color}`}></div>
                                                    <span className="text-sm text-gray-900">
                                                        {rel.person_id === member.id ? rel.related_person_name : rel.person_name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {groupedRelationships.children.length > 0 && (
                                    <div className="bg-purple-50 rounded-xl p-4">
                                        <h4 className="text-sm font-bold text-purple-900 mb-2">Children</h4>
                                        <div className="space-y-2">
                                            {groupedRelationships.children.map(rel => (
                                                <div key={rel.id} className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${rel.person_id === member.id ? rel.related_person_color : rel.person_color}`}></div>
                                                    <span className="text-sm text-gray-900">
                                                        {rel.person_id === member.id ? rel.related_person_name : rel.person_name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {member.notes && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-500" />
                                Notes
                            </h3>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-700 whitespace-pre-line">{member.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div>
                            <p className="text-xs text-gray-500">Generation</p>
                            <p className="text-sm font-medium text-gray-900">
                                {member.generation === 0 ? 'Current' :
                                    member.generation && member.generation < 0 ? `Elder (${Math.abs(member.generation)})` :
                                        `Descendant (+${member.generation})`}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Color Theme</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`w-6 h-6 ${member.color} rounded-lg shadow-sm`}></div>
                                <span className="text-sm font-medium text-gray-900 capitalize">
                                    {member.color.replace('bg-', '').replace('-500', '')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

