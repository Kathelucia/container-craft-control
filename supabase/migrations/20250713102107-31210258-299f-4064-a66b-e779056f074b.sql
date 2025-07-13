
-- First, let's ensure we have the proper user roles enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('production_manager', 'machine_operator', 'operations_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update the profiles table to ensure proper structure
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'machine_operator'::user_role;

-- Create a trigger function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, department, shift)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'machine_operator'::user_role),
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'shift'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Production managers can view all profiles" ON public.profiles;

-- Allow users to view and update their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Allow production managers and operations admins to view all profiles
CREATE POLICY "Managers can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('production_manager', 'operations_admin')
  )
);

-- Allow operations admins to update any profile (for role assignments)
CREATE POLICY "Operations admin can update profiles" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'operations_admin'
  )
);

-- Enable RLS on all tables that need it
ALTER TABLE public.employee_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Update employee_tasks policies
DROP POLICY IF EXISTS "Users can view their assigned tasks" ON public.employee_tasks;
DROP POLICY IF EXISTS "Users can update their assigned tasks" ON public.employee_tasks;
DROP POLICY IF EXISTS "Managers can manage all tasks" ON public.employee_tasks;

CREATE POLICY "Users can view their assigned tasks" 
ON public.employee_tasks FOR SELECT 
USING (
  assigned_to = auth.uid() OR 
  assigned_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('production_manager', 'operations_admin')
  )
);

CREATE POLICY "Users can update their assigned tasks" 
ON public.employee_tasks FOR UPDATE 
USING (assigned_to = auth.uid());

CREATE POLICY "Managers can manage all tasks" 
ON public.employee_tasks FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('production_manager', 'operations_admin')
  )
);

-- Update maintenance_logs policies
DROP POLICY IF EXISTS "All authenticated users can view maintenance logs" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Operators can create maintenance logs" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Managers can manage maintenance logs" ON public.maintenance_logs;

CREATE POLICY "All authenticated users can view maintenance logs" 
ON public.maintenance_logs FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Operators can create maintenance logs" 
ON public.maintenance_logs FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Managers can manage maintenance logs" 
ON public.maintenance_logs FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('production_manager', 'operations_admin')
  )
);

-- Update order_items policies
CREATE POLICY "Operations admin can manage order items" 
ON public.order_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'operations_admin'
  )
);

-- Update stock_movements policies
CREATE POLICY "All authenticated users can view stock movements" 
ON public.stock_movements FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Operations staff can manage stock movements" 
ON public.stock_movements FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('operations_admin', 'production_manager')
  )
);
