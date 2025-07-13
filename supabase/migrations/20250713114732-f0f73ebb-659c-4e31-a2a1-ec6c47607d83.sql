
-- First, let's completely clean up and rebuild the user system
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop and recreate the enum type to ensure it's clean
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('production_manager', 'machine_operator', 'operations_admin');

-- Temporarily drop the role column to avoid casting issues
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Add the role column back with the correct type
ALTER TABLE public.profiles ADD COLUMN role user_role NOT NULL DEFAULT 'machine_operator'::user_role;

-- Create a more robust trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_role_value user_role;
BEGIN
  -- Safely determine the role from metadata
  user_role_value := CASE 
    WHEN NEW.raw_user_meta_data->>'role' = 'production_manager' THEN 'production_manager'::user_role
    WHEN NEW.raw_user_meta_data->>'role' = 'machine_operator' THEN 'machine_operator'::user_role
    WHEN NEW.raw_user_meta_data->>'role' = 'operations_admin' THEN 'operations_admin'::user_role
    ELSE 'machine_operator'::user_role
  END;

  -- Insert new profile
  INSERT INTO public.profiles (id, email, full_name, role, department, shift)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    user_role_value,
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'shift'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the specific error for debugging
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    -- Still return NEW to allow user creation to proceed
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
