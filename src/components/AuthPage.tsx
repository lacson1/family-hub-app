import { useState } from 'react'
import { LogIn, UserPlus, Mail, Lock, User, Home, Zap } from 'lucide-react'
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

    // Demo credentials
    const DEMO_EMAIL = 'demo@familyhub.com'
    const DEMO_PASSWORD = 'demo123'

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

    const fillDemoCredentials = () => {
        setEmail(DEMO_EMAIL)
        setPassword(DEMO_PASSWORD)
        setError('')
    }

    const handleDemoLogin = async () => {
        setError('')
        setIsLoading(true)

        try {
            const result = await signIn(DEMO_EMAIL, DEMO_PASSWORD)
            if (!result.success) {
                setError(result.error || 'Demo login failed. The demo account may need to be created.')
            }
        } catch (err) {
            setError('Failed to login with demo account')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <Home className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Hub</h1>
                    <p className="text-gray-600">
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </p>
                </div>

                {/* Auth Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name field (sign up only) */}
                        {isSignUp && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter your full name"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter your email"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Confirm Password field (sign up only) */}
                        {isSignUp && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Confirm your password"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Login Button (sign in only) */}
                    {!isSignUp && (
                        <div className="mt-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">or try demo</span>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button
                                    type="button"
                                    onClick={fillDemoCredentials}
                                    disabled={isLoading}
                                    className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <Mail className="w-4 h-4" />
                                    <span>Fill Demo</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDemoLogin}
                                    disabled={isLoading}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <Zap className="w-4 h-4" />
                                    <span>Quick Login</span>
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-center text-gray-500">
                                Fill the form with demo credentials or login instantly
                            </p>
                        </div>
                    )}

                    {/* Toggle between sign in/sign up */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={toggleMode}
                            disabled={isLoading}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                        >
                            {isSignUp ? (
                                <>
                                    Already have an account?{' '}
                                    <span className="font-semibold text-blue-600">Sign In</span>
                                </>
                            ) : (
                                <>
                                    Don't have an account?{' '}
                                    <span className="font-semibold text-blue-600">Sign Up</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Demo credentials hint */}
                {!isSignUp && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                        <p>New to Family Hub? Sign up to get started!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

