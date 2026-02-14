
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS goal_weight_kg numeric;
