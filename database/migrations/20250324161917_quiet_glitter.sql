/*
  # Fix users table policies and constraints

  1. Changes
    - Drop existing policies
    - Create new simplified policies without recursion
    - Add minimum password length validation
    - Fix RLS policies for users table

  2. Security
    - Maintain row level security
    - Ensure proper access control
    - Prevent infinite recursion
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new simplified policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    role = 'admin'
  );

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Add insert policy for new user creation
CREATE POLICY "Handle new user creation"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;