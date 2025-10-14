-- Migration: Enhance Events System
-- Adds support for: end time, all-day events, user association, reminders, and attachments

-- Add new columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE events ADD COLUMN IF NOT EXISTS all_day BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS reminder_minutes INTEGER;

-- Create event_attendees table for multi-user events
CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    user_email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'tentative')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create event_attachments table
CREATE TABLE IF NOT EXISTS event_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    uploaded_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create event_reminders table for flexible reminder system
CREATE TABLE IF NOT EXISTS event_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    remind_at TIMESTAMP NOT NULL,
    reminder_type VARCHAR(20) DEFAULT 'notification' CHECK (reminder_type IN ('notification', 'email', 'both')),
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_google_id ON events(google_event_id);
CREATE INDEX IF NOT EXISTS idx_events_all_day ON events(all_day);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_member ON event_attendees(family_member_id);
CREATE INDEX IF NOT EXISTS idx_event_attachments_event ON event_attachments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_event ON event_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_sent ON event_reminders(sent);
CREATE INDEX IF NOT EXISTS idx_event_reminders_remind_at ON event_reminders(remind_at);

-- Add comment for documentation
COMMENT ON COLUMN events.end_time IS 'End time of the event (NULL means same as start time)';
COMMENT ON COLUMN events.all_day IS 'Whether this is an all-day event';
COMMENT ON COLUMN events.created_by IS 'User who created the event';
COMMENT ON COLUMN events.google_event_id IS 'Google Calendar event ID for synced events';
COMMENT ON COLUMN events.location IS 'Event location or address';
COMMENT ON COLUMN events.reminder_minutes IS 'Minutes before event to send reminder (deprecated - use event_reminders table)';

