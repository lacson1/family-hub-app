# Messaging Feature Enhancements

## Overview
Enhanced the messaging feature with modern functionality including backend persistence, read receipts, typing indicators, and file attachments.

## What Was Implemented

### 1. Backend Database Schema
- **New Table: `messages`**
  - Core fields: id, sender_id, recipient_id, content, created_at, updated_at
  - Read tracking: read (boolean), read_at (timestamp)
  - Attachments: attachment_url, attachment_type, attachment_name
  - Editing: edited (boolean), edited_at (timestamp)
  - Soft delete: deleted (boolean)
  - Indexes on sender_id, recipient_id, created_at, read for performance

### 2. Backend API Routes (`/api/messages`)
- **GET /api/messages** - Fetch all messages with optional filters
  - Query params: `user_id`, `conversation_with`
  - Returns messages between specific users or all messages for a user
- **GET /api/messages/:id** - Get single message by ID
- **POST /api/messages** - Create new message
  - Supports text content and optional attachments
- **PUT /api/messages/:id/read** - Mark message as read
  - Automatically sets read_at timestamp
- **PUT /api/messages/:id** - Edit message content
  - Sets edited flag and edited_at timestamp
- **DELETE /api/messages/:id** - Soft delete message
- **POST /api/messages/upload** - Upload file attachment
  - Accepts images (jpg, png, gif) and documents (pdf, doc, docx, txt)
  - 10MB file size limit
  - Returns file URL, type, name, and size
- **GET /api/messages/typing/:conversationId** - Get typing status
- **POST /api/messages/typing** - Update typing status
  - In-memory storage (5-second expiration)

### 3. Frontend Components

#### New Components
- **TypingIndicator** (`src/components/TypingIndicator.tsx`)
  - Displays animated "X is typing..." indicator
  - Three bouncing dots animation
  
- **MessageAttachment** (`src/components/MessageAttachment.tsx`)
  - Displays image attachments inline with lightbox viewer
  - Shows document attachments with download button
  - Preview mode for attachment before sending
  - Remove option in preview mode

#### Enhanced Components
- **MessageForm** (`src/components/MessageForm.tsx`)
  - File picker for attachments
  - Preview selected attachment before sending
  - Remove attachment option
  - Character counter (0/2000)
  - File validation (type and size)
  - Support for multiple file types

### 4. Frontend Features

#### Read Receipts
- Single checkmark (✓) for delivered messages
- Double checkmark (✓✓) in blue for read messages
- Hover tooltip showing read timestamp
- Automatic marking as read when conversation is opened

#### Message Display Enhancements
- Inline image attachments with click-to-enlarge
- Document attachments with download capability
- "edited" indicator for modified messages
- Better timestamp formatting
- Improved message bubble styling
- Support for multiline text (whitespace preserved)

#### Typing Indicators
- Backend API support for typing status
- Frontend infrastructure prepared (currently display-only)
- Shows at bottom of conversation when other user is typing

### 5. API Integration
- **Messages Service** (`src/services/messagesAPI.ts`)
  - Complete TypeScript API client
  - Methods for all CRUD operations
  - File upload support
  - Typing status management
  
- **Data Loading**
  - Messages loaded from backend on app startup
  - Automatic transformation of backend data to frontend format
  - Sender/recipient names resolved from family members

### 6. Message Persistence
- All messages stored in PostgreSQL database
- Messages survive page refreshes
- Read status persists across sessions
- Attachments stored on server filesystem

## Technical Details

### Dependencies Added
**Backend:**
- `multer` (^1.4.5-lts.1) - File upload handling
- `uuid` (^9.0.1) - Unique filename generation
- `@types/multer` (^1.4.11) - TypeScript types
- `@types/uuid` (^9.0.7) - TypeScript types

### File Structure
```
backend/
  src/
    database/
      init.ts (modified) - Added messages table
    routes/
      messages.ts (new) - Message API routes
    index.ts (modified) - Registered message routes
  uploads/ (new) - File attachment storage
  package.json (modified) - Added dependencies

src/
  components/
    MessageForm.tsx (modified) - Added attachment support
    MessageAttachment.tsx (new) - Display attachments
    TypingIndicator.tsx (new) - Typing indicator UI
  services/
    messagesAPI.ts (new) - Messages API client
  App.tsx (modified) - Integrated new features
```

### API Endpoints Summary
```
GET    /api/messages                   - List messages
GET    /api/messages/:id               - Get message
POST   /api/messages                   - Create message
PUT    /api/messages/:id/read          - Mark as read
PUT    /api/messages/:id               - Edit message
DELETE /api/messages/:id               - Delete message
POST   /api/messages/upload            - Upload file
GET    /api/messages/typing/:convId    - Get typing status
POST   /api/messages/typing            - Update typing status
```

