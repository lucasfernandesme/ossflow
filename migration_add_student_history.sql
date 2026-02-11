-- Create student_history table
CREATE TABLE IF NOT EXISTS student_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'belt', 'stripe'
    item TEXT NOT NULL, -- 'Faixa Azul', '1º Grau'
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE student_history ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Enable read/write for authenticated users" ON student_history
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
