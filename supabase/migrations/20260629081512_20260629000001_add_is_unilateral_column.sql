/*
# Add is_unilateral column to exercises table

1. Modified Tables
- `exercises`
  - Add `is_unilateral` (boolean, default false) - indicates if the exercise is performed unilaterally (one side at a time)

2. Notes
- This column allows tracking whether exercises like lunges, shoulder presses, etc. are performed one side at a time
- Default is false (bilateral training)
*/

ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_unilateral boolean DEFAULT false;
