/*
  # Create tasks table and security policies

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `status` (text)
      - `priority` (text)
      - `assigned_to` (uuid, references auth.users)
      - `created_by` (uuid, references auth.users)
      - `due_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for:
      - Users can read tasks they created or are assigned to
      - Users can create tasks
      - Users can update tasks they created or are assigned to
      - Users can delete tasks they created
*/

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  assigned_to uuid REFERENCES auth.users,
  created_by uuid REFERENCES auth.users NOT NULL,
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('todo', 'in_progress', 'completed')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high'))
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read tasks they created or are assigned to
CREATE POLICY "Users can read own tasks"
  ON tasks
  FOR SELECT
  USING (
    auth.uid() = created_by OR
    auth.uid() = assigned_to
  );

-- Policy: Users can create tasks
CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update tasks they created or are assigned to
CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  USING (
    auth.uid() = created_by OR
    auth.uid() = assigned_to
  );

-- Policy: Users can delete tasks they created
CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  USING (auth.uid() = created_by);