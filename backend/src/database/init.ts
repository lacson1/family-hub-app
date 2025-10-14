import pool from './db';

export const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // Create users table for authentication
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        push_subscription JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Insert demo user if it doesn't exist
    await client.query(`
      INSERT INTO users (name, email, password, created_at)
      VALUES ('Demo User', 'demo@familyhub.com', 'demo123', NOW())
      ON CONFLICT (email) DO NOTHING;
    `);

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS family_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        color VARCHAR(100) NOT NULL,
        avatar_url TEXT,
        avatar_pattern VARCHAR(50) DEFAULT 'solid',
        birth_date DATE,
        phone VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        notes TEXT,
        generation INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        assigned_to VARCHAR(255) NOT NULL,
        due_date DATE NOT NULL,
        priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
        completed BOOLEAN DEFAULT FALSE,
        recurring_rule JSONB,
        parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('family', 'personal', 'work')),
        description TEXT,
        recurring_rule JSONB,
        parent_event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS shopping_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        quantity VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL CHECK (category IN ('Groceries', 'Household', 'Personal', 'Other')),
        notes TEXT,
        purchased BOOLEAN DEFAULT FALSE,
        added_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS family_relationships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        person_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
        related_person_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
        relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('parent', 'child', 'spouse', 'sibling')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_relationship UNIQUE (person_id, related_person_id, relationship_type)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        payment_method VARCHAR(50),
        added_by VARCHAR(255) NOT NULL,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurrence_frequency VARCHAR(20),
        recurrence_end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        period VARCHAR(20) NOT NULL CHECK (period IN ('monthly', 'yearly')),
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(category, period, created_by)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS meals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
        date DATE NOT NULL,
        notes TEXT,
        prep_time VARCHAR(100),
        cook_time VARCHAR(100),
        servings INTEGER DEFAULT 4,
        ingredients JSONB DEFAULT '[]'::jsonb,
        instructions TEXT,
        photo_url VARCHAR(500),
        is_favorite BOOLEAN DEFAULT FALSE,
        is_template BOOLEAN DEFAULT FALSE,
        tags TEXT[],
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
        category VARCHAR(20) NOT NULL CHECK (category IN ('task', 'event', 'message', 'shopping', 'meal', 'family', 'general')),
        read BOOLEAN DEFAULT FALSE,
        action_url VARCHAR(500),
        related_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL CHECK (category IN ('Family', 'Friends', 'Medical', 'Services', 'Emergency', 'School', 'Work', 'Other')),
        phone VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        company_organization VARCHAR(255),
        job_title_specialty VARCHAR(255),
        notes TEXT,
        is_favorite BOOLEAN DEFAULT FALSE,
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_family_associations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
        relationship_notes VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        linked_type VARCHAR(20) NOT NULL CHECK (linked_type IN ('event', 'task')),
        linked_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id VARCHAR(255) NOT NULL,
        recipient_id VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        attachment_url VARCHAR(500),
        attachment_type VARCHAR(50),
        attachment_name VARCHAR(255),
        edited BOOLEAN DEFAULT FALSE,
        edited_at TIMESTAMP,
        deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create device_tokens table for push notifications
    await client.query(`
      CREATE TABLE IF NOT EXISTS device_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        endpoint TEXT NOT NULL UNIQUE,
        keys JSONB NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create notification_preferences table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL UNIQUE,
        
        enable_task BOOLEAN DEFAULT TRUE,
        enable_event BOOLEAN DEFAULT TRUE,
        enable_message BOOLEAN DEFAULT TRUE,
        enable_shopping BOOLEAN DEFAULT TRUE,
        enable_meal BOOLEAN DEFAULT TRUE,
        enable_family BOOLEAN DEFAULT TRUE,
        enable_general BOOLEAN DEFAULT TRUE,
        
        enable_push_notifications BOOLEAN DEFAULT FALSE,
        enable_browser_notifications BOOLEAN DEFAULT TRUE,
        
        quiet_hours_enabled BOOLEAN DEFAULT FALSE,
        quiet_hours_start TIME DEFAULT '22:00:00',
        quiet_hours_end TIME DEFAULT '07:00:00',
        
        enable_email_notifications BOOLEAN DEFAULT FALSE,
        email_digest_frequency VARCHAR(20) DEFAULT 'daily' CHECK (email_digest_frequency IN ('none', 'daily', 'weekly')),
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create activity_log table for dashboard feed
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255),
        action_type VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(255),
        description TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add parent columns if they don't exist (for existing databases)
    try {
      await client.query(`
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE;
      `);
    } catch {
      // Column might already exist
    }

    try {
      await client.query(`
        ALTER TABLE events ADD COLUMN IF NOT EXISTS parent_event_id UUID REFERENCES events(id) ON DELETE CASCADE;
      `);
    } catch {
      // Column might already exist
    }

    // Run event enhancements migration
    await client.query(`
      -- Add new columns to events table
      ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time TIME;
      ALTER TABLE events ADD COLUMN IF NOT EXISTS all_day BOOLEAN DEFAULT FALSE;
      ALTER TABLE events ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE events ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255);
      ALTER TABLE events ADD COLUMN IF NOT EXISTS location TEXT;
      ALTER TABLE events ADD COLUMN IF NOT EXISTS reminder_minutes INTEGER;
    `);

    // Create event_attendees table
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_attendees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
        user_email VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'tentative')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create event_attachments table
    await client.query(`
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
    `);

    // Create event_reminders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_reminders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        remind_at TIMESTAMP NOT NULL,
        reminder_type VARCHAR(20) DEFAULT 'notification' CHECK (reminder_type IN ('notification', 'email', 'both')),
        sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
      CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
      CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
      CREATE INDEX IF NOT EXISTS idx_events_google_id ON events(google_event_id);
      CREATE INDEX IF NOT EXISTS idx_events_all_day ON events(all_day);
      CREATE INDEX IF NOT EXISTS idx_shopping_purchased ON shopping_items(purchased);
      CREATE INDEX IF NOT EXISTS idx_relationships_person ON family_relationships(person_id);
      CREATE INDEX IF NOT EXISTS idx_relationships_related_person ON family_relationships(related_person_id);
      CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
      CREATE INDEX IF NOT EXISTS idx_meals_meal_type ON meals(meal_type);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
      CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions(is_recurring);
      CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
      CREATE INDEX IF NOT EXISTS idx_budgets_created_by ON budgets(created_by);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
      CREATE INDEX IF NOT EXISTS idx_contacts_category ON contacts(category);
      CREATE INDEX IF NOT EXISTS idx_contacts_favorite ON contacts(is_favorite);
      CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON contacts(created_by);
      CREATE INDEX IF NOT EXISTS idx_contact_associations_contact ON contact_family_associations(contact_id);
      CREATE INDEX IF NOT EXISTS idx_contact_associations_member ON contact_family_associations(family_member_id);
      CREATE INDEX IF NOT EXISTS idx_contact_links_contact ON contact_links(contact_id);
      CREATE INDEX IF NOT EXISTS idx_contact_links_linked ON contact_links(linked_type, linked_id);
      CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
      CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);
      CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id);
      CREATE INDEX IF NOT EXISTS idx_events_parent ON events(parent_event_id);
      CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
      CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
      CREATE INDEX IF NOT EXISTS idx_event_attendees_member ON event_attendees(family_member_id);
      CREATE INDEX IF NOT EXISTS idx_event_attachments_event ON event_attachments(event_id);
      CREATE INDEX IF NOT EXISTS idx_event_reminders_event ON event_reminders(event_id);
      CREATE INDEX IF NOT EXISTS idx_event_reminders_sent ON event_reminders(sent);
      CREATE INDEX IF NOT EXISTS idx_event_reminders_remind_at ON event_reminders(remind_at);
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

