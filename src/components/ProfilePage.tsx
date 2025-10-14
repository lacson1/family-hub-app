import { useState } from 'react'
import { User, Mail, Calendar, LogOut, Edit2, Save, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function ProfilePage() {
    const { user, signOut, updateUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState(user?.name || '')
    const [editedEmail, setEditedEmail] = useState(user?.email || '')
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    if (!user) return null

    const handleSave = () => {
        updateUser({
            name: editedName,
            email: editedEmail,
        })
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditedName(user.name)
        setEditedEmail(user.email)
        setIsEditing(false)
    }

    const handleSignOut = () => {
        signOut()
        setShowLogoutConfirm(false)
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }

    // Generate color based on name
    const getColorFromName = (name: string) => {
        const colors = [
            'from-pink-500 to-purple-500',
            'from-blue-500 to-cyan-500',
            'from-green-500 to-emerald-500',
            'from-orange-500 to-red-500',
            'from-purple-500 to-pink-500',
            'from-yellow-500 to-orange-500',
        ]
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        return colors[hash % colors.length]
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
                <p className="text-gray-600">Manage your account information and preferences</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Cover Image */}
                <div className={`h-32 bg-gradient-to-r ${getColorFromName(user.name)}`} />

                {/* Profile Content */}
                <div className="p-8">
                    {/* Avatar and Name */}
                    <div className="flex items-start justify-between -mt-20 mb-6">
                        <div className="flex items-end space-x-4">
                            {/* Avatar */}
                            <div className="relative">
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name}
                                        className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover"
                                    />
                                ) : (
                                    <div
                                        className={`w-32 h-32 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br ${getColorFromName(
                                            user.name
                                        )} flex items-center justify-center text-white text-4xl font-bold`}
                                    >
                                        {getInitials(user.name)}
                                    </div>
                                )}
                            </div>

                            {/* Name and Email Preview */}
                            <div className="pb-2">
                                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-gray-600">{user.email}</p>
                            </div>
                        </div>

                        {/* Edit/Save Button */}
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md hover:shadow-lg"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit Profile</span>
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Save</span>
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all shadow-md hover:shadow-lg"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Profile Details */}
                    <div className="space-y-6 mb-8">
                        {/* Name Field */}
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                                <User className="w-4 h-4" />
                                <span>Full Name</span>
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter your full name"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{user.name}</div>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                                <Mail className="w-4 h-4" />
                                <span>Email Address</span>
                            </label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={editedEmail}
                                    onChange={(e) => setEditedEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter your email"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{user.email}</div>
                            )}
                        </div>

                        {/* Member Since */}
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="w-4 h-4" />
                                <span>Member Since</span>
                            </label>
                            <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                                {formatDate(user.created_at)}
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>

                        {!showLogoutConfirm ? (
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Sign Out</span>
                            </button>
                        ) : (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-red-800 font-medium mb-4">
                                    Are you sure you want to sign out?
                                </p>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleSignOut}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium"
                                    >
                                        Yes, Sign Out
                                    </button>
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

