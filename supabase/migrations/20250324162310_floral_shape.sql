/*
  # Fix user creation process

  1. Changes
    - Remove automatic trigger for user creation
    - Update policies to handle manual user creation
    - Ensure email uniqueness

  2. Security
    - Maintain row level security
    - Keep existing access control
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Add unique constraint on email
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

-- Update insert policy to be more specific
DROP POLICY IF EXISTS "Handle new user creation" ON users;
CREATE POLICY "Handle new user creation"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid() AND
    NOT EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );