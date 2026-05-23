
-- Remove permissive public policies
DROP POLICY IF EXISTS "Public access for customers" ON public.customers;
DROP POLICY IF EXISTS "Public access for drivers" ON public.drivers;
DROP POLICY IF EXISTS "Public access for events" ON public.events;
DROP POLICY IF EXISTS "Public access for rides" ON public.rides;

-- Authenticated staff: full access to all tables
CREATE POLICY "Staff full access to customers"
ON public.customers FOR ALL
TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Staff full access to drivers"
ON public.drivers FOR ALL
TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Staff full access to events"
ON public.events FOR ALL
TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Staff full access to rides"
ON public.rides FOR ALL
TO authenticated
USING (true) WITH CHECK (true);

-- Public join form: anonymous visitors may only insert a waitlist signup
CREATE POLICY "Anonymous can join waitlist"
ON public.customers FOR INSERT
TO anon
WITH CHECK (status = 'waiting');
