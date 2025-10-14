# Authentication Implementation Guide

## Overview

This guide documents the authentication system implemented for the Family Hub App. The system provides user sign-up, sign-in, sign-out functionality, and a profile management page.

## Features Implemented

### ✅ Frontend Authentication

1. **Authentication Context** (`src/contexts/AuthContext.tsx`)
   - Centralized authentication state management
   - User session persistence using localStorage
   - Sign in, sign up, and sign out functions
   - User profile update functionality

2. **Sign In/Sign Up Page** (`src/components/AuthPage.tsx`)
   - Beautiful, modern UI with gradient backgrounds [[memory:2248470]]
   - Toggle between sign-in and sign-up modes
   - Form validation:
     - Email format validation
     - Password minimum length (6 characters)
     - Password confirmation matching
     - All fields required validation
   - Loading states during authentication
   - Error message display
   - Responsive design for mobile and desktop

3. **Profile Page** (`src/components/ProfilePage.tsx`)
   - User profile display with avatar
   - Editable name and email fields
   - Member since date display
   - Sign out functionality with confirmation dialog
   - Profile picture support (avatar URL)
   - Modern card-based design with gradient header

4. **App Integration**
   - Protected routes - unauthenticated users see the sign-in page
   - Loading screen during authentication check
   - Profile navigation item in sidebar
   - User info display in sidebar with clickable profile link
   - Functional sign out button in sidebar

### ✅ Backend Authentication API

1. **Auth Routes** (`backend/src/routes/auth.ts`)
   - `POST /api/auth/register` - User registration
   - `POST /api/auth/login` - User login
   - `POST /api/auth/logout` - User logout
   - `GET /api/auth/me` - Get current user details
   - Input validation using express-validator
   - Error handling for common scenarios (duplicate email, invalid credentials)

2. **Database Schema** (`backend/src/database/init_auth.sql`)
   - Users table with fields:
     - id (UUID, primary key)
     - name (VARCHAR)
     - email (VARCHAR, unique, indexed)
     - password (VARCHAR) - **Note: In production, passwords should be hashed**
     - avatar_url (TEXT, optional)
     - created_at (TIMESTAMP)
     - updated_at (TIMESTAMP)

## How It Works

### Sign Up Flow

1. User enters name, email, and password on the sign-up form
2. Frontend validates the input (format, length, matching passwords)
3. If valid, creates new user account
4. User data (without password) is stored in localStorage
5. User is automatically signed in
6. App redirects to dashboard

### Sign In Flow

1. User enters email and password
2. Frontend validates credentials against stored users
3. On success, user data is saved to localStorage
4. App redirects to dashboard
5. On failure, error message is displayed

### Sign Out Flow

1. User clicks "Sign Out" button in sidebar or profile page
2. Confirmation dialog appears (in profile page)
3. On confirmation:
   - User data is removed from localStorage
   - Auth state is cleared
   - App redirects to sign-in page

### Protected Routes

1. App checks authentication status on load
2. If user is not authenticated, shows sign-in page
3. If authenticated, shows main app with all features
4. Loading screen displayed during initial auth check

## Storage

Currently, authentication is implemented using **localStorage** for simplicity and to work without a backend connection. This includes:

- Current user session (`familyHubUser`)
- Registered users list (`familyHubUsers`)

**⚠️ Important for Production:**
- This is suitable for development and testing only
- For production, implement proper backend authentication with:
  - Password hashing (bcrypt)
  - JWT tokens or session-based auth
  - Secure HTTP-only cookies
  - HTTPS only
  - Rate limiting
  - CSRF protection

## Backend API Usage (Optional)

The backend API endpoints are available if you want to use them instead of localStorage:

### Register a new user

```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login

```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Logout

```bash
POST http://localhost:3001/api/auth/logout
```

### Get current user

```bash
GET http://localhost:3001/api/auth/me?userId=USER_ID
```

## Files Created/Modified

### New Files
- `src/contexts/AuthContext.tsx` - Authentication context provider
- `src/components/AuthPage.tsx` - Sign in/Sign up page
- `src/components/ProfilePage.tsx` - User profile page
- `backend/src/routes/auth.ts` - Authentication API routes
- `backend/src/database/init_auth.sql` - Users table schema

### Modified Files
- `src/main.tsx` - Added AuthProvider wrapper
- `src/App.tsx` - Integrated authentication, added profile page, connected sign out button
- `backend/src/index.ts` - Registered auth routes

## Testing the Authentication

1. **Start the frontend:**
   ```bash
   npm run dev
   ```

2. **Access the app** at `http://localhost:5173`

3. **Sign Up:**
   - Click "Sign Up" on the auth page
   - Enter your name, email, and password
   - Click "Create Account"

4. **Sign In:**
   - Enter your email and password
   - Click "Sign In"

5. **View Profile:**
   - Click on the "Profile" item in the sidebar
   - Or click on your user info at the bottom of the sidebar

6. **Edit Profile:**
   - Click "Edit Profile" button
   - Modify your name or email
   - Click "Save"

7. **Sign Out:**
   - Click "Sign Out" button in the sidebar (instant)
   - Or go to Profile page and click "Sign Out" (with confirmation)

## Security Considerations for Production

When deploying to production, implement these security measures:

1. **Password Hashing**
   ```typescript
   import bcrypt from 'bcrypt';
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **JWT Tokens**
   ```typescript
   import jwt from 'jsonwebtoken';
   const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '7d' });
   ```

3. **Environment Variables**
   - Store sensitive data in .env files
   - Never commit .env files to version control

4. **HTTPS**
   - Use SSL/TLS certificates
   - Force HTTPS redirection

5. **Input Sanitization**
   - Already using express-validator
   - Add additional sanitization for XSS prevention

6. **Rate Limiting**
   ```typescript
   import rateLimit from 'express-rate-limit';
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 5
   });
   app.use('/api/auth/login', limiter);
   ```

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, Facebook, etc.)
- [ ] Remember me functionality
- [ ] Session timeout
- [ ] Multi-device session management
- [ ] User roles and permissions
- [ ] Activity log

## Summary

The authentication system is now fully functional with:
- ✅ User sign-up with validation
- ✅ User sign-in with error handling
- ✅ Sign-out functionality in sidebar and profile
- ✅ Profile page with edit capabilities
- ✅ Protected routes
- ✅ Modern, beautiful UI [[memory:2248470]]
- ✅ Backend API endpoints (optional)
- ✅ Database schema for users

The app now requires authentication before accessing any features, providing a secure foundation for the Family Hub application!

