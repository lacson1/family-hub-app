/// <reference types="gapi" />
/// <reference types="gapi.auth2" />
/// <reference types="gapi.client.calendar-v3" />

declare const gapi: typeof import('gapi-script').gapi;

// Google Calendar API configuration
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

// These should be set from environment variables
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

interface CalendarEvent {
    id?: string;
    title: string;
    date: string;
    time: string;
    type: 'family' | 'personal' | 'work';
    description?: string;
}

class GoogleCalendarService {
    private isInitialized = false;
    private isSignedIn = false;

    /**
     * Initialize the Google Calendar API
     */
    async init(): Promise<boolean> {
        if (this.isInitialized) {
            return this.isSignedIn;
        }

        if (!CLIENT_ID || !API_KEY) {
            console.error('Google Calendar API credentials not configured');
            return false;
        }

        return new Promise((resolve) => {
            // Load the auth2 library and API client library
            gapi.load('client:auth2', async () => {
                try {
                    await gapi.client.init({
                        apiKey: API_KEY,
                        clientId: CLIENT_ID,
                        discoveryDocs: DISCOVERY_DOCS,
                        scope: SCOPES,
                    });

                    this.isInitialized = true;

                    // Listen for sign-in state changes
                    gapi.auth2.getAuthInstance().isSignedIn.listen((signedIn: boolean) => {
                        this.isSignedIn = signedIn;
                    });

                    // Check if user is already signed in
                    this.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();

                    resolve(this.isSignedIn);
                } catch (error) {
                    console.error('Error initializing Google Calendar API:', error);
                    resolve(false);
                }
            });
        });
    }

    /**
     * Sign in to Google account
     */
    async signIn(): Promise<boolean> {
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            await gapi.auth2.getAuthInstance().signIn();
            this.isSignedIn = true;
            return true;
        } catch (error) {
            console.error('Error signing in to Google:', error);
            return false;
        }
    }

    /**
     * Sign out from Google account
     */
    async signOut(): Promise<void> {
        if (!this.isInitialized) {
            return;
        }

        try {
            await gapi.auth2.getAuthInstance().signOut();
            this.isSignedIn = false;
        } catch (error) {
            console.error('Error signing out from Google:', error);
        }
    }

    /**
     * Check if user is signed in
     */
    isUserSignedIn(): boolean {
        return this.isSignedIn;
    }

    /**
     * Convert local event to Google Calendar event format
     */
    private toGoogleEvent(event: CalendarEvent) {
        const dateTime = `${event.date}T${event.time}:00`;
        const endDateTime = new Date(dateTime);
        endDateTime.setHours(endDateTime.getHours() + 1); // Default 1 hour duration

        return {
            summary: event.title,
            description: event.description || '',
            start: {
                dateTime: dateTime,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
                dateTime: endDateTime.toISOString().slice(0, -5), // Remove milliseconds and Z
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            colorId: event.type === 'family' ? '9' : event.type === 'personal' ? '10' : '11',
            extendedProperties: {
                private: {
                    familyHubType: event.type,
                },
            },
        };
    }

    /**
     * Convert Google Calendar event to local event format
     */
    private fromGoogleEvent(gEvent: gapi.client.calendar.Event): CalendarEvent | null {
        if (!gEvent.start?.dateTime || !gEvent.summary) {
            return null;
        }

        const dateTime = new Date(gEvent.start.dateTime);
        const type = (gEvent.extendedProperties?.private?.familyHubType as 'family' | 'personal' | 'work') || 'personal';

        return {
            id: gEvent.id,
            title: gEvent.summary,
            date: dateTime.toISOString().split('T')[0],
            time: dateTime.toTimeString().slice(0, 5),
            type: type,
            description: gEvent.description || '',
        };
    }

    /**
     * Sync a local event to Google Calendar
     */
    async syncEventToGoogle(event: CalendarEvent): Promise<string | null> {
        if (!this.isSignedIn) {
            console.error('User is not signed in to Google');
            return null;
        }

        try {
            const googleEvent = this.toGoogleEvent(event);

            let response;
            if (event.id) {
                // Update existing event
                response = await gapi.client.calendar.events.update({
                    calendarId: 'primary',
                    eventId: event.id,
                    resource: googleEvent,
                });
            } else {
                // Create new event
                response = await gapi.client.calendar.events.insert({
                    calendarId: 'primary',
                    resource: googleEvent,
                });
            }

            return response.result.id || null;
        } catch (error) {
            console.error('Error syncing event to Google Calendar:', error);
            return null;
        }
    }

    /**
     * Import events from Google Calendar
     */
    async importEventsFromGoogle(
        startDate?: Date,
        endDate?: Date
    ): Promise<CalendarEvent[]> {
        if (!this.isSignedIn) {
            console.error('User is not signed in to Google');
            return [];
        }

        try {
            const timeMin = startDate
                ? startDate.toISOString()
                : new Date().toISOString();

            const timeMax = endDate
                ? endDate.toISOString()
                : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days from now

            const response = await gapi.client.calendar.events.list({
                calendarId: 'primary',
                timeMin: timeMin,
                timeMax: timeMax,
                showDeleted: false,
                singleEvents: true,
                maxResults: 250,
                orderBy: 'startTime',
            });

            const events = response.result.items || [];

            return events
                .map((gEvent) => this.fromGoogleEvent(gEvent))
                .filter((event): event is CalendarEvent => event !== null);
        } catch (error) {
            console.error('Error importing events from Google Calendar:', error);
            return [];
        }
    }

    /**
     * Delete event from Google Calendar
     */
    async deleteEventFromGoogle(eventId: string): Promise<boolean> {
        if (!this.isSignedIn) {
            console.error('User is not signed in to Google');
            return false;
        }

        try {
            await gapi.client.calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
            });
            return true;
        } catch (error) {
            console.error('Error deleting event from Google Calendar:', error);
            return false;
        }
    }

    /**
     * Sync all local events to Google Calendar
     */
    async syncAllEventsToGoogle(events: CalendarEvent[]): Promise<{
        success: number;
        failed: number;
    }> {
        if (!this.isSignedIn) {
            return { success: 0, failed: events.length };
        }

        let success = 0;
        let failed = 0;

        for (const event of events) {
            const result = await this.syncEventToGoogle(event);
            if (result) {
                success++;
            } else {
                failed++;
            }
        }

        return { success, failed };
    }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();

// Export types
export type { CalendarEvent };

