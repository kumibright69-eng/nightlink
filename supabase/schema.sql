create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  age int check (age >= 18),
  city text,
  country text default 'Nigeria',
  bio text,
  avatar_url text,
  is_verified boolean default false,
  is_private boolean default true,
  is_active boolean default true,
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists likes (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(sender_id, receiver_id)
);

create table if not exists matches (
  id uuid primary key default uuid_generate_v4(),
  user_one uuid not null references profiles(id) on delete cascade,
  user_two uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_one, user_two)
);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references matches(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  content text not null check (char_length(content) > 0),
  created_at timestamptz default now()
);

create table if not exists blocks (
  id uuid primary key default uuid_generate_v4(),
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(blocker_id, blocked_user_id)
);

create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  reported_user_id uuid not null references profiles(id) on delete cascade,
  reason text not null,
  notes text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  moderator_id uuid references profiles(id) on delete set null,
  moderator_notes text,
  created_at timestamptz default now()
);

create table if not exists verifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  document_url text,
  selfie_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table likes enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;
alter table blocks enable row level security;
alter table reports enable row level security;
alter table verifications enable row level security;

create policy "profiles visible to authenticated"
on profiles for select
using (auth.role() = 'authenticated');

create policy "users insert own profile"
on profiles for insert
with check (auth.uid() = id);

create policy "users update own profile or moderators update any"
on profiles for update
using (auth.uid() = id or exists (
  select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'moderator')
));

create policy "likes insert own"
on likes for insert
with check (auth.uid() = sender_id);

create policy "likes update own"
on likes for update
using (auth.uid() = sender_id);

create policy "likes view own"
on likes for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "matches select own"
on matches for select
using (auth.uid() = user_one or auth.uid() = user_two);

create policy "matches insert if member"
on matches for insert
with check (auth.uid() = user_one or auth.uid() = user_two);

create policy "messages insert into own matches"
on messages for insert
with check (
  auth.uid() = sender_id and exists (
    select 1 from matches
    where matches.id = match_id
    and (matches.user_one = auth.uid() or matches.user_two = auth.uid())
  )
);

create policy "messages view own matches"
on messages for select
using (
  exists (
    select 1 from matches
    where matches.id = match_id
    and (matches.user_one = auth.uid() or matches.user_two = auth.uid())
  )
);

create policy "blocks insert own"
on blocks for insert
with check (auth.uid() = blocker_id);

create policy "blocks update own"
on blocks for update
using (auth.uid() = blocker_id);

create policy "blocks select own"
on blocks for select
using (auth.uid() = blocker_id or auth.uid() = blocked_user_id);

create policy "reports insert own"
on reports for insert
with check (auth.uid() = reporter_id);

create policy "reports view own or admin"
on reports for select
using (
  auth.uid() = reporter_id or auth.uid() = reported_user_id or exists (
    select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'moderator')
  )
);

create policy "reports admin update"
on reports for update
using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'moderator'))
);

create policy "verification own select or admin"
on verifications for select
using (
  auth.uid() = user_id or exists (
    select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'moderator')
  )
);

create policy "verification insert own"
on verifications for insert
with check (auth.uid() = user_id);

create policy "verification admin update"
on verifications for update
using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'moderator'))
);

-- Storage setup:
-- Create a public bucket called avatars in Supabase Storage.
-- Then apply storage policies like:
-- allow authenticated users to upload to path prefix auth.uid() and read public files.

create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  provider text not null default 'paypal',
  paypal_subscription_id text unique,
  plan_name text not null default 'NightLink Premium Quarterly',
  merchant_email text not null default 'Rusty3994@gmail.com',
  status text not null default 'pending',
  currency_code text not null default 'GHS',
  amount numeric(10,2) not null default 150.00,
  interval_unit text not null default 'MONTH',
  interval_count integer not null default 3,
  trial_interval_unit text not null default 'MONTH',
  trial_interval_count integer not null default 2,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payment_events (
  id uuid primary key default uuid_generate_v4(),
  provider text not null default 'paypal',
  paypal_event_id text unique,
  event_type text not null,
  resource_id text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table subscriptions enable row level security;
alter table payment_events enable row level security;

create policy "users can view own subscriptions"
on subscriptions for select
using (auth.uid() = user_id);

create policy "service role manages subscriptions"
on subscriptions for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role manages payment events"
on payment_events for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
