
-- Fix RLS policies for employee_tasks table
DROP POLICY IF EXISTS "Users can update their assigned tasks" ON public.employee_tasks;

CREATE POLICY "Users can view employee tasks" ON public.employee_tasks
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create employee tasks" ON public.employee_tasks
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update employee tasks" ON public.employee_tasks
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete employee tasks" ON public.employee_tasks
FOR DELETE USING (auth.role() = 'authenticated');

-- Fix RLS policies for customer_orders table
CREATE POLICY "Users can view customer orders" ON public.customer_orders
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create customer orders" ON public.customer_orders
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update customer orders" ON public.customer_orders
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete customer orders" ON public.customer_orders
FOR DELETE USING (auth.role() = 'authenticated');

-- Fix RLS policies for raw_materials table
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view raw materials" ON public.raw_materials
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create raw materials" ON public.raw_materials
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update raw materials" ON public.raw_materials
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete raw materials" ON public.raw_materials
FOR DELETE USING (auth.role() = 'authenticated');

-- Fix RLS policies for machines table
CREATE POLICY "Users can update machines" ON public.machines
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create machines" ON public.machines
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete machines" ON public.machines
FOR DELETE USING (auth.role() = 'authenticated');

-- Fix RLS policies for products table
CREATE POLICY "Users can create products" ON public.products
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update products" ON public.products
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete products" ON public.products
FOR DELETE USING (auth.role() = 'authenticated');

-- Fix RLS policies for production_batches table
CREATE POLICY "Users can view production batches" ON public.production_batches
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create production batches" ON public.production_batches
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete production batches" ON public.production_batches
FOR DELETE USING (auth.role() = 'authenticated');

-- Fix RLS policies for profiles table to allow all authenticated users to view profiles
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
FOR SELECT USING (auth.role() = 'authenticated');

-- Fix RLS policies for stock_movements table
CREATE POLICY "Users can create stock movements" ON public.stock_movements
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update stock movements" ON public.stock_movements
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete stock movements" ON public.stock_movements
FOR DELETE USING (auth.role() = 'authenticated');

-- Fix RLS policies for suppliers table
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view suppliers" ON public.suppliers
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create suppliers" ON public.suppliers
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update suppliers" ON public.suppliers
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete suppliers" ON public.suppliers
FOR DELETE USING (auth.role() = 'authenticated');

-- Fix RLS policies for order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view order items" ON public.order_items
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create order items" ON public.order_items
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update order items" ON public.order_items
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete order items" ON public.order_items
FOR DELETE USING (auth.role() = 'authenticated');
