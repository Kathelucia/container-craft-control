
-- First, ensure we drop any existing problematic objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the user_role enum (this will succeed even if it exists)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('production_manager', 'machine_operator', 'operations_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure the profiles table has the correct structure
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role USING role::text::user_role;

ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'machine_operator'::user_role;

-- Recreate the trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert new profile with proper type casting
  INSERT INTO public.profiles (id, email, full_name, role, department, shift)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' IN ('production_manager', 'machine_operator', 'operations_admin') 
      THEN (NEW.raw_user_meta_data->>'role')::user_role
      ELSE 'machine_operator'::user_role
    END,
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'shift'
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
