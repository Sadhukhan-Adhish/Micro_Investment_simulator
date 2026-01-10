/*
  # Micro-Investing Platform Schema

  ## Overview
  Creates the database schema for a virtual banking and micro-investing simulator.
  All values are virtual/simulated for educational purposes.

  ## New Tables

  ### `user_profiles`
  Extended user profile data for the investing simulator
  - `id` (uuid, primary key) - References auth.users
  - `full_name` (text) - User's display name
  - `email` (text) - User's email
  - `risk_profile` (text) - Investment risk preference: 'low', 'medium', 'high'
  - `virtual_balance` (numeric) - Virtual bank account balance
  - `investment_balance` (numeric) - Total in investment wallet
  - `total_invested` (numeric) - Cumulative amount invested
  - `auto_invest_enabled` (boolean) - Whether daily auto-invest is active
  - `auto_invest_amount` (numeric) - Daily auto-invest amount (e.g., 5 or 10)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `transactions`
  All financial transactions (payments, round-ups, auto-invests)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References user_profiles
  - `type` (text) - Transaction type: 'payment', 'roundup', 'auto_invest'
  - `amount` (numeric) - Transaction amount
  - `description` (text) - Transaction description
  - `virtual_balance_after` (numeric) - Balance after transaction
  - `investment_balance_after` (numeric) - Investment balance after transaction
  - `created_at` (timestamptz) - Transaction timestamp

  ### `portfolios`
  Investment portfolio allocation and growth tracking
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References user_profiles
  - `bonds_amount` (numeric) - Amount allocated to bonds
  - `equity_amount` (numeric) - Amount allocated to equity
  - `initial_investment` (numeric) - Starting investment amount
  - `current_value` (numeric) - Current portfolio value with growth
  - `last_growth_calculation` (timestamptz) - Last time growth was calculated
  - `created_at` (timestamptz) - Portfolio start date
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Authenticated users required for all operations
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  risk_profile text NOT NULL DEFAULT 'low' CHECK (risk_profile IN ('low', 'medium', 'high')),
  virtual_balance numeric NOT NULL DEFAULT 10000,
  investment_balance numeric NOT NULL DEFAULT 0,
  total_invested numeric NOT NULL DEFAULT 0,
  auto_invest_enabled boolean NOT NULL DEFAULT false,
  auto_invest_amount numeric NOT NULL DEFAULT 10 CHECK (auto_invest_amount >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('payment', 'roundup', 'auto_invest')),
  amount numeric NOT NULL,
  description text NOT NULL,
  virtual_balance_after numeric NOT NULL,
  investment_balance_after numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  bonds_amount numeric NOT NULL DEFAULT 0,
  equity_amount numeric NOT NULL DEFAULT 0,
  initial_investment numeric NOT NULL DEFAULT 0,
  current_value numeric NOT NULL DEFAULT 0,
  last_growth_calculation timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for portfolios
CREATE POLICY "Users can view own portfolio"
  ON portfolios FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio"
  ON portfolios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio"
  ON portfolios FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
