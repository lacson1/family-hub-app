const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: Record<string, unknown>;
    headers?: Record<string, string>;
}

/**
 * Make an API request
 */
export async function apiRequest(endpoint: string, options: RequestOptions = {}) {
    const { method = 'GET', data, headers = {} } = options;

    const url = `${API_BASE_URL}${endpoint}`;

    const fetchOptions: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    };

    if (data && method !== 'GET') {
        fetchOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Create test data via API
 */
export async function createTask(taskData: Record<string, unknown>) {
    return apiRequest('/tasks', {
        method: 'POST',
        data: taskData,
    });
}

export async function createEvent(eventData: Record<string, unknown>) {
    return apiRequest('/events', {
        method: 'POST',
        data: eventData,
    });
}

export async function createFamilyMember(memberData: Record<string, unknown>) {
    return apiRequest('/family-members', {
        method: 'POST',
        data: memberData,
    });
}

export async function createShoppingItem(itemData: Record<string, unknown>) {
    return apiRequest('/shopping-items', {
        method: 'POST',
        data: itemData,
    });
}

export async function createMeal(mealData: Record<string, unknown>) {
    return apiRequest('/meals', {
        method: 'POST',
        data: mealData,
    });
}

export async function createTransaction(transactionData: Record<string, unknown>) {
    return apiRequest('/transactions', {
        method: 'POST',
        data: transactionData,
    });
}

export async function createBudget(budgetData: Record<string, unknown>) {
    return apiRequest('/budgets', {
        method: 'POST',
        data: budgetData,
    });
}

export async function createContact(contactData: Record<string, unknown>) {
    return apiRequest('/contacts', {
        method: 'POST',
        data: contactData,
    });
}

/**
 * Delete test data via API
 */
export async function deleteTask(id: string) {
    return apiRequest(`/tasks/${id}`, { method: 'DELETE' });
}

export async function deleteEvent(id: string) {
    return apiRequest(`/events/${id}`, { method: 'DELETE' });
}

export async function deleteFamilyMember(id: string) {
    return apiRequest(`/family-members/${id}`, { method: 'DELETE' });
}

export async function deleteShoppingItem(id: string) {
    return apiRequest(`/shopping-items/${id}`, { method: 'DELETE' });
}

export async function deleteMeal(id: string) {
    return apiRequest(`/meals/${id}`, { method: 'DELETE' });
}

export async function deleteTransaction(id: string) {
    return apiRequest(`/transactions/${id}`, { method: 'DELETE' });
}

export async function deleteBudget(id: string) {
    return apiRequest(`/budgets/${id}`, { method: 'DELETE' });
}

export async function deleteContact(id: string) {
    return apiRequest(`/contacts/${id}`, { method: 'DELETE' });
}

/**
 * Get test data via API
 */
export async function getTasks() {
    return apiRequest('/tasks');
}

export async function getEvents() {
    return apiRequest('/events');
}

export async function getFamilyMembers() {
    return apiRequest('/family-members');
}

export async function getShoppingItems() {
    return apiRequest('/shopping-items');
}

export async function getMeals() {
    return apiRequest('/meals');
}

export async function getTransactions() {
    return apiRequest('/transactions');
}

export async function getBudgets() {
    return apiRequest('/budgets');
}

export async function getContacts() {
    return apiRequest('/contacts');
}

