# Notification System Documentation

## Overview
A comprehensive notification system has been built for the Family Hub app that allows users to receive real-time notifications for various family activities.

## Features

### Backend (API)
- **Database Table**: PostgreSQL table with proper indexes for performance
- **RESTful API Endpoints**:
  - `GET /api/notifications/user/:userId` - Get all notifications for a user
  - `GET /api/notifications/user/:userId/unread-count` - Get unread notification count
  - `GET /api/notifications/:id` - Get a single notification
  - `POST /api/notifications` - Create a new notification
  - `PATCH /api/notifications/:id/read` - Mark notification as read
  - `PATCH /api/notifications/user/:userId/read-all` - Mark all notifications as read
  - `DELETE /api/notifications/:id` - Delete a notification
  - `DELETE /api/notifications/user/:userId/clear-read` - Clear all read notifications

### Frontend (UI)
- **NotificationPanel Component**: A beautiful dropdown panel with:
  - Real-time notification display
  - Unread count badge with animation
  - Visual indicators for notification types (info, success, warning, error)
  - Category badges (task, event, message, shopping, meal, family, general)
  - Relative timestamps (e.g., "2m ago", "3h ago")
  - Individual and bulk actions (mark as read, delete, clear all)
  - Compact and modern design

### Notification Types
- **Info**: General information notifications (blue)
- **Success**: Success messages (green)
- **Warning**: Warning messages (yellow)
- **Error**: Error messages (red)

### Notification Categories
- **Task**: Task-related notifications
- **Event**: Calendar event notifications
- **Message**: Message notifications
- **Shopping**: Shopping list notifications
- **Meal**: Meal planning notifications
- **Family**: Family member notifications
- **General**: Miscellaneous notifications

## Automatic Notification Triggers

The system automatically creates notifications for the following actions:

1. **Tasks**
   - When a new task is created
   - When a task is marked as complete

2. **Events**
   - When a new event is scheduled

3. **Shopping**
   - When an item is added to the shopping list

4. **Meals**
   - When a new meal is planned

5. **Messages**
   - When a message is sent

6. **Family**
   - When a new family member is added

## User Experience

### Notification Bell
- Located in the top-right header
- Shows unread count badge with pulse animation
- Clicking opens the notification panel

### Notification Panel
- Clean, modern dropdown interface
- Compact design with scroll for many notifications
- Unread notifications highlighted with blue background
- Easy-to-use action buttons
- Relative timestamps for quick reference
- Category and type badges for easy identification

### Polling
- Notifications are automatically fetched every 30 seconds
- Real-time updates without page refresh

## Database Schema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('info', 'success', 'warning', 'error')),
  category VARCHAR(20) CHECK (category IN ('task', 'event', 'message', 'shopping', 'meal', 'family', 'general')),
  read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500),
  related_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

## API Usage Example

### Creating a Notification
```typescript
await notificationsAPI.create({
  user_id: 'Bisoye',
  title: 'New Task Created',
  message: 'Task "Grocery shopping" has been assigned to Mom',
  type: 'info',
  category: 'task',
  related_id: '123'
});
```

### Fetching Notifications
```typescript
const notifications = await notificationsAPI.getAllForUser('Bisoye', {
  limit: 50,
  read: false // Optional: filter by read status
});
```

### Marking as Read
```typescript
await notificationsAPI.markAsRead(notificationId);
// or mark all as read
await notificationsAPI.markAllAsRead('Bisoye');
```

## Future Enhancements

Potential improvements for the notification system:

1. **WebSocket Integration**: Real-time push notifications instead of polling
2. **Push Notifications**: Browser push notifications when app is in background
3. **Email Notifications**: Send important notifications via email
4. **Notification Preferences**: Allow users to customize which notifications they receive
5. **Notification Actions**: Quick actions directly from notifications (e.g., complete task)
6. **Notification Groups**: Group related notifications together
7. **Rich Notifications**: Add images, icons, and more interactive elements
8. **Notification History**: Archive and search old notifications

## Testing

To test the notification system:

1. Start the backend server: `cd backend && npm run dev`
2. Start the frontend: `npm run dev`
3. Perform any action in the app (add task, event, etc.)
4. Click the notification bell icon in the top-right corner
5. Verify that notifications appear and can be managed

## Troubleshooting

### Notifications not appearing
- Check that the backend server is running
- Verify database connection
- Check browser console for errors
- Ensure the API endpoint is accessible

### Unread count not updating
- Check that the polling interval is working
- Verify the API response format
- Check for JavaScript errors in console

### Performance issues
- Consider reducing polling frequency
- Implement pagination for many notifications
- Add caching layer for frequently accessed data

