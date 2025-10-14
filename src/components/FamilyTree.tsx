import { useState, useEffect } from 'react';
import { Trash2, Users, Heart, Baby, UserPlus } from 'lucide-react';

interface FamilyMember {
    id: string;
    name: string;
    role: string;
    color: string;
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

interface FamilyTreeProps {
    members: FamilyMember[];
    relationships: FamilyRelationship[];
    onAddRelationship: () => void;
    onDeleteRelationship: (id: string) => void;
}

export function FamilyTree({ members, relationships, onAddRelationship, onDeleteRelationship }: FamilyTreeProps) {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

    // Build family tree structure
    const buildTree = (): TreeNode[] => {
        const memberMap = new Map(members.map(m => [m.id, m]));
        const processedNodes = new Set<string>();

        // Find root members (those without parents)
        const roots: TreeNode[] = [];

        members.forEach(member => {
            const hasParent = relationships.some(
                r => r.related_person_id === member.id && r.relationship_type === 'parent'
            );

            if (!hasParent && !processedNodes.has(member.id)) {
                const node = buildNodeTree(member.id, memberMap, relationships, processedNodes);
                if (node) roots.push(node);
            }
        });

        // If no roots found (circular relationships), just show all members
        if (roots.length === 0 && members.length > 0) {
            members.forEach(member => {
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

        // Find spouse
        const spouseRel = relationships.find(
            r => (r.person_id === memberId || r.related_person_id === memberId) && r.relationship_type === 'spouse'
        );
        const spouseId = spouseRel
            ? (spouseRel.person_id === memberId ? spouseRel.related_person_id : spouseRel.person_id)
            : undefined;
        const spouse = spouseId ? memberMap.get(spouseId) : undefined;

        // Find children
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

        // Find parents
        const parentRelationships = relationships.filter(
            r => r.related_person_id === memberId && r.relationship_type === 'parent'
        );
        const parents = parentRelationships
            .map(r => memberMap.get(r.person_id))
            .filter((p): p is FamilyMember => p !== undefined);

        // Find siblings
        const siblingRelationships = relationships.filter(
            r => (r.person_id === memberId || r.related_person_id === memberId) && r.relationship_type === 'sibling'
        );
        const siblings = siblingRelationships
            .map(r => {
                const siblingId = r.person_id === memberId ? r.related_person_id : r.person_id;
                return memberMap.get(siblingId);
            })
            .filter((s): s is FamilyMember => s !== undefined);

        return {
            member,
            spouse,
            children,
            parents,
            siblings,
        };
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

    const renderMemberCard = (member: FamilyMember, spouse?: FamilyMember) => {
        const personRelationships = getPersonRelationships(member.id);

        return (
            <div key={member.id} className="inline-block">
                <div className="flex items-center gap-2 mb-4">
                    {/* Member Card */}
                    <div
                        onClick={() => setSelectedPerson(selectedPerson === member.id ? null : member.id)}
                        className={`group relative bg-white rounded-xl p-4 shadow-medium border-2 transition-all cursor-pointer hover-lift w-40 ${selectedPerson === member.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                            }`}
                    >
                        <div className={`w-12 h-12 ${member.color} rounded-lg mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold shadow-soft`}>
                            {member.name[0]}
                        </div>
                        <h4 className="font-bold text-gray-900 text-center text-sm truncate">{member.name}</h4>
                        <p className="text-xs text-gray-500 text-center mt-1">{member.role}</p>

                        {selectedPerson === member.id && personRelationships.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10 max-h-40 overflow-y-auto">
                                <div className="text-xs space-y-1">
                                    {personRelationships.map(rel => (
                                        <div key={rel.id} className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded">
                                            <div className="flex-1 min-w-0">
                                                <span className="text-gray-600 capitalize">{rel.relationship_type}: </span>
                                                <span className="font-medium text-gray-900">
                                                    {rel.person_id === member.id ? rel.related_person_name : rel.person_name}
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

                    {/* Spouse Card */}
                    {spouse && (
                        <>
                            <div className="flex flex-col items-center mx-1">
                                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                            </div>
                            <div
                                onClick={() => setSelectedPerson(selectedPerson === spouse.id ? null : spouse.id)}
                                className={`group relative bg-white rounded-xl p-4 shadow-medium border-2 transition-all cursor-pointer hover-lift w-40 ${selectedPerson === spouse.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                                    }`}
                            >
                                <div className={`w-12 h-12 ${spouse.color} rounded-lg mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold shadow-soft`}>
                                    {spouse.name[0]}
                                </div>
                                <h4 className="font-bold text-gray-900 text-center text-sm truncate">{spouse.name}</h4>
                                <p className="text-xs text-gray-500 text-center mt-1">{spouse.role}</p>
                            </div>
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
                        {/* Connection line */}
                        <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-gray-300 -translate-x-1/2"></div>

                        <div className="flex gap-8 pt-4">
                            {node.children.map((child, index) => (
                                <div key={child.member.id} className="relative">
                                    {/* Connection lines */}
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

    const treeData = buildTree();

    useEffect(() => {
        // Expand all nodes by default
        const allIds = members.map(m => m.id);
        setExpandedNodes(new Set(allIds));
    }, [members]);

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
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-medium">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Family Tree</h3>
                            <p className="text-sm text-gray-600">
                                {members.length} members, {relationships.length} relationships
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onAddRelationship}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span className="text-sm">Add Relationship</span>
                    </button>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                    <div className="flex flex-wrap gap-3 text-xs">
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

            <div className="bg-white rounded-2xl p-8 shadow-medium border border-gray-100 overflow-x-auto">
                <div className="min-w-max">
                    {treeData.length > 0 ? (
                        <div className="flex gap-12 justify-center">
                            {treeData.map(node => renderTreeNode(node))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-sm">
                                Add relationships to visualize your family tree
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

