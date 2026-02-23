
-- Drivers table
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  car TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access for drivers" ON public.drivers FOR ALL USING (true) WITH CHECK (true);

-- Events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access for events" ON public.events FOR ALL USING (true) WITH CHECK (true);

-- Customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  age_group TEXT NOT NULL DEFAULT '18-25',
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access for customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

-- Rides table
CREATE TABLE public.rides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  staff_name TEXT NOT NULL DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access for rides" ON public.rides FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for customers and rides
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;

-- Seed default drivers
INSERT INTO public.drivers (name, car) VALUES
  ('Scott Massari', 'Nissan Silvia S15'),
  ('Anth Romano', 'Nissan 350Z'),
  ('Danny Bazzo', 'Toyota 86'),
  ('Matt Jackson', 'Nissan Skyline R34'),
  ('Chris Reeve', 'Mazda RX-7 FD'),
  ('Jake Donnini', 'Nissan Silvia S14'),
  ('Tom Harris', 'Toyota Supra MK4'),
  ('Luke Anderson', 'BMW E36'),
  ('Ryan Mitchell', 'Nissan 200SX S13'),
  ('Ben Cooper', 'Holden Commodore VE'),
  ('Sam Williams', 'Ford Mustang GT'),
  ('Jordan Lee', 'Mitsubishi Evo 9'),
  ('Nathan Brown', 'Subaru WRX STI'),
  ('Alex Turner', 'Toyota Chaser JZX100'),
  ('Josh Kelly', 'Nissan Cefiro A31'),
  ('Liam Davis', 'Honda S2000'),
  ('Connor White', 'Mazda MX-5 NA'),
  ('Dylan Young', 'BMW E46 M3');

-- Seed default events
INSERT INTO public.events (name) VALUES
  ('Friday Night Drifts'),
  ('Drift School'),
  ('Reetsuri Festival'),
  ('Sunday Skids'),
  ('Pro Am Comp'),
  ('Track Day Special');
