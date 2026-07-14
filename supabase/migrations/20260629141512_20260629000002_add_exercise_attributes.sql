/*
# Replace exercise_type with exercise_attributes JSONB column

1. Modified Tables
- `exercises`
  - Add `exercise_attributes` (jsonb, nullable) - stores flexible exercise attributes as key-value pairs
  - Each exercise type has different attribute schemas (equipment, angle, grip, notes, etc.)

2. Notes
- This replaces the simple string-based `exercise_type` with a flexible JSON structure
- Each exercise type has its own set of attributes defined in the frontend
- Example attributes:
  - 臥推: { equipment: '槓鈴', angle: '平板', grip: '窄握', notes: '' }
  - 深蹲: { equipment: '槓鈴', form: '高背槓', stance: '寬距', notes: '' }
  - 引體向上: { grip: '反手', assisted: false, weight: null, notes: '' }
*/

ALTER TABLE exercises ADD COLUMN IF NOT EXISTS exercise_attributes jsonb DEFAULT '{}';
