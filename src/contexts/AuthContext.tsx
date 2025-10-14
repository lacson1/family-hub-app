import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface User {
    id: string
    name: string
    email: string
    avatar_url?: string
    created_at?: string
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
    signOut: () => void
    updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// No default user in production; rely on backend session

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Load user from backend session on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    method: 'GET',
                    credentials: 'include',
                })
                if (response.ok) {
                    const data = await response.json()
                    if (data?.user?.id && data?.user?.name && data?.user?.email) {
                        setUser(data.user)
                        localStorage.setItem('familyHubUser', JSON.stringify(data.user))
                    } else {
                        setUser(null)
                        localStorage.removeItem('familyHubUser')
                    }
                } else {
                    setUser(null)
                    localStorage.removeItem('familyHubUser')
                }
            } catch (error) {
                console.error('Failed to load user from session:', error)
                setUser(null)
                localStorage.removeItem('familyHubUser')
            } finally {
                setIsLoading(false)
            }
        }

        loadUser()
    }, [])

    const signIn = async (email: string, password: string) => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                const userWithoutPassword = data.user
                // Validate user data before setting
                if (userWithoutPassword && userWithoutPassword.id && userWithoutPassword.name && userWithoutPassword.email) {
                    setUser(userWithoutPassword)
                    localStorage.setItem('familyHubUser', JSON.stringify(userWithoutPassword))
                    return { success: true }
                } else {
                    return { success: false, error: 'Invalid user data received from server' }
                }
            } else {
                return { success: false, error: data.error || 'Invalid email or password' }
            }
        } catch (error) {
            console.error('Sign in error:', error)
            return { success: false, error: 'An error occurred during sign in' }
        }
    }

    const signUp = async (name: string, email: string, password: string) => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ name, email, password }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                const userWithoutPassword = data.user
                // Validate user data before setting
                if (userWithoutPassword && userWithoutPassword.id && userWithoutPassword.name && userWithoutPassword.email) {
                    setUser(userWithoutPassword)
                    localStorage.setItem('familyHubUser', JSON.stringify(userWithoutPassword))
                    return { success: true }
                } else {
                    return { success: false, error: 'Invalid user data received from server' }
                }
            } else {
                return { success: false, error: data.error || 'Registration failed' }
            }
        } catch (error) {
            console.error('Sign up error:', error)
            return { success: false, error: 'An error occurred during sign up' }
        }
    }

    const signOut = () => {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
        fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' }).finally(() => {
            setUser(null)
            localStorage.removeItem('familyHubUser')
        })
    }

    const updateUser = (updates: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...updates }
            setUser(updatedUser)
            localStorage.setItem('familyHubUser', JSON.stringify(updatedUser))
            // In production, you would also update the user on the backend
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                signIn,
                signUp,
                signOut,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

