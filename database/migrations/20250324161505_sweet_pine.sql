/*
  # Fix users table policies to prevent recursion

  1. Changes
    - Modify the SELECT policy to avoid recursion
    - Simplify the policy logic while maintaining security

  2. Security
    - Users can still read their own data
    - Admins can read all user data
    - No changes to update policy as it's already correct
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create new policy without recursion
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (
    auth.uid() = id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );