-- Allow students to be read by unauthenticated users (specifically for the registration dropdown)
-- We only want to expose instructors to unauthenticated users.
DROP POLICY IF EXISTS "Allow unauthenticated to view instructors" ON public.students;
CREATE POLICY "Allow unauthenticated to view instructors" ON public.students
FOR SELECT
USING (is_instructor = true);

-- Allow students to insert their own record after signing up
-- 'user_id' in ossflow seems to be the creator/instructor ID. 
-- 'auth_user_id' is the ID in auth.users.
DROP POLICY IF EXISTS "Allow individual student registration" ON public.students;
CREATE POLICY "Allow individual student registration" ON public.students
FOR INSERT
WITH CHECK (auth.uid() = auth_user_id);
