interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: Record<string, unknown>;
    headers?: Record<string, string>;
}
/**
 * Make an API request
 */
export declare function apiRequest(endpoint: string, options?: RequestOptions): Promise<unknown>;
/**
 * Create test data via API
 */
export declare function createTask(taskData: Record<string, unknown>): Promise<unknown>;
export declare function createEvent(eventData: Record<string, unknown>): Promise<unknown>;
export declare function createFamilyMember(memberData: Record<string, unknown>): Promise<unknown>;
export declare function createShoppingItem(itemData: Record<string, unknown>): Promise<unknown>;
export declare function createMeal(mealData: Record<string, unknown>): Promise<unknown>;
export declare function createTransaction(transactionData: Record<string, unknown>): Promise<unknown>;
export declare function createBudget(budgetData: Record<string, unknown>): Promise<unknown>;
export declare function createContact(contactData: Record<string, unknown>): Promise<unknown>;
/**
 * Delete test data via API
 */
export declare function deleteTask(id: string): Promise<unknown>;
export declare function deleteEvent(id: string): Promise<unknown>;
export declare function deleteFamilyMember(id: string): Promise<unknown>;
export declare function deleteShoppingItem(id: string): Promise<unknown>;
export declare function deleteMeal(id: string): Promise<unknown>;
export declare function deleteTransaction(id: string): Promise<unknown>;
export declare function deleteBudget(id: string): Promise<unknown>;
export declare function deleteContact(id: string): Promise<unknown>;
/**
 * Get test data via API
 */
export declare function getTasks(): Promise<unknown>;
export declare function getEvents(): Promise<unknown>;
export declare function getFamilyMembers(): Promise<unknown>;
export declare function getShoppingItems(): Promise<unknown>;
export declare function getMeals(): Promise<unknown>;
export declare function getTransactions(): Promise<unknown>;
export declare function getBudgets(): Promise<unknown>;
export declare function getContacts(): Promise<unknown>;
export {};
