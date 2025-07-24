-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'super-secret-jwt-token-with-at-least-32-characters-long';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles_it_onboard (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin', 'tech')),
  onboarding_status TEXT DEFAULT 'not_started' CHECK (onboarding_status IN ('not_started', 'in_progress', 'documents_pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_details table
CREATE TABLE IF NOT EXISTS client_details_it_onboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles_it_onboard(id) ON DELETE CASCADE,
  company_name TEXT,
  industry TEXT,
  company_size TEXT,
  phone TEXT,
  current_provider TEXT,
  selected_services JSONB DEFAULT '[]',
  technical_assessment JSONB DEFAULT '{}',
  timeline JSONB DEFAULT '{}',
  contract_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents_it_onboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles_it_onboard(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT NOT NULL,
  document_type TEXT DEFAULT 'other' CHECK (document_type IN ('contract', 'invoice', 'assessment', 'network_diagram', 'id_verification', 'other')),
  uploaded_by UUID REFERENCES profiles_it_onboard(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_notes table
CREATE TABLE IF NOT EXISTS client_notes_it_onboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles_it_onboard(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_by UUID REFERENCES profiles_it_onboard(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tech_assignments table
CREATE TABLE IF NOT EXISTS tech_assignments_it_onboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles_it_onboard(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles_it_onboard(id),
  task_name TEXT NOT NULL,
  task_description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles_it_onboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_details_it_onboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents_it_onboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes_it_onboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_assignments_it_onboard ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles_it_onboard
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles_it_onboard
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles_it_onboard
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles_it_onboard 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles_it_onboard
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles_it_onboard 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow profile creation" ON profiles_it_onboard
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Client details policies
CREATE POLICY "Clients can view own details" ON client_details_it_onboard
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Clients can update own details" ON client_details_it_onboard
  FOR UPDATE USING (client_id = auth.uid());

CREATE POLICY "Clients can insert own details" ON client_details_it_onboard
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Admins and techs can view all client details" ON client_details_it_onboard
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles_it_onboard 
      WHERE id = auth.uid() AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Admins can update all client details" ON client_details_it_onboard
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles_it_onboard 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents_it_onboard
  FOR SELECT USING (
    client_id = auth.uid() OR 
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles_it_onboard 
      WHERE id = auth.uid() AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Users can upload documents" ON documents_it_onboard
  FOR INSERT WITH CHECK (
    client_id = auth.uid() OR 
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles_it_onboard 
      WHERE id = auth.uid() AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Users can delete own documents" ON documents_it_onboard
  FOR DELETE USING (
    uploaded_by = auth.uid() OR
    (client_id = auth.uid() AND uploaded_by = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles_it_onboard 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Client notes policies
CREATE POLICY "View client notes" ON client_notes_it_onboard
  FOR SELECT USING (
    client_id = auth.uid() OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles_it_onboard 
      WHERE id = auth.uid() AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Create client notes" ON client_notes_it_onboard
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles_it_onboard 
      WHERE id = auth.uid() AND role IN ('admin', 'tech')
    )
  );

-- Tech assignments policies
CREATE POLICY "View assignments" ON tech_assignments_it_onboard
  FOR SELECT USING (
    assigned_to = auth.uid() OR
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles_it_onboard 
      WHERE id = auth.uid() AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Admins can manage assignments" ON tech_assignments_it_onboard
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles_it_onboard 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Techs can update assigned tasks" ON tech_assignments_it_onboard
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles_it_onboard 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('client_documents', 'client_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'client_documents' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM profiles_it_onboard 
        WHERE id = auth.uid() AND role IN ('admin', 'tech')
      )
    )
  );

CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'client_documents' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM profiles_it_onboard 
        WHERE id = auth.uid() AND role IN ('admin', 'tech')
      )
    )
  );

CREATE POLICY "Users can delete their own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'client_documents' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM profiles_it_onboard 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles_it_onboard (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample admin user (you should change this)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'admin@techsolutions.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"role": "admin", "full_name": "System Administrator"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Insert sample tech user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'tech@techsolutions.com',
  crypt('tech123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"role": "tech", "full_name": "Technical Specialist"}'::jsonb
) ON CONFLICT (email) DO NOTHING;