-- ============================================
-- Wallestars Verification Schema for Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: users_pending
-- Description: Users awaiting verification
-- ============================================
CREATE TABLE IF NOT EXISTS users_pending (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending',
        'awaiting_sms',
        'awaiting_email',
        'processing',
        'verified',
        'failed'
    )),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_users_pending_status ON users_pending(status);
CREATE INDEX IF NOT EXISTS idx_users_pending_phone ON users_pending(phone);

-- ============================================
-- Table: verified_business_profiles
-- Description: Verified business information
-- ============================================
CREATE TABLE IF NOT EXISTS verified_business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users_pending(id) ON DELETE SET NULL,
    
    -- Business Information
    company_name TEXT,
    company_name_en TEXT,
    eik TEXT UNIQUE,  -- Bulgarian EIK/BULSTAT
    vat_number TEXT,
    business_type TEXT CHECK (business_type IN ('EOOD', 'ET', 'OOD', 'AD', 'EAD', 'OTHER')),
    
    -- Contact Information
    email TEXT,
    email_alias TEXT,  -- 33mail alias for routing
    phone TEXT,
    
    -- Address
    address JSONB DEFAULT '{}',
    -- Expected format: {street, city, postcode, country}
    
    -- Ownership & Relationships
    ownership_data JSONB DEFAULT '{}',
    -- Expected format: {owners: [{name, share, role}]}
    
    -- Verification Status
    sms_verification_code TEXT,
    sms_verified_at TIMESTAMPTZ,
    email_confirmation_code TEXT,
    email_verification_link TEXT,
    email_verified_at TIMESTAMPTZ,
    
    -- Registry Data
    registry_data JSONB DEFAULT '{}',
    -- CompanyBook API response data
    
    -- Timestamps
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_verified_profiles_user_id ON verified_business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_verified_profiles_eik ON verified_business_profiles(eik);
CREATE INDEX IF NOT EXISTS idx_verified_profiles_email_alias ON verified_business_profiles(email_alias);
CREATE INDEX IF NOT EXISTS idx_verified_profiles_business_type ON verified_business_profiles(business_type);

-- ============================================
-- Table: verification_logs
-- Description: Audit trail for verification events
-- ============================================
CREATE TABLE IF NOT EXISTS verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users_pending(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES verified_business_profiles(id) ON DELETE CASCADE,
    
    event_type TEXT NOT NULL CHECK (event_type IN (
        'registry_check_started',
        'registry_check_completed',
        'sms_sent',
        'sms_received',
        'sms_verified',
        'email_sent',
        'email_received',
        'email_verified',
        'verification_completed',
        'verification_failed'
    )),
    
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for log queries
CREATE INDEX IF NOT EXISTS idx_verification_logs_user_id ON verification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_event_type ON verification_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_verification_logs_created_at ON verification_logs(created_at);

-- ============================================
-- Function: Update timestamp trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_users_pending_updated_at ON users_pending;
CREATE TRIGGER update_users_pending_updated_at
    BEFORE UPDATE ON users_pending
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_verified_profiles_updated_at ON verified_business_profiles;
CREATE TRIGGER update_verified_profiles_updated_at
    BEFORE UPDATE ON verified_business_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE users_pending ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access on users_pending"
    ON users_pending FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on verified_business_profiles"
    ON verified_business_profiles FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on verification_logs"
    ON verification_logs FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- INSERT INTO users_pending (name, email, phone, status)
-- VALUES 
--     ('Test Company EOOD', 'test@example.com', '+359888123456', 'pending');
