
-- Singleton settings table
CREATE TABLE public.app_settings (
  id integer PRIMARY KEY DEFAULT 1,
  active_event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_settings_singleton CHECK (id = 1)
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read app settings"
ON public.app_settings FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Staff can update app settings"
ON public.app_settings FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Staff can insert app settings"
ON public.app_settings FOR INSERT
TO authenticated WITH CHECK (id = 1);

-- Seed singleton with first event (or null)
INSERT INTO public.app_settings (id, active_event_id)
VALUES (1, (SELECT id FROM public.events ORDER BY created_at LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- Rides get an explicit event_date (defaults to today)
ALTER TABLE public.rides
  ADD COLUMN event_date date NOT NULL DEFAULT current_date;

CREATE INDEX idx_rides_event_date ON public.rides(event_date);
