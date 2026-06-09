-- ═══════════════════════════════════════════════════════════════
-- PSB SecureWealth Twin — Supabase Schema
-- Run this in Supabase SQL Editor after creating your project
-- ═══════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- 1. PROFILES (extends auth.users)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'User',
  email TEXT,
  phone TEXT,
  risk_profile TEXT CHECK (risk_profile IN ('Conservative', 'Moderate', 'Aggressive')) DEFAULT 'Moderate',
  tax_bracket INTEGER CHECK (tax_bracket IN (0, 10, 20, 30)) DEFAULT 30,
  monthly_income NUMERIC(12,2) DEFAULT 125000,
  monthly_expenses NUMERIC(12,2) DEFAULT 72000,
  monthly_savings NUMERIC(12,2) DEFAULT 28000,
  kyc_verified BOOLEAN DEFAULT false,
  premium_status TEXT DEFAULT 'Premium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- 2. ASSETS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('bank', 'mutualFund', 'stock', 'gold', 'property', 'vehicle', 'other')) NOT NULL,
  value NUMERIC(14,2) NOT NULL DEFAULT 0,
  liquidity TEXT CHECK (liquidity IN ('high', 'medium', 'low')) DEFAULT 'medium',
  returns NUMERIC(5,2),
  linked_via_aa BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 3. TRANSACTIONS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  txn_id TEXT UNIQUE NOT NULL DEFAULT 'TXN-' || extract(epoch from now())::bigint,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  amount NUMERIC(12,2) NOT NULL,
  txn_type TEXT CHECK (txn_type IN ('credit', 'debit')) NOT NULL,
  status TEXT CHECK (status IN ('ALLOWED', 'BLOCKED', 'DELAYED')) DEFAULT 'ALLOWED',
  risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')) DEFAULT 'LOW',
  score INTEGER,
  reference_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 4. GOALS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal_type TEXT CHECK (goal_type IN ('home', 'education', 'retirement', 'emergency', 'car', 'travel', 'wedding', 'other')) NOT NULL,
  target_amount NUMERIC(14,2) NOT NULL,
  current_amount NUMERIC(14,2) DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 5. RECURRING BILLS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  predicted_amount NUMERIC(12,2),
  due_day INTEGER CHECK (due_day BETWEEN 1 AND 31),
  icon TEXT,
  color TEXT,
  status TEXT CHECK (status IN ('upcoming', 'due', 'overdue', 'paid')) DEFAULT 'upcoming',
  is_recurring BOOLEAN DEFAULT true,
  frequency TEXT CHECK (frequency IN ('monthly', 'weekly', 'yearly')) DEFAULT 'monthly',
  auto_detected BOOLEAN DEFAULT false,
  last_paid DATE,
  history NUMERIC[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 6. NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  icon TEXT,
  text TEXT NOT NULL,
  color TEXT DEFAULT 'primary',
  unread BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 7. CONSENTS (Account Aggregator)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_id TEXT UNIQUE NOT NULL,
  data_scope TEXT[] DEFAULT '{}',
  purpose TEXT,
  validity_days INTEGER DEFAULT 90,
  status TEXT CHECK (status IN ('ACTIVE', 'REVOKED')) DEFAULT 'ACTIVE',
  granted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 8. BADGES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  UNIQUE(user_id, badge_id)
);

-- ═══════════════════════════════════════════════════════════════
-- 9. FAMILY MEMBERS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  relation TEXT NOT NULL,
  avatar TEXT,
  net_worth NUMERIC(14,2) DEFAULT 0,
  monthly_contribution NUMERIC(12,2) DEFAULT 0,
  data_sharing_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) — ENABLE EVERYWHERE
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Assets: users can only access their own
CREATE POLICY "Users can CRUD own assets"
  ON assets FOR ALL USING (auth.uid() = user_id);

-- Transactions: users can only access their own
CREATE POLICY "Users can CRUD own transactions"
  ON transactions FOR ALL USING (auth.uid() = user_id);

-- Goals: users can only access their own
CREATE POLICY "Users can CRUD own goals"
  ON goals FOR ALL USING (auth.uid() = user_id);

-- Bills: users can only access their own
CREATE POLICY "Users can CRUD own bills"
  ON bills FOR ALL USING (auth.uid() = user_id);

