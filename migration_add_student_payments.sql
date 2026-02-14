-- Create student_payments table if it doesn't exist
create table if not exists public.student_payments (
    id uuid not null default gen_random_uuid(),
    student_id uuid references public.students(id) on delete set null, -- Changed to set null and nullable
    user_id uuid references auth.users(id) not null default auth.uid(), -- Added user_id
    month integer not null,
    year integer not null,
    amount decimal(10,2) not null,
    status text not null check (status in ('paid', 'pending', 'late')),
    paid_at timestamptz,
    created_at timestamptz default now(),
    type text not null default 'revenue' check (type in ('revenue', 'expense')),
    category text,
    description text,
    proof_url text,
    proof_date timestamptz,
    
    primary key (id)
);

-- RLS Policies
alter table public.student_payments enable row level security;

-- Policy: Users can only see/edit their own payments (linked via user_id)
create policy "Users can view their own financial records"
on public.student_payments for select
to authenticated
using (
    user_id = auth.uid()
);

create policy "Users can insert their own financial records"
on public.student_payments for insert
to authenticated
with check (
    user_id = auth.uid()
);

create policy "Users can update their own financial records"
on public.student_payments for update
to authenticated
using (
    user_id = auth.uid()
);

create policy "Users can delete their own financial records"
on public.student_payments for delete
to authenticated
using (
    user_id = auth.uid()
);
