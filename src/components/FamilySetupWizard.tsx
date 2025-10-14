import React, { useState } from 'react'
import { Users, UserPlus, Mail, CheckCircle, ArrowRight } from 'lucide-react'
import { useFamily } from '../contexts/FamilyContext'

interface FamilySetupWizardProps {
  onComplete: () => void
}

export function FamilySetupWizard({ onComplete }: FamilySetupWizardProps) {
  const { createFamily, inviteToFamily } = useFamily()
  const [step, setStep] = useState<'create' | 'invite' | 'complete'>('create')
  const [familyName, setFamilyName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyName.trim()) return

    setIsLoading(true)
    setError('')
    
    const result = await createFamily(familyName.trim())
    if (result.success) {
      setStep('invite')
    } else {
      setError(result.error || 'Failed to create family')
    }
    setIsLoading(false)
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setIsLoading(true)
    setError('')
    
    const result = await inviteToFamily(inviteEmail.trim())
    if (result.success) {
      setInviteCode(result.code || '')
      setStep('complete')
    } else {
      setError(result.error || 'Failed to send invite')
    }
    setIsLoading(false)
  }

  const handleSkipInvite = () => {
    setStep('complete')
  }

  const handleFinish = () => {
    onComplete()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 'create' && 'Create Your Family'}
            {step === 'invite' && 'Invite Family Members'}
            {step === 'complete' && 'All Set!'}
          </h1>
          <p className="text-gray-600">
            {step === 'create' && 'Get started by creating your family workspace'}
            {step === 'invite' && 'Invite your family members to join'}
            {step === 'complete' && 'Your family is ready to go!'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step === 'create' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step === 'create' ? '1' : <CheckCircle className="w-4 h-4" />}
            </div>
            <span className="ml-2 text-sm font-medium">Create</span>
          </div>
          
          <div className={`w-12 h-0.5 mx-2 ${step === 'invite' || step === 'complete' ? 'bg-blue-600' : 'bg-gray-200'}`} />
          
          <div className={`flex items-center ${step === 'invite' ? 'text-blue-600' : step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'invite' ? 'bg-blue-600 text-white' : 
              step === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step === 'invite' ? '2' : step === 'complete' ? <CheckCircle className="w-4 h-4" /> : '2'}
            </div>
            <span className="ml-2 text-sm font-medium">Invite</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6">
          {step === 'create' && (
            <form onSubmit={handleCreateFamily} className="space-y-4">
              <div>
                <label htmlFor="familyName" className="block text-sm font-semibold text-gray-800 mb-2">
                  Family Name
                </label>
                <input
                  id="familyName"
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="e.g., The Smith Family"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  disabled={isLoading}
                  required
                  data-testid="family-name"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !familyName.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                data-testid="create-family-button"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create Family</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'invite' && (
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label htmlFor="inviteEmail" className="block text-sm font-semibold text-gray-800 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="family@example.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    disabled={isLoading}
                    required
                    data-testid="invite-email"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleSkipInvite}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 transition-colors"
                  data-testid="skip-invite-button"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !inviteEmail.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  data-testid="send-invite-button"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Send Invite</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'complete' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Family Created Successfully!</h3>
                <p className="text-gray-600 text-sm">
                  {inviteCode ? 'Invite sent! Share this code with your family:' : 'You can invite family members later from the settings.'}
                </p>
              </div>

              {inviteCode && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="text-sm font-medium text-blue-800 mb-1">Invite Code:</div>
                  <div className="text-lg font-mono font-bold text-blue-900 bg-white rounded-lg px-3 py-2" data-testid="invite-code">
                    {inviteCode}
                  </div>
                </div>
              )}

              <button
                onClick={handleFinish}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
