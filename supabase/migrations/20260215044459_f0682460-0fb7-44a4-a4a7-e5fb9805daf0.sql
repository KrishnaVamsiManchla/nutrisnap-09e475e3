
CREATE TABLE public.weight_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  weight_kg numeric NOT NULL,
  logged_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weight logs"
  ON public.weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight logs"
  ON public.weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight logs"
  ON public.weight_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight logs"
  ON public.weight_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE UNIQUE INDEX idx_weight_logs_user_date ON public.weight_logs (user_id, logged_at);
