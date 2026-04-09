-- Criar tabela de perfis de usuários (estendendo a auth.users do Supabase)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  xp integer default 0 not null,
  level integer default 1 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Políticas de segurança para perfis
create policy "Usuários podem ver o próprio perfil" on public.profiles
  for select using (auth.uid() = id);

create policy "Usuários podem atualizar o próprio perfil" on public.profiles
  for update using (auth.uid() = id);

-- Criar um gatilho (trigger) para criar o perfil automaticamente quando o usuário se cadastrar
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, xp, level)
  values (new.id, 0, 1);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Criar tabela de disciplinas (subjects)
create table public.subjects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  color text not null,
  duration_minutes integer not null,
  weight integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subjects enable row level security;

create policy "Usuários podem gerenciar suas próprias disciplinas" on public.subjects
  for all using (auth.uid() = user_id);

-- Criar tabela de revisões (reviews)
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject_id uuid references public.subjects on delete cascade not null,
  topic text not null,
  due_date timestamp with time zone not null,
  completed boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

create policy "Usuários podem gerenciar suas próprias revisões" on public.reviews
  for all using (auth.uid() = user_id);
