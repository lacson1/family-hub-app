import { useState, useEffect } from 'react';
import { Trash2, Users, Heart, Baby, UserPlus, Search, Filter, Download, Eye, Grid3x3, List, GitBranch } from 'lucide-react';
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

interface TreeNode {
    member: FamilyMember;
    spouse?: FamilyMember;
    children: TreeNode[];
    parents: FamilyMember[];
    siblings: FamilyMember[];
}

interface EnhancedFamilyTreeProps {
    members: FamilyMember[];
    relationships: FamilyRelationship[];
    onAddRelationship: () => void;
    onDeleteRelationship: (id: string) => void;
    onViewMemberDetails: (member: FamilyMember) => void;
}

export function EnhancedFamilyTree({
    members,
    relationships,
    onAddRelationship,
    onDeleteRelationship,
    onViewMemberDetails
}: EnhancedFamilyTreeProps) {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'tree' | 'grid' | 'list' | 'generation'>('tree');

    const filteredMembers = members.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || member.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const roles = Array.from(new Set(members.map(m => m.role)));

    // Build family tree structure
    const buildTree = (): TreeNode[] => {
        const memberMap = new Map(filteredMembers.map(m => [m.id, m]));
        const processedNodes = new Set<string>();

        const roots: TreeNode[] = [];

        filteredMembers.forEach(member => {
            const hasParent = relationships.some(
                r => r.related_person_id === member.id && r.relationship_type === 'parent' &&
                    filteredMembers.some(m => m.id === r.person_id)
            );

            if (!hasParent && !processedNodes.has(member.id)) {
                const node = buildNodeTree(member.id, memberMap, relationships, processedNodes);
                if (node) roots.push(node);
            }
        });

        if (roots.length === 0 && filteredMembers.length > 0) {
            filteredMembers.forEach(member => {
                if (!processedNodes.has(member.id)) {
                    const node = buildNodeTree(member.id, memberMap, relationships, processedNodes);
                    if (node) roots.push(node);
                }
            });
        }

        return roots;
    };

    const buildNodeTree = (
        memberId: string,
        memberMap: Map<string, FamilyMember>,
        relationships: FamilyRelationship[],
        processedNodes: Set<string>
    ): TreeNode | null => {
        const member = memberMap.get(memberId);
        if (!member) return null;

        processedNodes.add(memberId);

        const spouseRel = relationships.find(
            r => (r.person_id === memberId || r.related_person_id === memberId) &&
                r.relationship_type === 'spouse'
        );
        const spouseId = spouseRel
            ? (spouseRel.person_id === memberId ? spouseRel.related_person_id : spouseRel.person_id)
            : undefined;
        const spouse = spouseId ? memberMap.get(spouseId) : undefined;

        const childRelationships = relationships.filter(
            r => r.person_id === memberId && r.relationship_type === 'child'
        );
        const children: TreeNode[] = childRelationships
            .map(r => {
                if (!processedNodes.has(r.related_person_id)) {
                    return buildNodeTree(r.related_person_id, memberMap, relationships, processedNodes);
                }
                return null;
            })
            .filter((node): node is TreeNode => node !== null);

        const parentRelationships = relationships.filter(
            r => r.related_person_id === memberId && r.relationship_type === 'parent'
        );
        const parents = parentRelationships
            .map(r => memberMap.get(r.person_id))
            .filter((p): p is FamilyMember => p !== undefined);

        const siblingRelationships = relationships.filter(
            r => (r.person_id === memberId || r.related_person_id === memberId) &&
                r.relationship_type === 'sibling'
        );
        const siblings = siblingRelationships
            .map(r => {
                const siblingId = r.person_id === memberId ? r.related_person_id : r.person_id;
                return memberMap.get(siblingId);
            })
            .filter((s): s is FamilyMember => s !== undefined);

        return { member, spouse, children, parents, siblings };
    };

    const toggleNode = (id: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const getPersonRelationships = (personId: string) => {
        return relationships.filter(
            r => r.person_id === personId || r.related_person_id === personId
        );
    };

    const handleExport = () => {
        // Create a simple text export
        const exportData = members.map(m => ({
            name: m.name,
            role: m.role,
            generation: m.generation,
            relationships: getPersonRelationships(m.id).length
        }));

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `family-tree-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const renderMemberCard = (member: FamilyMember, spouse?: FamilyMember) => {
        const personRelationships = getPersonRelationships(member.id);

        const MemberCard = ({ person }: { person: FamilyMember }) => (
            <div
                onClick={() => setSelectedPerson(selectedPerson === person.id ? null : person.id)}
                className={`group relative bg-white rounded-xl p-4 shadow-medium border-2 transition-all cursor-pointer hover-lift w-40 ${selectedPerson === person.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                    }`}
            >
                <div className="flex flex-col items-center">
                    <Avatar
                        name={person.name}
                        color={person.color}
                        avatarUrl={person.avatar_url}
                        avatarPattern={person.avatar_pattern}
                        size="md"
                    />
                    <h4 className="font-bold text-gray-900 text-center text-sm truncate mt-2 w-full">{person.name}</h4>
                    <p className="text-xs text-gray-500 text-center mt-1">{person.role}</p>
                    {person.birth_date && (
                        <p className="text-xs text-gray-400 mt-1">
                            Age: {new Date().getFullYear() - new Date(person.birth_date).getFullYear()}
                        </p>
                    )}
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewMemberDetails(person);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-md hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                    title="View details"
                >
                    <Eye className="w-3 h-3 text-blue-600" />
                </button>

                {selectedPerson === person.id && personRelationships.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10 max-h-40 overflow-y-auto">
                        <div className="text-xs space-y-1">
                            {personRelationships.map(rel => (
                                <div key={rel.id} className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded">
                                    <div className="flex-1 min-w-0">
                                        <span className="text-gray-600 capitalize">{rel.relationship_type}: </span>
                                        <span className="font-medium text-gray-900">
                                            {rel.person_id === person.id ? rel.related_person_name : rel.person_name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteRelationship(rel.id);
                                        }}
                                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all flex-shrink-0"
                                        title="Delete relationship"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );

        return (
            <div key={member.id} className="inline-block">
                <div className="flex items-center gap-2 mb-4">
                    <MemberCard person={member} />
                    {spouse && (
                        <>
                            <div className="flex flex-col items-center mx-1">
                                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                            </div>
                            <MemberCard person={spouse} />
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderTreeNode = (node: TreeNode, depth: number = 0) => {
        const hasChildren = node.children.length > 0;
        const isExpanded = expandedNodes.has(node.member.id) || depth === 0;

        return (
            <div key={node.member.id} className="flex flex-col items-center">
                <div className="flex flex-col items-center">
                    {renderMemberCard(node.member, node.spouse)}

                    {hasChildren && (
                        <button
                            onClick={() => toggleNode(node.member.id)}
                            className="my-2 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                        >
                            {isExpanded ? '▼ Hide Children' : '▶ Show Children'}
                        </button>
                    )}
                </div>

                {hasChildren && isExpanded && (
                    <div className="mt-4 relative">
                        <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-gray-300 -translate-x-1/2"></div>

                        <div className="flex gap-8 pt-4">
                            {node.children.map((child, index) => (
                                <div key={child.member.id} className="relative">
                                    {node.children.length > 1 && (
                                        <>
                                            <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-gray-300 -translate-x-1/2"></div>
                                            {index === 0 && (
                                                <div className="absolute top-0 left-1/2 right-0 h-0.5 bg-gray-300"></div>
                                            )}
                                            {index === node.children.length - 1 && (
                                                <div className="absolute top-0 left-0 right-1/2 h-0.5 bg-gray-300"></div>
                                            )}
                                            {index > 0 && index < node.children.length - 1 && (
                                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-300"></div>
                                            )}
                                        </>
                                    )}
                                    {renderTreeNode(child, depth + 1)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderGridView = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMembers.map(member => (
                <div
                    key={member.id}
                    className="bg-white rounded-xl p-4 shadow-medium border border-gray-100 hover-lift cursor-pointer"
                    onClick={() => onViewMemberDetails(member)}
                >
                    <div className="flex flex-col items-center">
                        <Avatar
                            name={member.name}
                            color={member.color}
                            avatarUrl={member.avatar_url}
                            avatarPattern={member.avatar_pattern}
                            size="lg"
                        />
                        <h4 className="font-bold text-gray-900 text-center mt-3">{member.name}</h4>
                        <p className="text-sm text-gray-500 text-center mt-1">{member.role}</p>
                        <div className="mt-3 text-xs text-gray-400">
                            {getPersonRelationships(member.id).length} relationships
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderListView = () => (
        <div className="space-y-2">
            {filteredMembers.map(member => {
                const personRelationships = getPersonRelationships(member.id);
                return (
                    <div
                        key={member.id}
                        className="bg-white rounded-xl p-4 shadow-medium border border-gray-100 hover-lift cursor-pointer flex items-center gap-4"
                        onClick={() => onViewMemberDetails(member)}
                    >
                        <Avatar
                            name={member.name}
                            color={member.color}
                            avatarUrl={member.avatar_url}
                            avatarPattern={member.avatar_pattern}
                            size="md"
                        />
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{member.name}</h4>
                            <p className="text-sm text-gray-500">{member.role}</p>
                            {member.email && (
                                <p className="text-xs text-gray-400 mt-1">{member.email}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-700">{personRelationships.length}</p>
                            <p className="text-xs text-gray-500">relationships</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderGenerationalView = () => {
        const generations = new Map<number, FamilyMember[]>();

        filteredMembers.forEach(member => {
            const gen = member.generation || 0;
            if (!generations.has(gen)) {
                generations.set(gen, []);
            }
            generations.get(gen)!.push(member);
        });

        const sortedGenerations = Array.from(generations.entries()).sort((a, b) => a[0] - b[0]);

        return (
            <div className="space-y-6">
                {sortedGenerations.map(([gen, genMembers]) => (
                    <div key={gen} className="bg-white rounded-xl p-6 shadow-medium border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            {gen < 0 ? `Generation ${Math.abs(gen)} (Elders)` :
                                gen === 0 ? 'Current Generation' :
                                    `Generation +${gen} (Descendants)`}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {genMembers.map(member => (
                                <div
                                    key={member.id}
                                    className="text-center cursor-pointer hover-lift"
                                    onClick={() => onViewMemberDetails(member)}
                                >
                                    <Avatar
                                        name={member.name}
                                        color={member.color}
                                        avatarUrl={member.avatar_url}
                                        avatarPattern={member.avatar_pattern}
                                        size="lg"
                                    />
                                    <h4 className="font-semibold text-gray-900 text-sm mt-2">{member.name}</h4>
                                    <p className="text-xs text-gray-500">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const treeData = buildTree();

    useEffect(() => {
        const allIds = filteredMembers.map(m => m.id);
        setExpandedNodes(new Set(allIds));
    }, [filteredMembers]);

    if (members.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 shadow-medium border border-gray-100 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No family members yet</h4>
                <p className="text-gray-500 text-sm mb-4">Add family members first to build your family tree</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Controls */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-medium">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Family Tree</h3>
                            <p className="text-sm text-gray-600">
                                {filteredMembers.length} members, {relationships.length} relationships
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={onAddRelationship}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium text-sm"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add Relationship
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-medium shadow-soft hover:shadow-medium text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border-2 border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border-2 border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm appearance-none"
                            aria-label="Filter by role"
                        >
                            <option value="all">All Roles</option>
                            {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>

                    {/* View Mode Selector */}
                    <div className="col-span-full md:col-span-2 flex gap-2 justify-end">
                        <button
                            onClick={() => setViewMode('tree')}
                            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${viewMode === 'tree' ? 'bg-blue-500 text-white' : 'bg-white/70 text-gray-700 hover:bg-white'
                                }`}
                            title="Tree View"
                        >
                            <GitBranch className="w-4 h-4" />
                            Tree
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white/70 text-gray-700 hover:bg-white'
                                }`}
                            title="Grid View"
                        >
                            <Grid3x3 className="w-4 h-4" />
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white/70 text-gray-700 hover:bg-white'
                                }`}
                            title="List View"
                        >
                            <List className="w-4 h-4" />
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('generation')}
                            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${viewMode === 'generation' ? 'bg-blue-500 text-white' : 'bg-white/70 text-gray-700 hover:bg-white'
                                }`}
                            title="Generation View"
                        >
                            <Users className="w-4 h-4" />
                            Generations
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 mt-3">
                    <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-700">Parent/Child</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                            <span className="text-gray-700">Spouse</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Baby className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700">Sibling</span>
                        </div>
                        <div className="ml-auto text-gray-500">Click members to see relationships</div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl p-8 shadow-medium border border-gray-100 overflow-x-auto">
                {viewMode === 'tree' && (
                    <div className="min-w-max">
                        {treeData.length > 0 ? (
                            <div className="flex gap-12 justify-center">
                                {treeData.map(node => renderTreeNode(node))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-sm">
                                    {searchTerm || filterRole !== 'all'
                                        ? 'No members match your search criteria'
                                        : 'Add relationships to visualize your family tree'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
                {viewMode === 'grid' && renderGridView()}
                {viewMode === 'list' && renderListView()}
                {viewMode === 'generation' && renderGenerationalView()}
            </div>
        </div>
    );
}