-- Notifications: users can only access their own
CREATE POLICY "Users can CRUD own notifications"
  ON notifications FOR ALL USING (auth.uid() = user_id);

-- Consents: users can only access their own
CREATE POLICY "Users can CRUD own consents"
  ON consents FOR ALL USING (auth.uid() = user_id);

-- Badges: users can only access their own
CREATE POLICY "Users can CRUD own badges"
  ON badges FOR ALL USING (auth.uid() = user_id);

-- Family members: users can only access their own
CREATE POLICY "Users can CRUD own family members"
  ON family_members FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA (Demo user data — run after creating a user)
-- ═══════════════════════════════════════════════════════════════

-- Function to seed demo data for a user
CREATE OR REPLACE FUNCTION seed_demo_data(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Seed assets
  INSERT INTO assets (user_id, name, type, value, liquidity, returns) VALUES
    (target_user_id, 'SBI Savings', 'bank', 450000, 'high', NULL),
    (target_user_id, 'HDFC Savings', 'bank', 320000, 'high', NULL),
    (target_user_id, 'Axis Bluechip Fund', 'mutualFund', 280000, 'medium', 14.2),
    (target_user_id, 'Nifty 50 ETF', 'stock', 150000, 'high', 12.8),
    (target_user_id, 'Physical Gold', 'gold', 200000, 'medium', NULL),
    (target_user_id, 'Mumbai Apartment', 'property', 8500000, 'low', NULL);

  -- Seed goals
  INSERT INTO goals (user_id, name, goal_type, target_amount, current_amount, deadline) VALUES
    (target_user_id, 'Emergency Fund', 'emergency', 600000, 360000, '2026-12-31'),
    (target_user_id, 'Dream Home', 'home', 2500000, 850000, '2030-06-30'),
    (target_user_id, 'Child Education', 'education', 1500000, 420000, '2032-03-15');

  -- Seed bills
  INSERT INTO bills (user_id, name, category, amount, due_day, icon, color, status, is_recurring, frequency, history) VALUES
    (target_user_id, 'House Rent', 'Housing', 25000, 1, 'fa-house', 'bg-rose-500', 'upcoming', true, 'monthly', ARRAY[25000, 25000, 25000]),
    (target_user_id, 'Electricity Bill', 'Utilities', 4800, 15, 'fa-bolt', 'bg-amber-500', 'upcoming', true, 'monthly', ARRAY[3100, 3300, 2900, 3200]),
    (target_user_id, 'Monthly SIPs', 'Investment', 25000, 5, 'fa-chart-line', 'bg-emerald-500', 'upcoming', true, 'monthly', ARRAY[25000, 25000, 25000]);

  -- Seed transactions
  INSERT INTO transactions (user_id, txn_id, date, description, category, amount, txn_type, status, risk_level) VALUES
    (target_user_id, 'TXN-DEMO-001', '2026-04-22', 'Salary Credit - Acme Corp', 'Income', 125000, 'credit', 'ALLOWED', 'LOW'),
    (target_user_id, 'TXN-DEMO-002', '2026-04-21', 'Grocery - BigBasket', 'Food', 2400, 'debit', 'ALLOWED', 'LOW'),
    (target_user_id, 'TXN-DEMO-003', '2026-04-21', 'Electricity Bill - Adani', 'Utilities', 3200, 'debit', 'ALLOWED', 'LOW'),
    (target_user_id, 'TXN-DEMO-004', '2026-04-20', 'Axis Bluechip SIP', 'Investment', 15000, 'debit', 'ALLOWED', 'LOW');

  -- Seed badges
  INSERT INTO badges (user_id, badge_id, name, description, icon, unlocked) VALUES
    (target_user_id, 'first-login', 'First Login', 'Welcome to SecureWealth!', 'fa-star', true),
    (target_user_id, 'savvy-saver', 'Savvy Saver', 'Saved ₹50,000 in a month', 'fa-piggy-bank', true),
    (target_user_id, 'goal-setter', 'Goal Setter', 'Set your first financial goal', 'fa-bullseye', true);

  -- Update profile
  UPDATE profiles SET
    monthly_income = 125000,
    monthly_expenses = 72000,
    monthly_savings = 28000,
    kyc_verified = true
  WHERE id = target_user_id;

END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- INDEXES for performance
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_bills_user_id ON bills(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, unread) WHERE unread = true;
