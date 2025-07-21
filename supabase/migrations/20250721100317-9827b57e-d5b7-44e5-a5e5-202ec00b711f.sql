-- Add INSERT policy for profiles table to allow bulk employee uploads
CREATE POLICY "Users can create employee profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'::text);