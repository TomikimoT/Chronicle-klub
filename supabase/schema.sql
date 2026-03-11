-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  display_name text,
  email text,
  bio text,
  avatar_url text,
  theme_preference text default 'theme-parchment',
  custom_theme_color text,
  receive_emails boolean default true,
  updated_at timestamp with time zone
);

-- Turn on Row Level Security for profiles
alter table profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- Trigger to create a profile automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a table for TTRPG Events
create table events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  game_system text not null, -- e.g., 'D&D', 'Dračí hlídka', 'Shadowrun', 'Other'
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  location text,
  notes text,
  url text,
  creator_id uuid references public.profiles(id) on delete restrict not null,
  participants uuid[] default '{}'::uuid[], -- Registered user IDs
  guests text[] default '{}'::text[], -- Non-registered guest names
  created_at timestamp with time zone default now()
);

-- Turn on Row Level Security for events
alter table events enable row level security;

-- Policies for events
create policy "Events are viewable by everyone." on events
  for select using (true);

create policy "Authenticated users can create events." on events
  for insert with check (auth.uid() = creator_id);

create policy "Users can update their own events." on events
  for update using (auth.uid() = creator_id);

create policy "Users can delete their own events." on events
  for delete using (auth.uid() = creator_id);

-- Storage bucket for avatars (Note: Ensure Storage is enabled in your project settings first)
-- You can create the bucket manually via the Supabase Dashboard UI -> Storage -> "avatars" (make it Public)
-- 
-- insert into storage.buckets (id, name, public) 
-- values ('avatars', 'avatars', true)
-- on conflict do nothing;

-- Storage bucket policies (Note: These might fail if Storage isn't initialized on your new project)
-- If they fail, comment these out and set them up manually in the Supabase Dashboard -> Storage
-- create policy "Avatar images are publicly accessible." on storage.objects
--   for select using (bucket_id = 'avatars');

-- create policy "Users can upload their own avatars." on storage.objects
--   for insert with check (bucket_id = 'avatars' and auth.uid() = owner);

-- create policy "Users can update their own avatars." on storage.objects
--   for update using (bucket_id = 'avatars' and auth.uid() = owner);

-- create policy "Users can delete their own avatars." on storage.objects
--   for delete using (bucket_id = 'avatars' and auth.uid() = owner);
