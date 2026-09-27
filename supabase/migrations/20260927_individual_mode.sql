-- Individual mode is isolated from the existing team rooms and policies.
create table if not exists public.individual_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[0-9]{6}$'),
  host_user_id uuid not null,
  phase text not null default 'lobby' check (phase in ('lobby','spin','question','result','finished')),
  round_no integer not null default 1,
  total_rounds integer not null default 8,
  turn_index integer not null default 0,
  question_id text,
  question_options text[] not null default '{}',
  category text,
  opened_at timestamptz,
  deadline timestamptz,
  used_question_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.individual_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.individual_rooms(id) on delete cascade,
  user_id uuid not null,
  display_name text not null check (char_length(display_name) between 1 and 24),
  avatar text not null,
  seat integer not null,
  score integer not null default 0,
  joined_at timestamptz not null default now(),
  unique(room_id,user_id),
  unique(room_id,seat)
);

create table if not exists public.individual_answers (
  room_id uuid not null references public.individual_rooms(id) on delete cascade,
  round_no integer not null,
  user_id uuid not null,
  is_correct boolean not null,
  points integer not null,
  answered_at timestamptz not null,
  primary key(room_id,round_no,user_id)
);

alter table public.individual_rooms enable row level security;
alter table public.individual_players enable row level security;
alter table public.individual_answers enable row level security;
revoke all on public.individual_rooms,public.individual_players,public.individual_answers from anon,authenticated;
grant all on public.individual_rooms,public.individual_players,public.individual_answers to service_role;

-- Called only by the authenticated Edge Function using its service-role client.
-- Locking the room makes simultaneous submissions and score updates atomic.
create or replace function public.individual_submit_answer(
  p_room_id uuid, p_user_id uuid, p_answer text
) returns table(is_correct boolean, awarded_points integer)
language plpgsql security invoker set search_path = public
as $$
declare
  r public.individual_rooms%rowtype;
  q record;
  player_id uuid;
  normalized text;
  accepted text[];
  correct boolean;
  awarded integer;
  now_at timestamptz := clock_timestamp();
  elapsed_ms numeric;
begin
  select * into r from public.individual_rooms where id=p_room_id for update;
  if r.id is null or r.phase <> 'question' or r.opened_at > now_at or r.deadline <= now_at then
    raise exception 'question_closed';
  end if;
  select id into player_id from public.individual_players where room_id=p_room_id and user_id=p_user_id;
  if player_id is null then raise exception 'not_a_player'; end if;
  if exists(select 1 from public.individual_answers where room_id=p_room_id and round_no=r.round_no and user_id=p_user_id) then
    raise exception 'already_answered';
  end if;
  select correct_answer,accepted_answers into q from public.question_bank where id=r.question_id and active=true;
  if not found then raise exception 'question_missing'; end if;
  normalized := lower(trim(regexp_replace(coalesce(p_answer,''),'[[:space:]]+',' ','g')));
  accepted := array[lower(trim(regexp_replace(q.correct_answer,'[[:space:]]+',' ','g')))];
  if q.accepted_answers is not null then
    accepted := accepted || array(select lower(trim(regexp_replace(v.answer,'[[:space:]]+',' ','g')))
      from jsonb_array_elements_text(to_jsonb(q.accepted_answers)) as v(answer));
  end if;
  correct := normalized = any(accepted);
  elapsed_ms := greatest(0,extract(epoch from (now_at-r.opened_at))*1000);
  awarded := case when correct then greatest(200,600-floor(400*least(30000,elapsed_ms)/30000)::integer) else 0 end;
  insert into public.individual_answers(room_id,round_no,user_id,is_correct,points,answered_at)
    values(p_room_id,r.round_no,p_user_id,correct,awarded,now_at);
  if awarded>0 then
    update public.individual_players set score=score+awarded where id=player_id;
  end if;
  if (select count(*) from public.individual_answers where room_id=p_room_id and round_no=r.round_no) >=
     (select count(*) from public.individual_players where room_id=p_room_id) then
    update public.individual_rooms set phase='result' where id=p_room_id;
  end if;
  return query select correct,awarded;
end;
$$;
revoke all on function public.individual_submit_answer(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.individual_submit_answer(uuid,uuid,text) to service_role;
