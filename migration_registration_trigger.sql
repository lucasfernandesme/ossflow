-- Trigger function to handle new auth user and create student record + notification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_phone TEXT;
  v_role TEXT;
  v_trainer_id UUID;
BEGIN
  -- Extract metadata
  v_name := (NEW.raw_user_meta_data->>'name');
  v_phone := (NEW.raw_user_meta_data->>'phone');
  v_role := (NEW.raw_user_meta_data->>'role');
  v_trainer_id := (NEW.raw_user_meta_data->>'trainer_id')::UUID;

  -- Create student record
  INSERT INTO public.students (
    auth_user_id,
    name,
    phone,
    is_instructor,
    user_id -- instructor/trainer ID in this schema
  ) VALUES (
    NEW.id,
    v_name,
    v_phone,
    (v_role = 'instructor'),
    v_trainer_id
  );

  -- Notify instructor if a student registered
  IF v_role = 'student' AND v_trainer_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      user_role,
      title,
      body,
      is_read,
      created_at
    ) VALUES (
      v_trainer_id,
      'TRAINER',
      'Novo Aluno Cadastrado',
      v_name || ' acabou de se cadastrar usando seu código.',
      false,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
