-- Add gym_code column to students
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS gym_code TEXT UNIQUE;

-- Function to generate a random 6-digit code
CREATE OR REPLACE FUNCTION generate_gym_code() RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  done BOOL;
BEGIN
  done := false;
  WHILE NOT done LOOP
    new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    -- Ensure it's unique
    IF NOT EXISTS (SELECT 1 FROM public.students WHERE gym_code = new_code) THEN
      done := true;
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate code for instructors
CREATE OR REPLACE FUNCTION trigger_generate_gym_code() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_instructor = true AND (NEW.gym_code IS NULL OR NEW.gym_code = '') THEN
    NEW.gym_code := generate_gym_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generate_gym_code ON public.students;
CREATE TRIGGER tr_generate_gym_code
BEFORE INSERT OR UPDATE OF is_instructor, gym_code
ON public.students
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_gym_code();

-- Update existing instructors who don't have a code
UPDATE public.students 
SET gym_code = generate_gym_code() 
WHERE is_instructor = true AND (gym_code IS NULL OR gym_code = '');
