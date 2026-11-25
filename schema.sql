create table tickets (
  id bigint generated always as identity primary key,
  code text unique not null,
  session_id text not null,
  name text not null,
  email text not null,
  created_at timestamptz default now(),
  used_at timestamptz
);
-- No public access: only the server (service key) can read or write.
alter table tickets enable row level security;
