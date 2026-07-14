/*
# Create workout tracking tables (single-tenant, no auth)

1. New Tables
- `workouts`: workout sessions with date and name
- `exercises`: exercises within a workout
- `sets`: individual sets with weight, reps, completion status

2. Security
- Enable RLS on all tables
- Allow anon + authenticated full CRUD (intentionally shared/public data)
*/

CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '今日課表',
  workout_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name text NOT NULL,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_number int NOT NULL,
  weight numeric(6,2),
  reps int,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

-- Workouts policies
DROP POLICY IF EXISTS "anon_crud_workouts" ON workouts;
CREATE POLICY "anon_crud_workouts" ON workouts FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Exercises policies
DROP POLICY IF EXISTS "anon_crud_exercises" ON exercises;
CREATE POLICY "anon_crud_exercises" ON exercises FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Sets policies
DROP POLICY IF EXISTS "anon_crud_sets" ON sets;
CREATE POLICY "anon_crud_sets" ON sets FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_sets_exercise_id ON sets(exercise_id);