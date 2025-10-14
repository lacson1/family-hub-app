import { useState } from 'react'
import { ChevronDown, Users, Plus } from 'lucide-react'
import { useFamily } from '../contexts/FamilyContext'

interface FamilySwitcherProps {
  className?: string
}

export function FamilySwitcher({ className = '' }: FamilySwitcherProps) {
  const { activeFamily, families, switchFamily, isLoading } = useFamily()
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  const handleFamilySwitch = async (familyId: string) => {
    if (familyId === activeFamily?.id) return
    
    setIsSwitching(true)
    const result = await switchFamily(familyId)
    if (result.success) {
      setIsOpen(false)
    } else {
      console.error('Failed to switch family:', result.error)
    }
    setIsSwitching(false)
  }

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 animate-pulse ${className}`}>
        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        <div className="w-20 h-4 bg-gray-300 rounded"></div>
        <div className="w-4 h-4 bg-gray-300 rounded"></div>
      </div>
    )
  }

  if (!activeFamily) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 ${className}`}>
        <Users className="w-5 h-5 text-gray-500" />
        <span className="text-sm text-gray-500">No family selected</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors disabled:opacity-50"
        data-testid="family-switcher"
      >
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
          <Users className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-900 truncate max-w-32">
          {activeFamily.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Switch Family
              </div>
              
              {families.map((family) => (
                <button
                  key={family.id}
                  onClick={() => handleFamilySwitch(family.id)}
                  disabled={isSwitching}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                    family.id === activeFamily.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  } disabled:opacity-50`}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {family.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {family.role}
                    </div>
                  </div>
                  {family.id === activeFamily.id && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              ))}
              
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    // TODO: Open create family modal
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus className="w-3 h-3 text-gray-500" />
                  </div>
                  <span className="text-sm">Create New Family</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
