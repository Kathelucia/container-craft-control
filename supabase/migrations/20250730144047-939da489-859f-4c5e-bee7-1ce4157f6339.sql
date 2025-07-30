-- BetaFlow Manufacturing Management System Database Schema

-- First, let's ensure we have all the necessary enums
DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS public.user_role AS ENUM ('production_manager', 'machine_operator', 'operations_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS public.production_status AS ENUM ('scheduled', 'in_progress', 'completed', 'paused', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS public.machine_status AS ENUM ('idle', 'running', 'maintenance', 'breakdown', 'offline');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS public.maintenance_type AS ENUM ('preventive', 'corrective', 'emergency', 'scheduled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS public.task_status AS ENUM ('assigned', 'in_progress', 'completed', 'overdue');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS public.order_status AS ENUM ('pending', 'confirmed', 'in_production', 'ready', 'dispatched', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add defect tracking table for quality control
CREATE TABLE IF NOT EXISTS public.defect_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id UUID REFERENCES public.production_batches(id),
    defect_type TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    reported_by UUID REFERENCES public.profiles(id),
    image_url TEXT,
    corrective_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add production alerts table for real-time notifications
CREATE TABLE IF NOT EXISTS public.production_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'machine_breakdown', 'quality_issue', 'target_missed', 'maintenance_due')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_read BOOLEAN DEFAULT false,
    related_table TEXT,
    related_id UUID,
    assigned_to UUID REFERENCES public.profiles(id),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Add shift schedules table
CREATE TABLE IF NOT EXISTS public.shift_schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    shift_name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days_of_week INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}', -- 1-7 for Mon-Sun
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add batch assignments table for operators
CREATE TABLE IF NOT EXISTS public.batch_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id UUID REFERENCES public.production_batches(id),
    operator_id UUID REFERENCES public.profiles(id),
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Enable RLS on new tables
ALTER TABLE public.defect_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for defect_logs
CREATE POLICY "All authenticated users can view defect logs" 
ON public.defect_logs FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create defect logs" 
ON public.defect_logs FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update defect logs" 
ON public.defect_logs FOR UPDATE 
USING (auth.role() = 'authenticated');

-- RLS Policies for production_alerts
CREATE POLICY "Users can view their alerts" 
ON public.production_alerts FOR SELECT 
USING (assigned_to = auth.uid() OR created_by = auth.uid() OR auth.role() = 'authenticated');

CREATE POLICY "Users can create alerts" 
ON public.production_alerts FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update alerts" 
ON public.production_alerts FOR UPDATE 
USING (assigned_to = auth.uid() OR created_by = auth.uid());

-- RLS Policies for shift_schedules
CREATE POLICY "All authenticated users can view shift schedules" 
ON public.shift_schedules FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage shift schedules" 
ON public.shift_schedules FOR ALL 
USING (auth.role() = 'authenticated');

-- RLS Policies for batch_assignments
CREATE POLICY "Users can view batch assignments" 
ON public.batch_assignments FOR SELECT 
USING (operator_id = auth.uid() OR auth.role() = 'authenticated');

CREATE POLICY "Users can create batch assignments" 
ON public.batch_assignments FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Operators can update their assignments" 
ON public.batch_assignments FOR UPDATE 
USING (operator_id = auth.uid() OR auth.role() = 'authenticated');

-- Create storage bucket for defect images
INSERT INTO storage.buckets (id, name, public) VALUES ('defect-images', 'defect-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for defect images
CREATE POLICY "Users can view defect images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'defect-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload defect images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'defect-images' AND auth.role() = 'authenticated');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_defect_logs_batch_id ON public.defect_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_production_alerts_assigned_to ON public.production_alerts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_production_alerts_created_at ON public.production_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_batch_assignments_operator_id ON public.batch_assignments(operator_id);
CREATE INDEX IF NOT EXISTS idx_batch_assignments_batch_id ON public.batch_assignments(batch_id);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to new tables
CREATE TRIGGER update_defect_logs_updated_at
    BEFORE UPDATE ON public.defect_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_alerts_updated_at
    BEFORE UPDATE ON public.production_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shift_schedules_updated_at
    BEFORE UPDATE ON public.shift_schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();