## How to Use

### Sending a Message
1. Navigate to Messages tab
2. Click "New Message" button
3. Select recipient from dropdown
4. Type your message (up to 2000 characters)
5. (Optional) Click "Attach File" to add an image or document
6. Click "Send Message"

### Sending Attachments
1. Click "Attach File" button in message form
2. Select image (jpg, png, gif) or document (pdf, doc, docx, txt)
3. File must be under 10MB
4. Preview appears - click X to remove if needed
5. Send message with attachment

### Viewing Messages
1. Messages list shows all conversations
2. Click on a conversation to view messages
3. Images display inline (click to enlarge)
4. Documents show as cards with download button
5. Read receipts appear for sent messages:
   - ✓ = Delivered
   - ✓✓ (blue) = Read

### Message Actions
- **Delete**: Click trash icon next to your sent messages
- **View Attachment**: Click on images or download button for documents
- **Back to List**: Click back arrow from conversation view

## Future Enhancements (Not Yet Implemented)

### Typing Indicators (Partial)
- Backend API is ready
- Frontend state management in place
- Needs real-time polling or WebSocket connection
- Currently shows static indicator if state is set

### Potential Improvements
1. **Real-time Updates**
   - WebSocket connection for instant message delivery
   - Live typing indicators with polling/WebSocket
   - Online/offline status indicators

2. **Message Features**
   - Message reactions (emoji)
   - Reply to specific messages
   - Message search functionality
   - Voice messages
   - Video messages

3. **Attachment Features**
   - Multiple attachments per message
   - Image compression before upload
   - Cloud storage integration (S3, etc.)
   - Video file support
   - File preview thumbnails

4. **Conversation Features**
   - Message forwarding
   - Conversation archiving
   - Pin important messages
   - Message export

5. **Notifications**
   - Push notifications for new messages
   - Email notifications option
   - Notification sounds
   - Desktop notifications

## Testing

### Manual Testing Checklist
- [ ] Send message without attachment
- [ ] Send message with image attachment
- [ ] Send message with document attachment
- [ ] View image in lightbox
- [ ] Download document attachment
- [ ] Delete message
- [ ] Mark message as read (automatic)
- [ ] View read receipts
- [ ] Test file size limit (>10MB should fail)
- [ ] Test invalid file type (should fail)
- [ ] Test character limit (2000 chars)
- [ ] Refresh page and verify messages persist

### Database Testing
```sql
-- View all messages
SELECT * FROM messages ORDER BY created_at DESC;

-- View messages for specific user
SELECT * FROM messages 
WHERE sender_id = 'user_id' OR recipient_id = 'user_id'
ORDER BY created_at DESC;

-- Check read status
SELECT id, content, read, read_at 
FROM messages 
WHERE recipient_id = 'user_id';
```

## Known Limitations

1. **File Upload**: Files stored locally on server (not cloud storage)
2. **Typing Indicators**: Backend ready, but no real-time updates (needs WebSocket/polling)
3. **Message Editing**: Backend supports it, but no UI implemented yet
4. **Delivery Status**: Single device only (no multi-device sync)
5. **Attachment Preview**: Blob URLs used in form, actual upload happens on message send
6. **Security**: No message encryption (sent as plain text)

## Performance Considerations

1. **Database Indexes**: Added on frequently queried columns
2. **File Size Limit**: 10MB per attachment
3. **Soft Delete**: Messages marked deleted, not removed from DB
4. **Pagination**: Not implemented - may need for large message histories
5. **Attachment Storage**: Local filesystem - consider cloud for production

## Security Notes

1. **File Validation**: Server-side validation of file types and sizes
2. **SQL Injection**: Using parameterized queries
3. **XSS Protection**: React handles content sanitization
4. **Authentication**: Relies on existing auth context
5. **File Access**: Uploads directory served statically (no auth checks)

## Deployment Notes

1. **Database Migration**: Run backend to create messages table
2. **Uploads Directory**: Ensure backend/uploads/ exists and is writable
3. **Environment**: Set VITE_API_URL if backend not on localhost:3001
4. **Dependencies**: Run `npm install` in backend directory
5. **File Storage**: Consider using cloud storage (S3, CloudFront) for production

## Conclusion

The messaging feature now provides a modern, feature-rich communication experience with:
- ✅ Persistent message storage
- ✅ Read receipts
- ✅ File attachments (images & documents)
- ✅ Modern UI with message bubbles
- ✅ Editing indicators
- ✅ Delete functionality
- ⚠️ Typing indicators (prepared, not live)

The foundation is solid for future enhancements like real-time updates, push notifications, and advanced messaging features.

