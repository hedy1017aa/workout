import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase 環境變數未設定");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Workout = {
  id: string;
  name: string;
  workout_date: string;
  created_at: string;
};

export type Exercise = {
  id: string;
  workout_id: string;
  name: string;
  order_index: number;
  exercise_type: string | null;
  exercise_attributes: Record<string, string | number | boolean | null>;
  is_unilateral: boolean;
  rest_time: number | null;
  created_at: string;
};

export type Set = {
  id: string;
  exercise_id: string;
  set_number: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
};

export type ExerciseWithSets = Exercise & {
  sets: Set[];
};
