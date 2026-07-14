/*
# Add exercise_type column to exercises table

1. Modified Tables
- `exercises`
  - Add `exercise_type` (text, nullable) - stores the specific variant of an exercise
  - For example: "高背槓", "低背槓", "前蹲" for squats; "傳統", "相撲", "羅馬尼亞" for deadlifts
  - NULL for exercises that don't have variants

2. Notes
- This column is optional (nullable) because not all exercises have types/variations
- The frontend will show a dropdown only for exercises that support types (squat, deadlift)
*/

ALTER TABLE exercises ADD COLUMN IF NOT EXISTS exercise_type text;
