-- Add notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    
    -- Enable/disable notifications per category
    enable_task BOOLEAN DEFAULT TRUE,
    enable_event BOOLEAN DEFAULT TRUE,
    enable_message BOOLEAN DEFAULT TRUE,
    enable_shopping BOOLEAN DEFAULT TRUE,
    enable_meal BOOLEAN DEFAULT TRUE,
    enable_family BOOLEAN DEFAULT TRUE,
    enable_general BOOLEAN DEFAULT TRUE,
    
    -- Push notification settings
    enable_push_notifications BOOLEAN DEFAULT FALSE,
    enable_browser_notifications BOOLEAN DEFAULT TRUE,
    
    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '07:00:00',
    
    -- Email notifications (for future)
    enable_email_notifications BOOLEAN DEFAULT FALSE,
    email_digest_frequency VARCHAR(20) DEFAULT 'daily' CHECK (email_digest_frequency IN ('none', 'daily', 'weekly')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_updated_at();

