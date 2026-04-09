-- Criar tabela de histórico de estudos para análises/gráficos
create table public.study_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject_id uuid references public.subjects on delete cascade not null,
  duration_minutes integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.study_history enable row level security;

create policy "Usuários podem ver seu próprio histórico" on public.study_history
  for select using (auth.uid() = user_id);

create policy "Usuários podem inserir seu próprio histórico" on public.study_history
  for insert with check (auth.uid() = user_id);