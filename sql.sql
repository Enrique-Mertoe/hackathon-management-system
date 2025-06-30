-- HackHub Database Setup Script for Supabase
-- Run this script in your Supabase SQL editor to set up all tables and relationships

-- ============================================================================
-- 1. CREATE CUSTOM TYPES (ENUMS)
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('PARTICIPANT', 'ORGANIZER', 'MENTOR', 'JUDGE', 'ADMIN');

-- Organization sizes
CREATE TYPE organization_size AS ENUM ('STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- Verification statuses
CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- Subscription tiers
CREATE TYPE subscription_tier AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- Difficulty levels
CREATE TYPE difficulty_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- Hackathon statuses
CREATE TYPE hackathon_status AS ENUM (
  'DRAFT',
  'PUBLISHED',
  'REGISTRATION_OPEN',
  'REGISTRATION_CLOSED',
  'ACTIVE',
  'JUDGING',
  'COMPLETED',
  'CANCELLED'
);

-- Registration statuses
CREATE TYPE registration_status AS ENUM ('REGISTERED', 'WAITLISTED', 'CANCELLED', 'CHECKED_IN');

-- Team statuses
CREATE TYPE team_status AS ENUM ('RECRUITING', 'FULL', 'COMPETING', 'SUBMITTED', 'DISBANDED');

-- Team roles
CREATE TYPE team_role AS ENUM ('LEADER', 'MEMBER', 'MENTOR');

-- Update types
CREATE TYPE update_type AS ENUM ('ANNOUNCEMENT', 'SCHEDULE_CHANGE', 'RESOURCE', 'REMINDER');

-- Priority levels
CREATE TYPE priority_level AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- Achievement types
CREATE TYPE achievement_type AS ENUM ('WINNER', 'PARTICIPANT', 'SPECIAL_RECOGNITION', 'SKILL_BADGE');

-- Recommendation types
CREATE TYPE recommendation_type AS ENUM ('HACKATHON', 'TOOL', 'RESOURCE', 'TEAM_MEMBER', 'MENTOR');

-- Transaction types
CREATE TYPE transaction_type AS ENUM ('SUBSCRIPTION', 'PRIZE_DISTRIBUTION', 'FEATURED_LISTING', 'COMMISSION');

-- Transaction statuses
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- ============================================================================
-- 2. CORE TABLES
-- ============================================================================

-- Users table
CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       email VARCHAR(255) UNIQUE NOT NULL,
                       username VARCHAR(50) UNIQUE NOT NULL,
                       full_name VARCHAR(255) NOT NULL,
                       bio TEXT,
                       avatar_url TEXT,
                       github_username VARCHAR(255),
                       linkedin_url TEXT,
                       website_url TEXT,
                       location VARCHAR(255),
                       timezone VARCHAR(50),
                       skills JSONB DEFAULT '[]'::jsonb,
                       preferences JSONB DEFAULT '{}'::jsonb,
                       role user_role DEFAULT 'PARTICIPANT',
                       email_verified BOOLEAN DEFAULT FALSE,
                       stripe_customer_id VARCHAR(255),
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organizations (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               name VARCHAR(255) NOT NULL,
                               slug VARCHAR(100) UNIQUE NOT NULL,
                               description TEXT,
                               logo_url TEXT,
                               website_url TEXT,
                               industry VARCHAR(100),
                               size organization_size,
                               verification_status verification_status DEFAULT 'PENDING',
                               subscription_tier subscription_tier DEFAULT 'FREE',
                               subscription_expires_at TIMESTAMP WITH TIME ZONE,
                               stripe_customer_id VARCHAR(255),
                               stripe_subscription_id VARCHAR(255),
                               created_by UUID REFERENCES users(id) ON DELETE SET NULL,
                               created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                               updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization members table
CREATE TABLE organization_members (
                                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                      organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
                                      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                                      role VARCHAR(50) DEFAULT 'MEMBER',
                                      permissions JSONB DEFAULT '{}'::jsonb,
                                      joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                                      UNIQUE(organization_id, user_id)
);

-- ============================================================================
-- 3. HACKATHON TABLES
-- ============================================================================

-- Hackathons table
CREATE TABLE hackathons (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            title VARCHAR(255) NOT NULL,
                            slug VARCHAR(100) UNIQUE NOT NULL,
                            description TEXT NOT NULL,
                            theme VARCHAR(100),
                            difficulty_level difficulty_level DEFAULT 'INTERMEDIATE',
                            status hackathon_status DEFAULT 'DRAFT',
                            registration_start TIMESTAMP WITH TIME ZONE NOT NULL,
                            registration_end TIMESTAMP WITH TIME ZONE NOT NULL,
                            start_date TIMESTAMP WITH TIME ZONE NOT NULL,
                            end_date TIMESTAMP WITH TIME ZONE NOT NULL,
                            timezone VARCHAR(50) NOT NULL,
                            location VARCHAR(255),
                            is_virtual BOOLEAN DEFAULT TRUE,
                            max_participants INTEGER,
                            min_team_size INTEGER DEFAULT 1,
                            max_team_size INTEGER DEFAULT 5,
                            prize_pool DECIMAL(10,2),
                            prize_structure JSONB DEFAULT '{}'::jsonb,
                            requirements JSONB DEFAULT '{}'::jsonb,
                            resources JSONB DEFAULT '{}'::jsonb,
                            rules TEXT,
                            judging_criteria JSONB DEFAULT '{}'::jsonb,
                            organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
                            featured BOOLEAN DEFAULT FALSE,
                            featured_until TIMESTAMP WITH TIME ZONE,
                            registration_count INTEGER DEFAULT 0,
                            ai_analysis JSONB,
                            metadata JSONB DEFAULT '{}'::jsonb,
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hackathon registrations
CREATE TABLE hackathon_registrations (
                                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                         hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
                                         user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                                         team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
                                         status registration_status DEFAULT 'REGISTERED',
                                         application_data JSONB DEFAULT '{}'::jsonb,
                                         registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                                         checked_in_at TIMESTAMP WITH TIME ZONE,
                                         UNIQUE(hackathon_id, user_id)
);

-- Teams table
CREATE TABLE teams (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       name VARCHAR(255) NOT NULL,
                       description TEXT,
                       hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
                       leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
                       status team_status DEFAULT 'RECRUITING',
                       looking_for_members BOOLEAN DEFAULT TRUE,
                       skills_wanted JSONB DEFAULT '[]'::jsonb,
                       project_name VARCHAR(255),
                       project_description TEXT,
                       project_category VARCHAR(100),
                       repository_url TEXT,
                       demo_url TEXT,
                       presentation_url TEXT,
                       final_rank INTEGER,
                       final_score DECIMAL(5,2),
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members
CREATE TABLE team_members (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
                              user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                              role team_role DEFAULT 'MEMBER',
                              skills_contributing JSONB DEFAULT '[]'::jsonb,
                              joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                              UNIQUE(team_id, user_id)
);

-- ============================================================================
-- 4. COMMUNICATION TABLES
-- ============================================================================

-- Hackathon updates/announcements
CREATE TABLE hackathon_updates (
                                   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
                                   author_id UUID REFERENCES users(id) ON DELETE SET NULL,
                                   title VARCHAR(255) NOT NULL,
                                   content TEXT NOT NULL,
                                   type update_type DEFAULT 'ANNOUNCEMENT',
                                   priority priority_level DEFAULT 'NORMAL',
                                   attachments JSONB DEFAULT '[]'::jsonb,
                                   is_published BOOLEAN DEFAULT TRUE,
                                   published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                                   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages (for teams, direct messages, etc.)
CREATE TABLE messages (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
                          recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
                          team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
                          hackathon_id UUID REFERENCES hackathons(id) ON DELETE SET NULL,
                          content TEXT NOT NULL,
                          message_type VARCHAR(50) DEFAULT 'TEXT',
                          attachments JSONB DEFAULT '[]'::jsonb,
                          parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
                          is_read BOOLEAN DEFAULT FALSE,
                          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. ACHIEVEMENT & RECOGNITION TABLES
-- ============================================================================

-- Achievements & certificates
CREATE TABLE achievements (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                              hackathon_id UUID REFERENCES hackathons(id) ON DELETE SET NULL,
                              team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
                              type achievement_type NOT NULL,
                              title VARCHAR(255) NOT NULL,
                              description TEXT,
                              badge_url TEXT,
                              certificate_url TEXT,
                              certificate_data JSONB,
                              metadata JSONB DEFAULT '{}'::jsonb,
                              earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificate templates (for organizations)
CREATE TABLE certificate_templates (
                                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                       organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
                                       name VARCHAR(255) NOT NULL,
                                       description TEXT,
                                       template_data JSONB NOT NULL,
                                       is_default BOOLEAN DEFAULT FALSE,
                                       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                                       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. AI & RECOMMENDATION TABLES
-- ============================================================================

-- AI recommendations
CREATE TABLE ai_recommendations (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                                    hackathon_id UUID REFERENCES hackathons(id) ON DELETE SET NULL,
                                    type recommendation_type NOT NULL,
                                    title VARCHAR(255) NOT NULL,
                                    content JSONB NOT NULL,
                                    confidence_score DECIMAL(3,2),
                                    metadata JSONB DEFAULT '{}'::jsonb,
                                    shown_at TIMESTAMP WITH TIME ZONE,
                                    clicked BOOLEAN DEFAULT FALSE,
                                    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
                                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences and ML features
CREATE TABLE user_profiles (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
                               skill_vector JSONB DEFAULT '{}'::jsonb,
                               interest_vector JSONB DEFAULT '{}'::jsonb,
                               experience_level INTEGER DEFAULT 1,
                               participation_count INTEGER DEFAULT 0,
                               success_rate DECIMAL(3,2) DEFAULT 0.0,
                               preferred_team_size INTEGER,
                               preferred_hackathon_types JSONB DEFAULT '[]'::jsonb,
                               availability_schedule JSONB DEFAULT '{}'::jsonb,
                               learning_goals JSONB DEFAULT '[]'::jsonb,
                               updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. FILE & MEDIA TABLES
-- ============================================================================

-- File uploads
CREATE TABLE files (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       original_name VARCHAR(255) NOT NULL,
                       stored_name VARCHAR(255) NOT NULL,
                       file_path TEXT NOT NULL,
                       file_url TEXT NOT NULL,
                       mime_type VARCHAR(100) NOT NULL,
                       file_size INTEGER NOT NULL,
                       uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
                       hackathon_id UUID REFERENCES hackathons(id) ON DELETE SET NULL,
                       team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
                       category VARCHAR(50),
                       metadata JSONB DEFAULT '{}'::jsonb,
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. TRANSACTION & PAYMENT TABLES
-- ============================================================================

-- Transactions
CREATE TABLE transactions (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              type transaction_type NOT NULL,
                              amount DECIMAL(10,2) NOT NULL,
                              currency VARCHAR(3) DEFAULT 'USD',
                              status transaction_status DEFAULT 'PENDING',
                              stripe_payment_intent_id VARCHAR(255),
                              stripe_transfer_id VARCHAR(255),
                              payer_id UUID REFERENCES users(id) ON DELETE SET NULL,
                              recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
                              organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
                              hackathon_id UUID REFERENCES hackathons(id) ON DELETE SET NULL,
                              description TEXT,
                              metadata JSONB DEFAULT '{}'::jsonb,
                              processed_at TIMESTAMP WITH TIME ZONE,
                              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                               organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
                               stripe_subscription_id VARCHAR(255) UNIQUE,
                               stripe_customer_id VARCHAR(255),
                               tier subscription_tier NOT NULL,
                               status VARCHAR(50) NOT NULL,
                               current_period_start TIMESTAMP WITH TIME ZONE,
                               current_period_end TIMESTAMP WITH TIME ZONE,
                               cancel_at_period_end BOOLEAN DEFAULT FALSE,
                               metadata JSONB DEFAULT '{}'::jsonb,
                               created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                               updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 9. ANALYTICS & TRACKING TABLES
-- ============================================================================

-- User analytics events
CREATE TABLE analytics_events (
                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                                  session_id VARCHAR(255),
                                  event_type VARCHAR(100) NOT NULL,
                                  event_data JSONB DEFAULT '{}'::jsonb,
                                  hackathon_id UUID REFERENCES hackathons(id) ON DELETE SET NULL,
                                  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
                                  ip_address INET,
                                  user_agent TEXT,
                                  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform metrics
CREATE TABLE platform_metrics (
                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  metric_name VARCHAR(100) NOT NULL,
                                  metric_value DECIMAL(15,2) NOT NULL,
                                  metric_type VARCHAR(50) NOT NULL,
                                  dimensions JSONB DEFAULT '{}'::jsonb,
                                  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Organizations indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_verification_status ON organizations(verification_status);
CREATE INDEX idx_organizations_subscription_tier ON organizations(subscription_tier);

-- Hackathons indexes
CREATE INDEX idx_hackathons_slug ON hackathons(slug);
CREATE INDEX idx_hackathons_status ON hackathons(status);
CREATE INDEX idx_hackathons_organization_id ON hackathons(organization_id);
CREATE INDEX idx_hackathons_featured ON hackathons(featured);
CREATE INDEX idx_hackathons_start_date ON hackathons(start_date);
CREATE INDEX idx_hackathons_registration_end ON hackathons(registration_end);
CREATE INDEX idx_hackathons_theme ON hackathons(theme);
CREATE INDEX idx_hackathons_difficulty ON hackathons(difficulty_level);

-- Registrations indexes
CREATE INDEX idx_registrations_hackathon_id ON hackathon_registrations(hackathon_id);
CREATE INDEX idx_registrations_user_id ON hackathon_registrations(user_id);
CREATE INDEX idx_registrations_status ON hackathon_registrations(status);
CREATE INDEX idx_registrations_registered_at ON hackathon_registrations(registered_at);

-- Teams indexes
CREATE INDEX idx_teams_hackathon_id ON teams(hackathon_id);
CREATE INDEX idx_teams_leader_id ON teams(leader_id);
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_teams_looking_for_members ON teams(looking_for_members);

-- Team members indexes
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- Messages indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_team_id ON messages(team_id);
CREATE INDEX idx_messages_hackathon_id ON messages(hackathon_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- AI recommendations indexes
CREATE INDEX idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_type ON ai_recommendations(type);
CREATE INDEX idx_ai_recommendations_created_at ON ai_recommendations(created_at);

-- Analytics indexes
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_hackathon_id ON analytics_events(hackathon_id);

-- Files indexes
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_hackathon_id ON files(hackathon_id);
CREATE INDEX idx_files_team_id ON files(team_id);
CREATE INDEX idx_files_category ON files(category);

-- ============================================================================
-- 11. CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hackathons_updated_at BEFORE UPDATE ON hackathons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificate_templates_updated_at BEFORE UPDATE ON certificate_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 12. CREATE FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Function to update hackathon registration count
CREATE OR REPLACE FUNCTION update_hackathon_registration_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
UPDATE hackathons
SET registration_count = registration_count + 1
WHERE id = NEW.hackathon_id;
RETURN NEW;
ELSIF TG_OP = 'DELETE' THEN
UPDATE hackathons
SET registration_count = registration_count - 1
WHERE id = OLD.hackathon_id;
RETURN OLD;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for registration count
CREATE TRIGGER hackathon_registration_count_trigger
    AFTER INSERT OR DELETE ON hackathon_registrations
    FOR EACH ROW EXECUTE FUNCTION update_hackathon_registration_count();

-- Function to automatically update user participation count
CREATE OR REPLACE FUNCTION update_user_participation_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO user_profiles (user_id, participation_count)
        VALUES (NEW.user_id, 1)
        ON CONFLICT (user_id)
        DO UPDATE SET participation_count = user_profiles.participation_count + 1;
RETURN NEW;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user participation count
CREATE TRIGGER user_participation_count_trigger
    AFTER INSERT ON hackathon_registrations
    FOR EACH ROW EXECUTE FUNCTION update_user_participation_count();

-- ============================================================================
-- 13. INSERT SOME INITIAL DATA (OPTIONAL)
-- ============================================================================

-- Insert default achievement types data (you can skip this if you prefer to add data via your app)
-- This is just for reference, uncomment if you want some seed data

/*
-- Sample admin user (you should change this!)
INSERT INTO users (email, username, full_name, role, email_verified)
VALUES ('admin@hackhub.com', 'admin', 'HackHub Admin', 'ADMIN', true);

-- Sample certificate template data structure
INSERT INTO certificate_templates (organization_id, name, description, template_data, is_default)
VALUES (
  null, -- Will need to be updated with actual org ID
  'Default Certificate',
  'Standard participation certificate',
  '{
    "width": 800,
    "height": 600,
    "backgroundColor": "#ffffff",
    "elements": [
      {
        "type": "text",
        "content": "Certificate of Participation",
        "x": 400,
        "y": 150,
        "fontSize": 24,
        "color": {"r": 0, "g": 0, "b": 0},
        "align": "center"
      },
      {
        "type": "text",
        "content": "{{participantName}}",
        "x": 400,
        "y": 250,
        "fontSize": 18,
        "color": {"r": 0, "g": 0, "b": 0},
        "align": "center"
      },
      {
        "type": "text",
        "content": "Successfully participated in {{hackathonName}}",
        "x": 400,
        "y": 350,
        "fontSize": 14,
        "color": {"r": 0, "g": 0, "b": 0},
        "align": "center"
      }
    ]
  }'::jsonb,
  true
);
*/

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

-- Your HackHub database is now ready!
-- Next steps:
-- 1. Update your environment variables with the Supabase connection details
-- 2. Use the Supabase admin key for server-side operations
-- 3. Start building your API endpoints using these tables
--
-- Key tables to start with for MVP:
-- - users (for authentication)
-- - organizations (for hackathon hosts)
-- - hackathons (for listing events)
-- - hackathon_registrations (for user signups)
-- - teams (for team formation)
-- - hackathon_updates (for communication)
--
-- Remember: No RLS is set up, so handle all security in your API routes!