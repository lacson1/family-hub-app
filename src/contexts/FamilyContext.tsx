import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface Family {
  id: string
  name: string
  created_at: string
  role: 'owner' | 'admin' | 'member'
}

interface FamilyContextType {
  activeFamily: Family | null
  families: Family[]
  isLoading: boolean
  createFamily: (name: string) => Promise<{ success: boolean; error?: string }>
  switchFamily: (familyId: string) => Promise<{ success: boolean; error?: string }>
  inviteToFamily: (email: string, role?: 'admin' | 'member') => Promise<{ success: boolean; error?: string; code?: string }>
  acceptInvite: (code: string) => Promise<{ success: boolean; error?: string; family_id?: string }>
  refreshFamilies: () => Promise<void>
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined)

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [activeFamily, setActiveFamily] = useState<Family | null>(null)
  const [families, setFamilies] = useState<Family[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

  const fetchFamilies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/families`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          ...(activeFamily ? { 'x-family-id': activeFamily.id } : {}),
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setFamilies(data)
        
        // If no active family is set and we have families, set the first one
        if (!activeFamily && data.length > 0) {
          setActiveFamily(data[0])
          // persist cookie so API client can send X-Family-ID
          document.cookie = `activeFamilyId=${data[0].id}; path=/; SameSite=Lax` 
        }
      }
    } catch (err) {
      console.error('Failed to fetch families:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createFamily = async (name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/families`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeFamily ? { 'x-family-id': activeFamily.id } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        const newFamily = await response.json()
        setFamilies(prev => [...prev, { ...newFamily, role: 'owner' }])
        setActiveFamily({ ...newFamily, role: 'owner' })
        document.cookie = `activeFamilyId=${newFamily.id}; path=/; SameSite=Lax`
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.error || 'Failed to create family' }
      }
    } catch (err) {
      console.error('Failed to create family:', err)
      return { success: false, error: 'Network error' }
    }
  }

  const switchFamily = async (familyId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/switch-family`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-family-id': familyId,
        },
        credentials: 'include',
        body: JSON.stringify({ familyId }),
      })

      if (response.ok) {
        const family = families.find(f => f.id === familyId)
        if (family) {
          setActiveFamily(family)
          document.cookie = `activeFamilyId=${family.id}; path=/; SameSite=Lax`
        }
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.error || 'Failed to switch family' }
      }
    } catch (err) {
      console.error('Failed to switch family:', err)
      return { success: false, error: 'Network error' }
    }
  }

  const inviteToFamily = async (email: string, role: 'admin' | 'member' = 'member'): Promise<{ success: boolean; error?: string; code?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/families/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeFamily ? { 'x-family-id': activeFamily.id } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ email, role }),
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, code: data.code }
      } else {
        const error = await response.json()
        return { success: false, error: error.error || 'Failed to send invite' }
      }
    } catch (err) {
      console.error('Failed to send invite:', err)
      return { success: false, error: 'Network error' }
    }
  }

  const acceptInvite = async (code: string): Promise<{ success: boolean; error?: string; family_id?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/families/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code }),
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh families list to include the new family
        await fetchFamilies()
        return { success: true, family_id: data.family_id }
      } else {
        const error = await response.json()
        return { success: false, error: error.error || 'Failed to accept invite' }
      }
    } catch (err) {
      console.error('Failed to accept invite:', err)
      return { success: false, error: 'Network error' }
    }
  }

  const refreshFamilies = async () => {
    await fetchFamilies()
  }

  useEffect(() => {
    fetchFamilies()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FamilyContext.Provider
      value={{
        activeFamily,
        families,
        isLoading,
        createFamily,
        switchFamily,
        inviteToFamily,
        acceptInvite,
        refreshFamilies,
      }}
    >
      {children}
    </FamilyContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFamily() {
  const context = useContext(FamilyContext)
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider')
  }
  return context
}
