const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Task {
    id: string;
    title: string;
    assigned_to: string;
    due_date: string;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
    created_at?: string;
    updated_at?: string;
}

interface EventAttendee {
    id?: string;
    event_id?: string;
    family_member_id?: string;
    user_email?: string;
    status?: 'pending' | 'accepted' | 'declined' | 'tentative';
    family_member_name?: string;
    family_member_color?: string;
    created_at?: string;
    updated_at?: string;
}

interface EventAttachment {
    id: string;
    event_id: string;
    file_name: string;
    file_url: string;
    file_type?: string;
    file_size?: number;
    uploaded_by: string;
    created_at: string;
}

interface RecurringRule {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    end_date?: string;
    count?: number;
    days_of_week?: number[]; // 0-6, Sunday=0
    day_of_month?: number;
    month_of_year?: number;
}

interface Event {
    id: string;
    title: string;
    date: string;
    time?: string;
    end_time?: string;
    all_day?: boolean;
    type: 'family' | 'personal' | 'work';
    description?: string;
    location?: string;
    created_by?: string;
    google_event_id?: string;
    reminder_minutes?: number;
    recurring_rule?: RecurringRule;
    parent_event_id?: string;
    attendees?: EventAttendee[];
    attachments?: EventAttachment[];
    created_at?: string;
    updated_at?: string;
}

interface FamilyMember {
    id: string;
    name: string;
    role: string;
    color: string;
    created_at?: string;
    updated_at?: string;
}

interface ShoppingItem {
    id: string;
    name: string;
    quantity: string;
    category: 'Groceries' | 'Household' | 'Personal' | 'Other';
    notes?: string;
    purchased: boolean;
    added_by: string;
    created_at?: string;
    updated_at?: string;
}

interface Ingredient {
    name: string;
    amount: string;
    unit?: string;
}

interface Meal {
    id: string;
    name: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    date: string;
    notes?: string;
    prep_time?: string;
    cook_time?: string;
    servings?: number;
    ingredients?: Ingredient[];
    instructions?: string;
    photo_url?: string;
    is_favorite?: boolean;
    is_template?: boolean;
    tags?: string[];
    created_by: string;
    created_at?: string;
    updated_at?: string;
}

// Generic fetch wrapper
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
    const isUnsafe = ['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || 'GET').toUpperCase());
    const csrfToken = isUnsafe ? getCookie('csrfToken') : undefined;
    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
            ...options.headers,
        },
        credentials: 'include',
        ...options,
    });
    // If unauthorized, try refreshing once
    if (response.status === 401 && endpoint !== '/auth/refresh') {
        try {
            await fetch(`${API_BASE_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
            response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
                    ...options.headers,
                },
                credentials: 'include',
                ...options,
            });
        } catch {}
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'An error occurred' }));
        throw new Error(error.error || error.message || 'Request failed');
    }

    return response.json();
};

// Export for use in other services like dashboard and analytics
export const apiClient = fetchAPI;

// Helper: read cookie value (for CSRF token)
function getCookie(name: string): string | undefined {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()\[\]\\\/\+^]/g, '\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : undefined;
}

// Tasks API
export const tasksAPI = {
    getAll: () => fetchAPI('/tasks'),
    getOne: (id: string) => fetchAPI(`/tasks/${id}`),
    create: (task: Omit<Task, 'id' | 'completed' | 'created_at' | 'updated_at'>) =>
        fetchAPI('/tasks', {
            method: 'POST',
            body: JSON.stringify(task),
        }),
    update: (id: string, task: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>) =>
        fetchAPI(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(task),
        }),
    delete: (id: string) => fetchAPI(`/tasks/${id}`, { method: 'DELETE' }),
};

// Events API
export const eventsAPI = {
    getAll: (params?: { created_by?: string; start_date?: string; end_date?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.created_by) queryParams.append('created_by', params.created_by);
        if (params?.start_date) queryParams.append('start_date', params.start_date);
        if (params?.end_date) queryParams.append('end_date', params.end_date);
        const query = queryParams.toString();
        return fetchAPI(`/events${query ? `?${query}` : ''}`);
    },
    getOne: (id: string) => fetchAPI(`/events/${id}`),
    create: (event: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'attendees' | 'attachments'>) =>
        fetchAPI('/events', {
            method: 'POST',
            body: JSON.stringify(event),
        }),
    update: (id: string, event: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at' | 'attachments'>>) =>
        fetchAPI(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(event),
        }),
    updateDateTime: (id: string, datetime: { date?: string; time?: string; end_time?: string }) =>
        fetchAPI(`/events/${id}/datetime`, {
            method: 'PATCH',
            body: JSON.stringify(datetime),
        }),
    delete: (id: string) => fetchAPI(`/events/${id}`, { method: 'DELETE' }),
    uploadAttachment: async (eventId: string, file: File, uploadedBy: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploaded_by', uploadedBy);

        const response = await fetch(`${API_BASE_URL}/events/${eventId}/attachments`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to upload attachment' }));
            throw new Error(error.error || 'Failed to upload attachment');
        }

        return response.json();
    },
    deleteAttachment: (eventId: string, attachmentId: string) =>
        fetchAPI(`/events/${eventId}/attachments/${attachmentId}`, { method: 'DELETE' }),
};

// Family Members API
export const familyMembersAPI = {
    getAll: () => fetchAPI('/family-members'),
    getOne: (id: string) => fetchAPI(`/family-members/${id}`),
    create: (member: Omit<FamilyMember, 'id' | 'created_at' | 'updated_at'>) =>
        fetchAPI('/family-members', {
            method: 'POST',
            body: JSON.stringify(member),
        }),
    update: (id: string, member: Partial<Omit<FamilyMember, 'id' | 'created_at' | 'updated_at'>>) =>
        fetchAPI(`/family-members/${id}`, {
            method: 'PUT',
            body: JSON.stringify(member),
        }),
    delete: (id: string) => fetchAPI(`/family-members/${id}`, { method: 'DELETE' }),
};

// Shopping Items API
export const shoppingItemsAPI = {
    getAll: () => fetchAPI('/shopping-items'),
    getOne: (id: string) => fetchAPI(`/shopping-items/${id}`),
    create: (item: Omit<ShoppingItem, 'id' | 'purchased' | 'created_at' | 'updated_at'>) =>
        fetchAPI('/shopping-items', {
            method: 'POST',
            body: JSON.stringify(item),
        }),
    update: (id: string, item: Partial<Omit<ShoppingItem, 'id' | 'created_at' | 'updated_at'>>) =>
        fetchAPI(`/shopping-items/${id}`, {
            method: 'PUT',
            body: JSON.stringify(item),
        }),
    delete: (id: string) => fetchAPI(`/shopping-items/${id}`, { method: 'DELETE' }),
};

interface FamilyRelationship {
    id: string;
    person_id: string;
    related_person_id: string;
    relationship_type: 'parent' | 'child' | 'spouse' | 'sibling';
    person_name?: string;
    person_color?: string;
    related_person_name?: string;
    related_person_color?: string;
    created_at?: string;
    updated_at?: string;
}

// Family Relationships API
export const familyRelationshipsAPI = {
    getAll: () => fetchAPI('/family-relationships'),
    getByPerson: (personId: string) => fetchAPI(`/family-relationships/person/${personId}`),
    create: (relationship: Omit<FamilyRelationship, 'id' | 'created_at' | 'updated_at' | 'person_name' | 'person_color' | 'related_person_name' | 'related_person_color'>) =>
        fetchAPI('/family-relationships', {
            method: 'POST',
            body: JSON.stringify(relationship),
        }),
    update: (id: string, relationship: Partial<Pick<FamilyRelationship, 'relationship_type'>>) =>
        fetchAPI(`/family-relationships/${id}`, {
            method: 'PUT',
            body: JSON.stringify(relationship),
        }),
    delete: (id: string) => fetchAPI(`/family-relationships/${id}`, { method: 'DELETE' }),
};

// Meals API
export const mealsAPI = {
    getAll: () => fetchAPI('/meals'),
    getOne: (id: string) => fetchAPI(`/meals/${id}`),
    getFavorites: () => fetchAPI('/meals/favorites/all'),
    create: (meal: Omit<Meal, 'id' | 'created_at' | 'updated_at'>) =>
        fetchAPI('/meals', {
            method: 'POST',
            body: JSON.stringify(meal),
        }),
    update: (id: string, meal: Partial<Omit<Meal, 'id' | 'created_at' | 'updated_at'>>) =>
        fetchAPI(`/meals/${id}`, {
            method: 'PUT',
            body: JSON.stringify(meal),
        }),
    delete: (id: string) => fetchAPI(`/meals/${id}`, { method: 'DELETE' }),
    addToShoppingList: (mealId: string) => fetchAPI(`/meals/${mealId}/add-to-shopping`, { method: 'POST' }),
};

interface Transaction {
    id: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description?: string;
    date: string;
    payment_method?: string;
    added_by: string;
    created_at?: string;
    updated_at?: string;
}

interface TransactionStats {
    income: number;
    expense: number;
    balance: number;
    incomeCount: number;
    expenseCount: number;
}

interface CategoryStats {
    category: string;
    type: 'income' | 'expense';
    total: number;
    count: number;
}

interface Budget {
    id: string;
    category: string;
    amount: number;
    period: 'monthly' | 'yearly';
    created_by: string;
    created_at?: string;
    updated_at?: string;
}

interface BudgetWithSpending extends Budget {
    spent_amount: number;
    remaining: number;
}

// Transactions API
export const transactionsAPI = {
    getAll: (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        return fetchAPI(`/transactions${params.toString() ? '?' + params.toString() : ''}`);
    },
    getOne: (id: string) => fetchAPI(`/transactions/${id}`),
    exportCSV: (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/transactions/export/csv${params.toString() ? '?' + params.toString() : ''}`;
    },
    getSummary: (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return fetchAPI(`/transactions/stats/summary${params.toString() ? '?' + params.toString() : ''}`);
    },
    getByCategory: (type?: 'income' | 'expense', startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return fetchAPI(`/transactions/stats/by-category${params.toString() ? '?' + params.toString() : ''}`);
    },
    create: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) =>
        fetchAPI('/transactions', {
            method: 'POST',
            body: JSON.stringify(transaction),
        }),
    update: (id: string, transaction: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'added_by'>>) =>
        fetchAPI(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(transaction),
        }),
    delete: (id: string) => fetchAPI(`/transactions/${id}`, { method: 'DELETE' }),
};

interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    category: 'task' | 'event' | 'message' | 'shopping' | 'meal' | 'family' | 'general';
    read: boolean;
    action_url?: string;
    related_id?: string;
    created_at: string;
}

// Notifications API
export const notificationsAPI = {
    getAll: (params?: { user_id?: string; read?: boolean }) => {
        const queryParams = new URLSearchParams();
        if (params?.user_id) queryParams.append('user_id', params.user_id);
        if (params?.read !== undefined) queryParams.append('read', params.read.toString());
        const query = queryParams.toString();
        return fetchAPI(`/notifications${query ? `?${query}` : ''}`);
    },
    getOne: (id: string) => fetchAPI(`/notifications/${id}`),
    create: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) =>
        fetchAPI('/notifications', {
            method: 'POST',
            body: JSON.stringify(notification),
        }),
    markAsRead: (id: string) =>
        fetchAPI(`/notifications/${id}/read`, {
            method: 'PUT',
        }),
    delete: (id: string) => fetchAPI(`/notifications/${id}`, { method: 'DELETE' }),
};

// Health check
export const healthCheck = () => fetchAPI('/health');

// Budgets API
export const budgetsAPI = {
    getAll: (createdBy?: string) => {
        const params = new URLSearchParams();
        if (createdBy) params.append('created_by', createdBy);
        return fetchAPI(`/budgets${params.toString() ? '?' + params.toString() : ''}`);
    },
    getWithSpending: (period?: 'monthly' | 'yearly', createdBy?: string) => {
        const params = new URLSearchParams();
        if (period) params.append('period', period);
        if (createdBy) params.append('created_by', createdBy);
        return fetchAPI(`/budgets/with-spending${params.toString() ? '?' + params.toString() : ''}`);
    },
    create: (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) =>
        fetchAPI('/budgets', {
            method: 'POST',
            body: JSON.stringify(budget),
        }),
    update: (id: string, budget: Partial<Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'category'>>) =>
        fetchAPI(`/budgets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(budget),
        }),
    delete: (id: string) => fetchAPI(`/budgets/${id}`, { method: 'DELETE' }),
};

interface Contact {
    id: string;
    name: string;
    category: 'Family' | 'Friends' | 'Medical' | 'Services' | 'Emergency' | 'School' | 'Work' | 'Other';
    phone?: string;
    email?: string;
    address?: string;
    company_organization?: string;
    job_title_specialty?: string;
    notes?: string;
    is_favorite: boolean;
    created_by: string;
    created_at?: string;
    updated_at?: string;
}

interface ContactFamilyAssociation {
    id: string;
    contact_id: string;
    family_member_id: string;
    relationship_notes?: string;
    family_member_name?: string;
    family_member_color?: string;
    created_at?: string;
}

// Contacts API
export const contactsAPI = {
    getAll: (category?: string) => {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        return fetchAPI(`/contacts${params.toString() ? '?' + params.toString() : ''}`);
    },
    getFavorites: () => fetchAPI('/contacts/favorites/all'),
    getOne: (id: string) => fetchAPI(`/contacts/${id}`),
    getByMember: (memberId: string) => fetchAPI(`/contacts/by-member/${memberId}`),
    getAssociations: (id: string) => fetchAPI(`/contacts/${id}/associations`),
    create: (contact: Omit<Contact, 'id' | 'is_favorite' | 'created_at' | 'updated_at'>) =>
        fetchAPI('/contacts', {
            method: 'POST',
            body: JSON.stringify(contact),
        }),
    update: (id: string, contact: Partial<Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) =>
        fetchAPI(`/contacts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(contact),
        }),
    toggleFavorite: (id: string) =>
        fetchAPI(`/contacts/${id}/favorite`, {
            method: 'POST',
        }),
    delete: (id: string) => fetchAPI(`/contacts/${id}`, { method: 'DELETE' }),
    addAssociation: (contactId: string, association: { family_member_id: string; relationship_notes?: string }) =>
        fetchAPI(`/contacts/${contactId}/associations`, {
            method: 'POST',
            body: JSON.stringify(association),
        }),
    removeAssociation: (associationId: string) =>
        fetchAPI(`/contacts/associations/${associationId}`, { method: 'DELETE' }),
};

// Export types
export type {
    Task, Event, EventAttendee, EventAttachment, RecurringRule,
    FamilyMember, ShoppingItem, FamilyRelationship, Meal, Ingredient,
    Transaction, TransactionStats, CategoryStats, Notification,
    Budget, BudgetWithSpending, Contact, ContactFamilyAssociation
};

