-- Update function to generate a random 6-character alphanumeric code
CREATE OR REPLACE FUNCTION generate_gym_code() RETURNS TEXT AS $$
DECLARE
  chars TEXT := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  new_code TEXT := '';
  i INTEGER := 0;
  done BOOL;
BEGIN
  done := false;
  WHILE NOT done LOOP
    new_code := '';
    FOR i IN 1..6 LOOP
      new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    -- Ensure it's unique
    IF NOT EXISTS (SELECT 1 FROM public.students WHERE gym_code = new_code) THEN
      done := true;
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Re-generate codes for existing instructors to be alphanumeric
UPDATE public.students 
SET gym_code = generate_gym_code() 
WHERE is_instructor = true;
