import { useState } from 'react'
import { LogIn, UserPlus, Mail, Lock, User, Heart, Users, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const { signIn, signUp } = useAuth()

    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!email || !password) {
            setError('Please fill in all fields')
            return
        }

        if (isSignUp) {
            if (!name) {
                setError('Please enter your name')
                return
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match')
                return
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters')
                return
            }
        }

        setIsLoading(true)

        try {
            let result
            if (isSignUp) {
                result = await signUp(name, email, password)
            } else {
                result = await signIn(email, password)
            }

            if (!result.success) {
                setError(result.error || 'Authentication failed')
            }
        } catch (err) {
            setError('An unexpected error occurred')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleMode = () => {
        setIsSignUp(!isSignUp)
        setError('')
        setName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
    }

    

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header with Family Illustration */}
                <div className="text-center mb-12 animate-fade-in">
                    {/* Family Illustration */}
                    <div className="relative mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-lg hover-lift">
                            <Users className="w-10 h-10 text-white" />
                        </div>
                        {/* Floating decorative elements */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center animate-bounce">
                            <Heart className="w-3 h-3 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                            <Sparkles className="w-2.5 h-2.5 text-white" />
                        </div>
                    </div>
                    
                    <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                        Family Hub
                    </h1>
                    <p className="text-lg text-gray-600 font-medium">
                        {isSignUp ? 'Join your family\'s digital home' : 'Welcome back to your family'}
                    </p>
                </div>

                {/* Auth Form */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-white/20 p-8 hover-lift">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name field (sign up only) */}
                        {isSignUp && (
                            <div className="animate-slide-up stagger-1">
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-3">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50/50 hover:bg-white/80 focus:bg-white"
                                        placeholder="Enter your full name"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email field */}
                        <div className="animate-slide-up stagger-2">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-3">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50/50 hover:bg-white/80 focus:bg-white"
                                    placeholder="Enter your email"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="animate-slide-up stagger-3">
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-3">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50/50 hover:bg-white/80 focus:bg-white"
                                    placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Confirm Password field (sign up only) */}
                        {isSignUp && (
                            <div className="animate-slide-up stagger-4">
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-3">
                                    Confirm Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50/50 hover:bg-white/80 focus:bg-white"
                                        placeholder="Confirm your password"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50/80 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm font-medium animate-scale-in">
                                {error}
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 btn-press hover-lift"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    {isSignUp ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
                                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    

                    {/* Toggle between sign in/sign up */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={toggleMode}
                            disabled={isLoading}
                            className="text-base text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 font-medium"
                        >
                            {isSignUp ? (
                                <>
                                    Already have an account?{' '}
                                    <span className="font-bold text-blue-600 hover:text-blue-700">Sign In</span>
                                </>
                            ) : (
                                <>
                                    Don't have an account?{' '}
                                    <span className="font-bold text-blue-600 hover:text-blue-700">Sign Up</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Welcome message */}
                {!isSignUp && (
                    <div className="mt-8 text-center animate-fade-in">
                        <div className="inline-flex items-center space-x-2 text-gray-500">
                            <Heart className="w-4 h-4 text-pink-400" />
                            <span className="text-sm font-medium">New to Family Hub? Sign up to get started!</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

