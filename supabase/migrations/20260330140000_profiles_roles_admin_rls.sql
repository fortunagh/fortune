-- Roles: admin | customer. Run after 20260330120000_request_access_submissions.sql

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users cannot change their own role from the client (compare existing role)
CREATE POLICY "profiles_update_own_non_role"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- New user → profile row (default customer)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- Backfill existing users
INSERT INTO public.profiles (id, role)
SELECT id, 'customer' FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Request access: workflow + admin CRUD (replace open SELECT for customers)
-- ---------------------------------------------------------------------------
ALTER TABLE public.request_access_submissions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'contacted', 'approved', 'declined'));

ALTER TABLE public.request_access_submissions
  ADD COLUMN IF NOT EXISTS admin_notes text;

DROP POLICY IF EXISTS "request_access_select_authenticated" ON public.request_access_submissions;

CREATE POLICY "request_access_admin_select"
  ON public.request_access_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "request_access_admin_update"
  ON public.request_access_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "request_access_admin_delete"
  ON public.request_access_submissions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

COMMENT ON COLUMN public.request_access_submissions.status IS 'Admin workflow status';
COMMENT ON COLUMN public.request_access_submissions.admin_notes IS 'Internal notes (admins only)';

-- ---------------------------------------------------------------------------
-- Promote your first admin (replace email):
-- UPDATE public.profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com' LIMIT 1);
