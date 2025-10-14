# Google Calendar Integration Setup Guide

This guide will help you set up Google Calendar integration for the Family Hub App's Premium Calendar.

## Prerequisites

- A Google account
- Access to Google Cloud Console
- Node.js and npm installed

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** or select an existing project
3. Give your project a name (e.g., "Family Hub Calendar")
4. Click **"Create"**

## Step 2: Enable the Google Calendar API

1. In your Google Cloud Project, go to **"APIs & Services" > "Library"**
2. Search for **"Google Calendar API"**
3. Click on it and press **"Enable"**

## Step 3: Create OAuth 2.0 Credentials

### Create OAuth Consent Screen

1. Go to **"APIs & Services" > "OAuth consent screen"**
2. Choose **"External"** user type (unless you have a Google Workspace account)
3. Fill in the required fields:
   - **App name**: Family Hub App
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **"Save and Continue"**

### Add Scopes

1. Click **"Add or Remove Scopes"**
2. Add the following scope:
   - `https://www.googleapis.com/auth/calendar.events`
3. Click **"Update"** and then **"Save and Continue"**

### Add Test Users (for development)

1. Add your email address as a test user
2. Click **"Save and Continue"**

### Create OAuth Client ID

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. Choose **"Web application"** as the application type
4. Name it (e.g., "Family Hub Web Client")
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Your production URL (when deployed)
6. Add authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - Your production URL (when deployed)
7. Click **"Create"**
8. **Copy the Client ID** - you'll need this!

## Step 4: Create an API Key

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials"** > **"API key"**
3. **Copy the API key** - you'll need this!
4. (Optional but recommended) Click on the API key to restrict it:
   - Application restrictions: HTTP referrers
   - API restrictions: Google Calendar API
   - Add your domains

## Step 5: Configure Your Application

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add your credentials:

```env
# Google Calendar API Configuration
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_API_KEY=your_api_key_here
```

3. Replace `your_client_id_here` and `your_api_key_here` with the values you copied earlier

## Step 6: Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Using the Premium Calendar

### Connect to Google Calendar

1. Navigate to the **Calendar** tab in your Family Hub app
2. Click the **"Connect Google"** button
3. Sign in with your Google account
4. Grant the necessary permissions
5. You should see the button change to **"Sync"** and **"Import"**

### Sync Events

- **Sync**: Pushes your Family Hub events to Google Calendar
- **Import**: Imports events from Google Calendar to Family Hub

### Features

The Premium Calendar includes:

- **Multiple Views**: Month, Week, Day, and List views
- **Event Management**: Create, edit, and delete events
- **Event Types**: Family, Personal, and Work events with color coding
- **Google Calendar Sync**: Two-way synchronization with Google Calendar
- **Drag and Drop**: (Coming soon) Drag events to reschedule
- **Recurring Events**: (Coming soon) Support for recurring events

## Troubleshooting

### "Failed to connect to Google Calendar"

1. Check that your API credentials are correct in `.env`
2. Make sure the Google Calendar API is enabled in your Google Cloud Console
3. Verify that your authorized JavaScript origins include your current domain
4. Clear your browser cache and try again

### "User not signed in to Google"

- Click the "Connect Google" button and sign in with your Google account
- Make sure you grant all requested permissions

### Events not syncing

1. Check browser console for errors
2. Verify that you have granted calendar permissions
3. Try signing out and signing back in
4. Make sure you're using a test user account if in development mode

### OAuth verification warnings

- For development, Google will show a warning that the app is not verified
- Click "Advanced" and then "Go to Family Hub App (unsafe)" to proceed
- For production, you'll need to complete the OAuth verification process

## Production Deployment

When deploying to production:

1. Update your OAuth consent screen to "Published" status
2. (Optional) Complete the OAuth app verification process for trusted branding
3. Update the authorized JavaScript origins and redirect URIs with your production URL
4. Set the environment variables in your hosting platform
5. Test the integration thoroughly

## Security Notes

- Never commit `.env` files to version control
- Keep your API key and Client ID secure
- Regularly rotate your API credentials
- Use API key restrictions in production
- Review and limit OAuth scopes to only what's necessary

## Additional Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google API Client Library](https://github.com/google/google-api-javascript-client)

## Support

If you encounter any issues not covered in this guide:

1. Check the browser console for error messages
2. Review the Google Calendar API quota limits
3. Consult the Google Calendar API documentation
4. Open an issue in the project repository

---

**Last Updated**: October 2025

