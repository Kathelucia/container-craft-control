
-- Completely rebuild the user role system from scratch
-- First, clean up everything
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Force drop the enum type and recreate it
DROP TYPE IF EXISTS user_role CASCADE;

-- Recreate the enum type with explicit schema
CREATE TYPE public.user_role AS ENUM ('production_manager', 'machine_operator', 'operations_admin');

-- Drop the role column completely and recreate it
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Add the role column back with explicit schema reference
ALTER TABLE public.profiles ADD COLUMN role public.user_role NOT NULL DEFAULT 'machine_operator'::public.user_role;

-- Create the most robust trigger function possible
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  -- Insert with explicit type casting and null handling
  INSERT INTO public.profiles (id, email, full_name, role, department, shift)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'production_manager' THEN 'production_manager'::public.user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'operations_admin' THEN 'operations_admin'::public.user_role
      ELSE 'machine_operator'::public.user_role
    END,
    NULLIF(NEW.raw_user_meta_data->>'department', ''),
    NULLIF(NEW.raw_user_meta_data->>'shift', '')
  );
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'handle_new_user error for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
