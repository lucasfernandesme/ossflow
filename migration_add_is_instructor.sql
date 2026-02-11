-- Run this command in your Supabase SQL Editor to add the missing column
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_instructor BOOLEAN DEFAULT false;
