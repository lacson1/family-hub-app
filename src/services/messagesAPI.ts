const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export interface Message {
    id: string
    sender_id: string
    recipient_id: string
    content: string
    read: boolean
    read_at?: string
    attachment_url?: string
    attachment_type?: string
    attachment_name?: string
    edited?: boolean
    edited_at?: string
    created_at: string
    updated_at: string
}

export interface MessageCreate {
    sender_id: string
    recipient_id: string
    content: string
    attachment_url?: string
    attachment_type?: string
    attachment_name?: string
}

export interface MessageUpdate {
    content: string
}

export interface AttachmentUploadResponse {
    url: string
    type: string
    name: string
    size: number
}

export interface TypingStatusUpdate {
    conversation_id: string
    user_id: string
    is_typing: boolean
}

export const messagesAPI = {
    getAll: async (userId?: string, conversationWith?: string): Promise<Message[]> => {
        const params = new URLSearchParams()
        if (userId) params.append('user_id', userId)
        if (conversationWith) params.append('conversation_with', conversationWith)

        const response = await fetch(`${API_URL}/messages?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch messages')
        return response.json()
    },

    getById: async (id: string): Promise<Message> => {
        const response = await fetch(`${API_URL}/messages/${id}`)
        if (!response.ok) throw new Error('Failed to fetch message')
        return response.json()
    },

    create: async (message: MessageCreate): Promise<Message> => {
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        })
        if (!response.ok) throw new Error('Failed to create message')
        return response.json()
    },

    markAsRead: async (id: string): Promise<Message> => {
        const response = await fetch(`${API_URL}/messages/${id}/read`, {
            method: 'PUT'
        })
        if (!response.ok) throw new Error('Failed to mark message as read')
        return response.json()
    },

    update: async (id: string, message: MessageUpdate): Promise<Message> => {
        const response = await fetch(`${API_URL}/messages/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        })
        if (!response.ok) throw new Error('Failed to update message')
        return response.json()
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/messages/${id}`, {
            method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to delete message')
    },

    uploadAttachment: async (file: File): Promise<AttachmentUploadResponse> => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${API_URL}/messages/upload`, {
            method: 'POST',
            body: formData
        })
        if (!response.ok) throw new Error('Failed to upload attachment')
        return response.json()
    },

    getTypingStatus: async (conversationId: string): Promise<{ isTyping: boolean; userId?: string }> => {
        const response = await fetch(`${API_URL}/messages/typing/${conversationId}`)
        if (!response.ok) throw new Error('Failed to get typing status')
        return response.json()
    },

    updateTypingStatus: async (status: TypingStatusUpdate): Promise<{ success: boolean }> => {
        const response = await fetch(`${API_URL}/messages/typing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(status)
        })
        if (!response.ok) throw new Error('Failed to update typing status')
        return response.json()
    }
}

