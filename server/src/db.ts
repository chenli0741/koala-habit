import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { Pool } from "pg";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });
config();

type ParentInput = {
  email: string;
  name: string;
  password?: string;
  provider: string;
};

type ChildInput = {
  age: number;
  avatarUri?: string;
  grade: number;
  name: string;
  pin: string;
};

type FamilyInput = {
  familyId: string;
  language: string;
  name: string;
  timeZone: string;
};

export type MissionInput = {
  attachments?: PlanAttachmentInput[];
  category: string;
  childId: string;
  detail: string;
  energy: number;
  goals: string[];
  icon: string;
  occurrenceDate?: string;
  progress: number;
  repeatRule?: string;
  rewardMinutes: number;
  scheduledTime?: string;
  source?: string;
  status: "cancelled" | "done" | "todo" | "in_progress" | "expired";
  target: string;
  targetApp?: string;
  timeLimitMinutes?: number;
  title: string;
  tone: string;
  total: number;
};

export type MissionLayoutInput = {
  id: string;
  layoutColumn: "primary" | "secondary";
  layoutOrder: number;
};

export type MissionTimerEventInput = {
  elapsedSeconds?: number;
  eventType: "timer_start" | "timer_pause" | "timer_resume" | "timer_end";
  remainingSeconds?: number;
};

export type StartTaskRunInput = {
  endAt: string;
  notificationId?: string;
  plannedDurationMinutes: number;
  startAt: string;
  targetApp?: string;
};

export type FinishTaskRunInput = {
  actualDurationMinutes: number;
  completedAt: string;
  overdue: boolean;
  overdueMinutes: number;
};

export type PauseTaskRunInput = {
  actualDurationMinutes: number;
  overdue: boolean;
  overdueMinutes: number;
  pausedAt: string;
};

export type ResumeTaskRunInput = {
  endAt: string;
  notificationId?: string;
  resumedAt: string;
};

type TaskEventType =
  | "created"
  | "updated"
  | "status_change"
  | "timer_start"
  | "timer_pause"
  | "timer_resume"
  | "timer_end"
  | "completion"
  | "cancelled"
  | "attachment_added";

type OccurrenceStatus = "pending" | "done" | "skipped" | "expired";

type MissionRange = {
  endDate: string;
  startDate: string;
};

export type PlanAttachmentInput = {
  id: string;
  mimeType?: string;
  name: string;
  size?: number;
  uri: string;
};

export type TaskTemplateInput = {
  active?: boolean;
  category: string;
  childId: string;
  energy: number;
  goals: string[];
  icon: string;
  repeatRule: string;
  rewardMinutes: number;
  scheduledTime?: string;
  source?: string;
  target: string;
  targetApp?: string;
  timeLimitMinutes?: number;
  title: string;
  tone: string;
  total: number;
};

const connectionString = normalizeConnectionString(process.env.DATABASE_URL);

export const dbEnabled = Boolean(connectionString);

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    })
  : null;

pool?.on("error", (error) => {
  console.warn("Idle database connection error.", error);
});

export async function initDb() {
  if (!pool) {
    return;
  }

  await withDbRetry(() =>
    pool!.query(`
      create table if not exists families (
        id text primary key,
        name text not null,
        time_zone text not null default 'America/Los_Angeles',
        language text not null default 'English',
        created_at timestamptz not null default now()
      );

    alter table families add column if not exists time_zone text not null default 'America/Los_Angeles';
    alter table families add column if not exists language text not null default 'English';
    alter table families add column if not exists updated_at timestamptz not null default now();

    create table if not exists parents (
      id text primary key,
      family_id text not null references families(id) on delete cascade,
      name text not null,
      email text not null unique,
      provider text not null,
      password_hash text,
      created_at timestamptz not null default now()
    );

    alter table parents add column if not exists password_hash text;
    alter table parents add column if not exists updated_at timestamptz not null default now();

    create table if not exists children (
      id text primary key,
      family_id text not null references families(id) on delete cascade,
      name text not null,
      age integer not null default 9,
      grade integer not null default 0,
      pin text not null,
      companion_name text not null default 'Koko',
      companion_level integer not null default 1,
      companion_growth integer not null default 0,
      created_at timestamptz not null default now()
    );

    alter table children add column if not exists avatar_uri text;

    create table if not exists missions (
      id text primary key,
      child_id text not null references children(id) on delete cascade,
      title text not null,
      category text not null,
      target text not null,
      reward_minutes integer not null default 10,
      energy integer not null default 10,
      status text not null default 'todo',
      created_at timestamptz not null default now()
    );

    alter table missions add column if not exists icon text not null default '📌';
    alter table missions add column if not exists detail text not null default '';
    alter table missions add column if not exists goals jsonb not null default '[]'::jsonb;
    alter table missions add column if not exists progress integer not null default 0;
    alter table missions add column if not exists total integer not null default 1;
    alter table missions add column if not exists tone text not null default '#3F7D58';
    alter table missions add column if not exists updated_at timestamptz not null default now();

    create table if not exists task_runs (
      id text primary key,
      mission_id text not null references missions(id) on delete cascade,
      child_id text not null references children(id) on delete cascade,
      status text not null,
      progress integer not null,
      note text,
      photo_uri text,
      audio_uri text,
      created_at timestamptz not null default now()
    );

    alter table task_runs add column if not exists photo_uri text;
    alter table task_runs add column if not exists audio_uri text;

    create table if not exists task_templates (
      id text primary key,
      child_id text not null references children(id) on delete cascade,
      icon text not null default '📌',
      title text not null,
      category text not null,
      default_target text not null,
      default_goals jsonb not null default '[]'::jsonb,
      default_reward_minutes integer not null default 10,
      default_energy integer not null default 10,
      default_total integer not null default 1,
      tone text not null default '#3F7D58',
      rrule text not null default 'FREQ=DAILY',
      default_assessment text not null default 'parent_confirmation',
      active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    alter table task_templates add column if not exists default_scheduled_time text;
    alter table task_templates add column if not exists default_time_limit_minutes integer;
    alter table task_templates add column if not exists default_target_app text;
    alter table task_templates add column if not exists default_source text not null default 'parent';

    create table if not exists task_occurrences (
      id text primary key,
      template_id text not null references task_templates(id) on delete cascade,
      child_id text not null references children(id) on delete cascade,
      occurrence_date date not null,
      title text not null,
      target text not null,
      scheduled_time text,
      time_limit_minutes integer,
      status text not null default 'pending',
      actual_start_at timestamptz,
      actual_end_at timestamptz,
      is_makeup boolean not null default false,
      is_overdue boolean not null default false,
      progress integer not null default 0,
      total integer not null default 1,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (template_id, occurrence_date)
    );

    alter table task_occurrences add column if not exists time_limit_minutes integer;
    alter table task_occurrences add column if not exists target_app text;
    alter table task_occurrences add column if not exists source text not null default 'parent';
    alter table task_occurrences add column if not exists actual_start_at timestamptz;
    alter table task_occurrences add column if not exists actual_end_at timestamptz;
    alter table task_occurrences add column if not exists layout_column text;
    alter table task_occurrences add column if not exists layout_order integer;

    create table if not exists task_occurrence_layouts (
      mission_id text primary key,
      child_id text not null references children(id) on delete cascade,
      occurrence_date date not null,
      layout_column text not null,
      layout_order integer not null,
      updated_at timestamptz not null default now()
    );

    create table if not exists task_plan_details (
      id text primary key,
      occurrence_id text not null unique references task_occurrences(id) on delete cascade,
      summary text not null,
      goals jsonb not null default '[]'::jsonb,
      attachments jsonb not null default '[]'::jsonb,
      materials jsonb not null default '[]'::jsonb,
      vocabulary jsonb not null default '[]'::jsonb,
      notes text not null default '',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    alter table task_plan_details add column if not exists attachments jsonb not null default '[]'::jsonb;

    create table if not exists completion_records (
      id text primary key,
      occurrence_id text not null references task_occurrences(id) on delete cascade,
      child_id text not null references children(id) on delete cascade,
      completed_at timestamptz not null default now(),
      actual_minutes integer,
      completed_quantity integer,
      parent_confirmed boolean not null default false,
      child_reflection text,
      ai_score integer,
      ai_feedback text,
      note text,
      photo_uri text,
      audio_uri text
    );

    create table if not exists task_execution_records (
      id text primary key,
      occurrence_id text not null references task_occurrences(id) on delete cascade,
      child_id text not null references children(id) on delete cascade,
      occurrence_date date not null,
      status text not null,
      created_at timestamptz not null default now(),
      unique (occurrence_id, status)
    );

    create table if not exists task_timer_events (
      id text primary key,
      occurrence_id text not null references task_occurrences(id) on delete cascade,
      child_id text not null references children(id) on delete cascade,
      event_type text not null,
      remaining_seconds integer,
      recorded_at timestamptz not null default now()
    );

    create table if not exists task_events (
      id text primary key,
      occurrence_id text not null references task_occurrences(id) on delete cascade,
      child_id text not null references children(id) on delete cascade,
      event_type text not null,
      title text not null,
      content text not null,
      metadata jsonb not null default '{}'::jsonb,
      recorded_at timestamptz not null default now()
    );

    create table if not exists task_app_runs (
      id text primary key,
      occurrence_id text not null references task_occurrences(id) on delete cascade,
      child_id text not null references children(id) on delete cascade,
      target_app text,
      planned_duration_minutes integer not null,
      start_at timestamptz not null,
      end_at timestamptz not null,
      completed_at timestamptz,
      actual_duration_minutes integer,
      overdue boolean,
      overdue_minutes integer,
      notification_id text,
      status text not null default 'running',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists reward_records (
      id text primary key,
      child_id text not null references children(id) on delete cascade,
      occurrence_id text references task_occurrences(id) on delete set null,
      source text not null,
      reason text not null,
      points integer not null default 0,
      minutes integer not null default 0,
      multiplier numeric not null default 1,
      created_at timestamptz not null default now()
    );
    `)
  );

  try {
    await withDbRetry(seedDefaultData);
  } catch (error) {
    console.warn("Skipping demo seed data after database connection errors.", error);
  }
}

export async function upsertFamilyWithParent(input: ParentInput) {
  assertPool();

  const familyId = familyIdForEmail(input.email);
  const parentId = `parent-${slugify(input.email)}`;

  await pool!.query(
    `
      insert into families (id, name)
      values ($1, $2)
      on conflict (id) do update set name = excluded.name
    `,
    [familyId, "Koala Family"]
  );

  await pool!.query(
    `
      insert into parents (id, family_id, name, email, provider)
      values ($1, $2, $3, $4, $5)
      on conflict (email) do update
      set name = excluded.name,
          provider = excluded.provider,
          updated_at = now()
    `,
    [parentId, familyId, input.name, input.email, input.provider]
  );

  return getFamily(familyId);
}

export async function registerParent(input: ParentInput) {
  assertPool();

  const familyId = familyIdForEmail(input.email);
  const parentId = `parent-${slugify(input.email)}`;
  const passwordHash = input.password ? hashPassword(input.password) : null;

  await pool!.query(
    `
      insert into families (id, name)
      values ($1, $2)
      on conflict (id) do update set name = excluded.name
    `,
    [familyId, "Koala Family"]
  );

  await pool!.query(
    `
      insert into parents (id, family_id, name, email, provider, password_hash)
      values ($1, $2, $3, $4, $5, $6)
      on conflict (email) do update
      set name = excluded.name,
          provider = excluded.provider,
          password_hash = coalesce(excluded.password_hash, parents.password_hash),
          updated_at = now()
    `,
    [parentId, familyId, input.name, input.email, input.provider, passwordHash]
  );

  return getFamily(familyId);
}

export async function updateFamily(input: FamilyInput) {
  assertPool();

  const result = await pool!.query(
    `
      update families
      set name = $2,
          time_zone = $3,
          language = $4,
          updated_at = now()
      where id = $1
      returning id
    `,
    [input.familyId, input.name, input.timeZone, input.language]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return getFamily(input.familyId);
}

export async function loginParent(email: string, password: string) {
  assertPool();

  const result = await pool!.query(
    `
      select family_id
      from parents
      where email = $1
        and password_hash = $2
      limit 1
    `,
    [email, hashPassword(password)]
  );

  const parent = result.rows[0] as { family_id: string } | undefined;
  return parent ? getFamily(parent.family_id) : null;
}

export async function getFamily(familyId = "family-demo") {
  assertPool();

  const familyResult = await pool!.query("select id, name, time_zone, language from families where id = $1", [familyId]);
  const family = familyResult.rows[0] as { id: string; language: string; name: string; time_zone: string } | undefined;

  if (!family) {
    return null;
  }

  const parentResult = await pool!.query(
    "select id, name, email, provider from parents where family_id = $1 order by updated_at desc, created_at desc limit 1",
    [familyId]
  );
  const children = await getChildren(familyId);

  return {
    ...family,
    timeZone: family.time_zone,
    parent: parentResult.rows[0] ?? null,
    children
  };
}

export async function getChildren(familyId = "family-demo") {
  assertPool();

  const result = await pool!.query(
    `
      select id, name, age, grade, length(pin) as pin_length, companion_name, companion_level, companion_growth
        , avatar_uri
      from children
      where family_id = $1
      order by created_at asc
    `,
    [familyId]
  );

  return result.rows.map(mapChild);
}

export async function createChild(input: ChildInput, familyId = "family-demo") {
  assertPool();

  await pool!.query(
    `
      insert into families (id, name)
      values ($1, $2)
      on conflict (id) do nothing
    `,
    [familyId, "Koala Family"]
  );

  const childId = await uniqueId("children", slugify(input.name));

  const result = await pool!.query(
    `
      insert into children (id, family_id, name, age, grade, pin, avatar_uri)
      values ($1, $2, $3, $4, $5, $6, $7)
      returning id, name, age, grade, length(pin) as pin_length, companion_name, companion_level, companion_growth, avatar_uri
    `,
    [childId, familyId, input.name, input.age, input.grade, input.pin, input.avatarUri ?? null]
  );

  return mapChild(result.rows[0]);
}

export async function updateChild(childId: string, input: Partial<ChildInput>, familyId = "family-demo") {
  assertPool();

  const current = await pool!.query(
    `
      select id, name, age, grade, pin, avatar_uri
      from children
      where id = $1 and family_id = $2
    `,
    [childId, familyId]
  );
  const row = current.rows[0];

  if (!row) {
    return null;
  }

  const nextName = input.name ?? String(row.name);
  const nextAge = input.age ?? Number(row.age);
  const nextGrade = input.grade ?? Number(row.grade);
  const nextPin = input.pin ?? String(row.pin);
  const nextAvatarUri = input.avatarUri ?? (row.avatar_uri ? String(row.avatar_uri) : null);
  const result = await pool!.query(
    `
      update children
      set name = $1,
          age = $2,
          grade = $3,
          pin = $4,
          avatar_uri = $5
      where id = $6 and family_id = $7
      returning id, name, age, grade, length(pin) as pin_length, companion_name, companion_level, companion_growth, avatar_uri
    `,
    [nextName, nextAge, nextGrade, nextPin, nextAvatarUri, childId, familyId]
  );

  return mapChild(result.rows[0]);
}

export async function findChildByPin(childId: string, pin: string) {
  assertPool();

  const result = await pool!.query(
    `
      select id, name, age, grade, length(pin) as pin_length, companion_name, companion_level, companion_growth, avatar_uri
      from children
      where id = $1 and pin = $2
    `,
    [childId, pin]
  );

  return result.rows[0] ? mapChild(result.rows[0]) : null;
}

export async function getToday(childId: string) {
  assertPool();

  const childResult = await pool!.query(
    "select id, name, age, companion_name, companion_level, companion_growth from children where id = $1",
    [childId]
  );
  const childRow = childResult.rows[0];

  if (!childRow) {
    return null;
  }

  await ensureTodayOccurrences(childId);

  const missionsResult = await pool!.query(
    `
      select
        occurrence.id,
        occurrence.child_id,
        occurrence.template_id,
        occurrence.occurrence_date,
        occurrence.scheduled_time,
        occurrence.time_limit_minutes,
        coalesce(template.default_target_app, occurrence.target_app) as target_app,
        coalesce(occurrence.source, template.default_source, 'parent') as source,
        occurrence.actual_start_at,
        occurrence.actual_end_at,
        coalesce(layout.layout_column, occurrence.layout_column) as layout_column,
        coalesce(layout.layout_order, occurrence.layout_order) as layout_order,
        template.icon,
        occurrence.title,
        template.category,
        template.rrule,
        occurrence.target,
        plan.summary as detail,
        plan.id as plan_detail_id,
        plan.summary as plan_summary,
        plan.goals,
        plan.attachments,
        plan.materials,
        plan.vocabulary,
        plan.notes,
        template.default_reward_minutes as reward_minutes,
        template.default_energy as energy,
        occurrence.progress,
        occurrence.total,
        occurrence.status as occurrence_status,
        template.tone,
        completion.completed_at,
        completion.actual_minutes,
        completion.parent_confirmed,
        completion.ai_score,
        active_run.record as active_run,
        coalesce(rewards.records, '[]'::jsonb) as reward_records,
        coalesce(task_events.records, '[]'::jsonb) as event_records
      from task_occurrences occurrence
      join task_templates template on template.id = occurrence.template_id
      left join task_occurrence_layouts layout on layout.mission_id = occurrence.id
      left join task_plan_details plan on plan.occurrence_id = occurrence.id
      left join lateral (
        select completed_at, actual_minutes, parent_confirmed, ai_score
        from completion_records
        where occurrence_id = occurrence.id
        order by completed_at desc
        limit 1
      ) completion on true
      left join lateral (
        select jsonb_build_object(
          'id', id,
          'status', status,
          'targetApp', target_app,
          'plannedDurationMinutes', planned_duration_minutes,
          'startAt', start_at,
          'endAt', end_at,
          'completedAt', completed_at,
          'actualDurationMinutes', actual_duration_minutes,
          'overdue', overdue,
          'overdueMinutes', overdue_minutes,
          'notificationId', notification_id
        ) as record
        from task_app_runs
        where occurrence_id = occurrence.id
          and status in ('running', 'paused')
        order by start_at desc
        limit 1
      ) active_run on true
      left join lateral (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'points', points,
            'reason', reason,
            'source', source
          )
          order by created_at asc
        ) as records
        from reward_records
        where occurrence_id = occurrence.id
      ) rewards on true
      left join lateral (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'eventType', event_type,
            'title', title,
            'content', content,
            'recordedAt', recorded_at,
            'metadata', metadata
          )
          order by recorded_at asc
        ) as records
        from task_events
        where occurrence_id = occurrence.id
      ) task_events on true
      where occurrence.child_id = $1
        and occurrence.occurrence_date = current_date
      order by
        coalesce(layout.layout_column, occurrence.layout_column) asc nulls last,
        coalesce(layout.layout_order, occurrence.layout_order) asc nulls last,
        occurrence.scheduled_time asc nulls last,
        occurrence.created_at asc
    `,
    [childId]
  );

  return {
    child: {
      id: childRow.id,
      name: childRow.name,
      age: childRow.age,
      companion: {
        name: childRow.companion_name,
        level: childRow.companion_level,
        growth: childRow.companion_growth
      }
    },
    missions: missionsResult.rows.map(mapMission),
    rewards: {
      entertainmentMinutesUnlocked: 25,
      pendingParentConfirmations: 1,
      streakDays: 5
    }
  };
}

export async function getMissionsForChild(childId: string, range?: MissionRange) {
  assertPool();

  if (!range) {
    await ensureTodayOccurrences(childId);
  } else {
    await ensureExpiredExecutions(childId, range);
  }

  const result = await pool!.query(
    `
      select
        occurrence.id,
        occurrence.child_id,
        occurrence.template_id,
        occurrence.occurrence_date,
        occurrence.scheduled_time,
        occurrence.time_limit_minutes,
        coalesce(template.default_target_app, occurrence.target_app) as target_app,
        coalesce(occurrence.source, template.default_source, 'parent') as source,
        occurrence.actual_start_at,
        occurrence.actual_end_at,
        coalesce(layout.layout_column, occurrence.layout_column) as layout_column,
        coalesce(layout.layout_order, occurrence.layout_order) as layout_order,
        template.icon,
        occurrence.title,
        template.category,
        template.rrule,
        occurrence.target,
        plan.summary as detail,
        plan.id as plan_detail_id,
        plan.summary as plan_summary,
        plan.goals,
        plan.attachments,
        plan.materials,
        plan.vocabulary,
        plan.notes,
        template.default_reward_minutes as reward_minutes,
        template.default_energy as energy,
        occurrence.progress,
        occurrence.total,
        occurrence.status as occurrence_status,
        template.tone,
        completion.completed_at,
        completion.actual_minutes,
        completion.parent_confirmed,
        completion.ai_score,
        active_run.record as active_run,
        coalesce(rewards.records, '[]'::jsonb) as reward_records,
        coalesce(task_events.records, '[]'::jsonb) as event_records
      from task_occurrences occurrence
      join task_templates template on template.id = occurrence.template_id
      left join task_occurrence_layouts layout on layout.mission_id = occurrence.id
      left join task_plan_details plan on plan.occurrence_id = occurrence.id
      left join lateral (
        select completed_at, actual_minutes, parent_confirmed, ai_score
        from completion_records
        where occurrence_id = occurrence.id
        order by completed_at desc
        limit 1
      ) completion on true
      left join lateral (
        select jsonb_build_object(
          'id', id,
          'status', status,
          'targetApp', target_app,
          'plannedDurationMinutes', planned_duration_minutes,
          'startAt', start_at,
          'endAt', end_at,
          'completedAt', completed_at,
          'actualDurationMinutes', actual_duration_minutes,
          'overdue', overdue,
          'overdueMinutes', overdue_minutes,
          'notificationId', notification_id
        ) as record
        from task_app_runs
        where occurrence_id = occurrence.id
          and status in ('running', 'paused')
        order by start_at desc
        limit 1
      ) active_run on true
      left join lateral (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'points', points,
            'reason', reason,
            'source', source
          )
          order by created_at asc
        ) as records
        from reward_records
        where occurrence_id = occurrence.id
      ) rewards on true
      left join lateral (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'eventType', event_type,
            'title', title,
            'content', content,
            'recordedAt', recorded_at,
            'metadata', metadata
          )
          order by recorded_at asc
        ) as records
        from task_events
        where occurrence_id = occurrence.id
      ) task_events on true
      where occurrence.child_id = $1
        and ($2::date is null or occurrence.occurrence_date >= $2::date)
        and ($3::date is null or occurrence.occurrence_date <= $3::date)
      order by
        occurrence.occurrence_date asc,
        coalesce(layout.layout_column, occurrence.layout_column) asc nulls last,
        coalesce(layout.layout_order, occurrence.layout_order) asc nulls last,
        occurrence.scheduled_time asc nulls last,
        occurrence.created_at asc
    `,
    [childId, range?.startDate ?? null, range?.endDate ?? null]
  );

  if (!range) {
    return result.rows.map(mapMission);
  }

  return resolveMissionOccurrences(childId, range, result.rows);
}

export async function getTaskTemplatesForChild(childId: string) {
  assertPool();

  const result = await pool!.query(
    `
      select
        id,
        child_id,
        icon,
        title,
        category,
        default_target,
        default_goals,
        default_reward_minutes,
        default_energy,
        default_total,
        default_time_limit_minutes,
        default_target_app,
        default_source,
        tone,
        rrule,
        default_scheduled_time,
        active
      from task_templates
      where child_id = $1
      order by active desc, title asc
    `,
    [childId]
  );

  return result.rows.map(mapTaskTemplate);
}

export async function createTaskTemplate(input: TaskTemplateInput) {
  assertPool();

  const templateId = await uniqueId("task_templates", `template-${slugify(input.title)}`);

  await pool!.query(
    `
      insert into task_templates (
        id, child_id, icon, title, category, default_target, default_goals,
        default_reward_minutes, default_energy, default_total, tone, rrule,
        default_scheduled_time, default_time_limit_minutes, default_target_app, default_source, active
      )
      values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `,
    [
      templateId,
      input.childId,
      input.icon,
      input.title,
      input.category,
      input.target,
      JSON.stringify(input.goals),
      input.rewardMinutes,
      input.energy,
      input.total,
      input.tone,
      input.repeatRule,
      input.scheduledTime ?? null,
      input.timeLimitMinutes ?? null,
      input.targetApp ?? null,
      input.source ?? "parent",
      input.active ?? true
    ]
  );

  return getTaskTemplate(templateId);
}

export async function updateTaskTemplate(templateId: string, input: TaskTemplateInput) {
  assertPool();

  const result = await pool!.query(
    `
      update task_templates
      set icon = $2,
          title = $3,
          category = $4,
          default_target = $5,
          default_goals = $6::jsonb,
          default_reward_minutes = $7,
          default_energy = $8,
          default_total = $9,
          tone = $10,
          rrule = $11,
          default_scheduled_time = $12,
          default_time_limit_minutes = $13,
          default_target_app = $14,
          default_source = $15,
          active = $16,
          updated_at = now()
      where id = $1
      returning id
    `,
    [
      templateId,
      input.icon,
      input.title,
      input.category,
      input.target,
      JSON.stringify(input.goals),
      input.rewardMinutes,
      input.energy,
      input.total,
      input.tone,
      input.repeatRule,
      input.scheduledTime ?? null,
      input.timeLimitMinutes ?? null,
      input.targetApp ?? null,
      input.source ?? "parent",
      input.active ?? true
    ]
  );

  return result.rowCount ? getTaskTemplate(templateId) : null;
}

export async function deleteTaskTemplate(templateId: string) {
  assertPool();

  const result = await pool!.query("delete from task_templates where id = $1", [templateId]);
  return (result.rowCount ?? 0) > 0;
}

export async function createOccurrenceFromTemplate(templateId: string, occurrenceDate: string) {
  assertPool();

  const occurrenceId = `${templateId}-${occurrenceDate}`;

  const result = await pool!.query(
    `
      insert into task_occurrences (
        id, template_id, child_id, occurrence_date, title, target, scheduled_time, time_limit_minutes, target_app, source, progress, total, status
      )
      select
        $2,
        template.id,
        template.child_id,
        $3::date,
        template.title,
        template.default_target,
        template.default_scheduled_time,
        template.default_time_limit_minutes,
        template.default_target_app,
        template.default_source,
        0,
        template.default_total,
        'pending'
      from task_templates template
      where template.id = $1
      on conflict (template_id, occurrence_date) do update
      set updated_at = task_occurrences.updated_at
      returning id
    `,
    [templateId, occurrenceId, occurrenceDate]
  );

  const occurrence = result.rows[0] as { id: string } | undefined;

  if (!occurrence) {
    return null;
  }

  await pool!.query(
    `
      insert into task_plan_details (id, occurrence_id, summary, goals, notes)
      select
        'plan-' || occurrence.id,
        occurrence.id,
        occurrence.target,
        template.default_goals,
        ''
      from task_occurrences occurrence
      join task_templates template on template.id = occurrence.template_id
      where occurrence.id = $1
      on conflict (occurrence_id) do update
      set summary = excluded.summary,
          goals = excluded.goals,
          updated_at = now()
    `,
    [occurrence.id]
  );

  return getMissionOccurrence(occurrence.id);
}

export async function createMission(input: MissionInput) {
  assertPool();

  const templateId = await uniqueId("task_templates", `template-${slugify(input.title)}`);
  const occurrenceId = await uniqueId("task_occurrences", slugify(input.title));
  const occurrenceDate = input.occurrenceDate ?? new Date().toISOString().slice(0, 10);

  await pool!.query(
    `
      insert into task_templates (
        id, child_id, icon, title, category, default_target, default_goals,
        default_reward_minutes, default_energy, default_total, tone, rrule, default_scheduled_time, default_time_limit_minutes, default_target_app, default_source
      )
      values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `,
    [
      templateId,
      input.childId,
      input.icon,
      input.title,
      input.category,
      input.target,
      JSON.stringify(input.goals),
      input.rewardMinutes,
      input.energy,
      input.total,
      input.tone,
      input.repeatRule ?? "FREQ=DAILY",
      input.scheduledTime ?? null,
      input.timeLimitMinutes ?? null,
      input.targetApp ?? null,
      input.source ?? "parent"
    ]
  );

  await pool!.query(
    `
      insert into task_occurrences (
        id, template_id, child_id, occurrence_date, title, target, scheduled_time, time_limit_minutes, target_app, source, progress, total, status
      )
      values ($1, $2, $3, $4::date, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `,
    [
      occurrenceId,
      templateId,
      input.childId,
      occurrenceDate,
      input.title,
      input.target,
      input.scheduledTime ?? null,
      input.timeLimitMinutes ?? null,
      input.targetApp ?? null,
      input.source ?? "parent",
      input.progress,
      input.total,
      toOccurrenceStatus(input.status)
    ]
  );

  await pool!.query(
    `
      insert into task_plan_details (id, occurrence_id, summary, goals, attachments, notes)
      values ($1, $2, $3, $4::jsonb, $5::jsonb, $6)
    `,
    [
      `plan-${occurrenceId}`,
      occurrenceId,
      input.detail || input.target,
      JSON.stringify(input.goals),
      JSON.stringify(input.attachments ?? []),
      input.detail
    ]
  );

  await insertTaskEvent({
    childId: input.childId,
    content: `Task "${input.title}" was created for ${occurrenceDate}.`,
    eventType: "created",
    metadata: { occurrenceDate, status: input.status, timeLimitMinutes: input.timeLimitMinutes },
    occurrenceId,
    title: "Task created"
  });
  const mission = await getMissionOccurrence(occurrenceId);
  return mission!;
}

export async function updateMission(missionId: string, input: MissionInput) {
  assertPool();
  const existingResult = await pool!.query("select child_id, status from task_occurrences where id = $1", [missionId]);
  const existing = existingResult.rows[0] as { child_id: string; status: string } | undefined;

  const updateResult = await pool!.query(
    `
      update task_occurrences
      set title = $2,
          target = $3,
          progress = $4,
          total = $5,
          status = $6,
          occurrence_date = coalesce($7::date, occurrence_date),
          scheduled_time = $8,
          time_limit_minutes = $9,
          target_app = $10,
          source = $11,
          updated_at = now()
      where id = $1
    `,
    [
      missionId,
      input.title,
      input.target,
      input.progress,
      input.total,
      toOccurrenceStatus(input.status),
      input.occurrenceDate ?? null,
      input.scheduledTime ?? null,
      input.timeLimitMinutes ?? null,
      input.targetApp ?? null,
      input.source ?? "parent"
    ]
  );

  let occurrenceId = missionId;

  if (updateResult.rowCount === 0) {
    const materialized = await materializeVirtualOccurrence(missionId, input.occurrenceDate);

    if (!materialized) {
      return null;
    }

    occurrenceId = materialized.id;

    await pool!.query(
      `
        update task_occurrences
        set title = $2,
            target = $3,
            progress = $4,
            total = $5,
            status = $6,
            occurrence_date = coalesce($7::date, occurrence_date),
            scheduled_time = $8,
            time_limit_minutes = $9,
            target_app = $10,
            source = $11,
            updated_at = now()
        where id = $1
      `,
      [
        occurrenceId,
        input.title,
        input.target,
        input.progress,
        input.total,
        toOccurrenceStatus(input.status),
        input.occurrenceDate ?? null,
        input.scheduledTime ?? null,
        input.timeLimitMinutes ?? null,
        input.targetApp ?? null,
        input.source ?? "parent"
      ]
    );
  }

  await pool!.query(
    `
      update task_templates template
      set icon = $2,
          category = $3,
          default_reward_minutes = $4,
          default_energy = $5,
          tone = $6,
          rrule = $7,
          default_scheduled_time = $8,
          default_time_limit_minutes = $9,
          default_target_app = $10,
          default_source = $11,
          updated_at = now()
      from task_occurrences occurrence
      where occurrence.id = $1
        and template.id = occurrence.template_id
    `,
    [
      occurrenceId,
      input.icon,
      input.category,
      input.rewardMinutes,
      input.energy,
      input.tone,
      input.repeatRule ?? "FREQ=DAILY",
      input.scheduledTime ?? null,
      input.timeLimitMinutes ?? null,
      input.targetApp ?? null,
      input.source ?? "parent"
    ]
  );

  await pool!.query(
    `
      insert into task_plan_details (id, occurrence_id, summary, goals, attachments, notes)
      values ($1, $2, $3, $4::jsonb, $5::jsonb, $6)
      on conflict (occurrence_id) do update
      set summary = excluded.summary,
          goals = excluded.goals,
          attachments = excluded.attachments,
          notes = excluded.notes,
          updated_at = now()
    `,
    [
      `plan-${occurrenceId}`,
      occurrenceId,
      input.detail || input.target,
      JSON.stringify(input.goals),
      JSON.stringify(input.attachments ?? []),
      input.detail
    ]
  );

  await insertTaskEvent({
    childId: input.childId,
    content: `Task "${input.title}" details were updated.`,
    eventType: "updated",
    metadata: { timeLimitMinutes: input.timeLimitMinutes, scheduledTime: input.scheduledTime ?? null },
    occurrenceId,
    title: "Task updated"
  });

  const nextStatus = toOccurrenceStatus(input.status);
  if (existing?.status && existing.status !== nextStatus) {
    await insertTaskEvent({
      childId: existing.child_id,
      content: `Status changed from ${existing.status} to ${nextStatus}.`,
      eventType: "status_change",
      metadata: { from: existing.status, to: nextStatus },
      occurrenceId,
      title: "Status changed"
    });
  }

  return getMissionOccurrence(occurrenceId);
}

export async function updateMissionLayout(childId: string, occurrenceDate: string, layout: MissionLayoutInput[]) {
  assertPool();

  await pool!.query("begin");

  try {
    for (const item of layout) {
      await pool!.query(
        `
          insert into task_occurrence_layouts (mission_id, child_id, occurrence_date, layout_column, layout_order)
          values ($1, $2, $3::date, $4, $5)
          on conflict (mission_id) do update
          set child_id = excluded.child_id,
              occurrence_date = excluded.occurrence_date,
              layout_column = excluded.layout_column,
              layout_order = excluded.layout_order,
              updated_at = now()
        `,
        [item.id, childId, occurrenceDate, item.layoutColumn, item.layoutOrder]
      );

      let result = await pool!.query(
        `
          update task_occurrences
          set layout_column = $4,
              layout_order = $5,
              updated_at = now()
          where id = $1
            and child_id = $2
            and occurrence_date = $3::date
        `,
        [item.id, childId, occurrenceDate, item.layoutColumn, item.layoutOrder]
      );

      if (result.rowCount === 0) {
        const materialized = await materializeVirtualOccurrence(item.id, occurrenceDate);

        if (materialized) {
          result = await pool!.query(
            `
              update task_occurrences
              set layout_column = $4,
                  layout_order = $5,
                  updated_at = now()
              where id = $1
                and child_id = $2
                and occurrence_date = $3::date
            `,
            [materialized.id, childId, occurrenceDate, item.layoutColumn, item.layoutOrder]
          );
        }
      }
    }

    await pool!.query("commit");
  } catch (error) {
    await pool!.query("rollback");
    throw error;
  }

  return getMissionsForChild(childId, { startDate: occurrenceDate, endDate: occurrenceDate });
}

export async function deleteMission(missionId: string) {
  assertPool();

  const result = await pool!.query("delete from task_occurrences where id = $1", [missionId]);
  return (result.rowCount ?? 0) > 0;
}

export async function resetTimedMission(missionId: string) {
  assertPool();

  const occurrenceResult = await pool!.query(
    "select id, child_id, title from task_occurrences where id = $1",
    [missionId]
  );
  const occurrence = occurrenceResult.rows[0] as { child_id: string; id: string; title: string } | undefined;

  if (!occurrence) {
    return null;
  }

  await pool!.query("delete from task_app_runs where occurrence_id = $1", [missionId]);
  await pool!.query("delete from completion_records where occurrence_id = $1", [missionId]);
  await pool!.query("delete from reward_records where occurrence_id = $1", [missionId]);
  await pool!.query(
    `
      update task_occurrences
      set actual_start_at = null,
          actual_end_at = null,
          progress = 0,
          status = 'pending',
          updated_at = now()
      where id = $1
    `,
    [missionId]
  );
  await insertTaskEvent({
    childId: occurrence.child_id,
    content: `Timed task "${occurrence.title}" was reset by parent.`,
    eventType: "status_change",
    metadata: { reset: "timed_task" },
    occurrenceId: missionId,
    title: "Timed task reset"
  });

  return getMissionOccurrence(missionId);
}

export async function cancelMission(missionId: string) {
  assertPool();

  let occurrenceId = missionId;
  let result = await pool!.query(
    `
      update task_occurrences
      set status = 'skipped',
          actual_end_at = coalesce(actual_end_at, now()),
          updated_at = now()
      where id = $1
      returning id, child_id, title
    `,
    [missionId]
  );

  if (result.rowCount === 0) {
    const materialized = await materializeVirtualOccurrence(missionId);

    if (!materialized) {
      return null;
    }

    occurrenceId = materialized.id;
    result = await pool!.query(
      `
        update task_occurrences
        set status = 'skipped',
            actual_end_at = coalesce(actual_end_at, now()),
            updated_at = now()
        where id = $1
        returning id, child_id, title
      `,
      [occurrenceId]
    );
  }

  const occurrence = result.rows[0] as { child_id: string; id: string; title: string } | undefined;

  if (!occurrence) {
    return null;
  }

  await pool!.query(
    `
      update task_app_runs
      set status = 'completed',
          completed_at = coalesce(completed_at, now()),
          updated_at = now()
      where occurrence_id = $1
        and status in ('running', 'paused')
    `,
    [occurrenceId]
  );

  await insertTaskEvent({
    childId: occurrence.child_id,
    content: `Task "${occurrence.title}" was cancelled.`,
    eventType: "cancelled",
    metadata: { status: "skipped" },
    occurrenceId,
    title: "Task cancelled"
  });

  return getMissionOccurrence(occurrenceId);
}

async function insertCompletionReward(
  occurrenceId: string,
  options: { actualMinutes?: number; isOverdue?: boolean; rewardId: string }
) {
  const result = await pool!.query(
    `
      select
        occurrence.child_id,
        occurrence.id,
        occurrence.title,
        occurrence.time_limit_minutes,
        template.category,
        template.default_energy,
        template.default_reward_minutes
      from task_occurrences occurrence
      join task_templates template on template.id = occurrence.template_id
      where occurrence.id = $1
    `,
    [occurrenceId]
  );
  const row = result.rows[0] as
    | {
        category: string;
        child_id: string;
        default_energy: number;
        default_reward_minutes: number;
        id: string;
        time_limit_minutes: number | null;
        title: string;
      }
    | undefined;

  if (!row) {
    return;
  }

  const basePoints = Number(row.default_energy);
  const baseMinutes = Number(row.default_reward_minutes);
  const isTimed = row.time_limit_minutes !== null && row.time_limit_minutes !== undefined;
  const isOverdue = Boolean(options.isOverdue || (isTimed && options.actualMinutes !== undefined && options.actualMinutes > Number(row.time_limit_minutes)));
  const reward = calculateReward({
    baseMinutes,
    basePoints,
    category: row.category,
    isOverdue,
    isTimed
  });

  await pool!.query(
    `
      insert into reward_records (id, child_id, occurrence_id, source, reason, points, minutes)
      select $1, $2, $3, 'completion', $4, $5, $6
      where not exists (
        select 1 from reward_records
        where occurrence_id = $3 and source = 'completion'
      )
    `,
    [options.rewardId, row.child_id, row.id, reward.reason || `Completed ${row.title}`, reward.points, reward.minutes]
  );
}

function calculateReward(input: { baseMinutes: number; basePoints: number; category: string; isOverdue: boolean; isTimed: boolean }) {
  const isEntertainment = input.category === "entertainment" || input.category === "Movies" || input.category === "Game";
  const signedBasePoints = isEntertainment ? -Math.abs(input.basePoints) : input.basePoints;
  const signedBaseMinutes = isEntertainment ? -Math.abs(input.baseMinutes) : input.baseMinutes;

  if (input.isTimed && input.isOverdue) {
    return {
      minutes: -Math.abs(signedBaseMinutes) * 2,
      points: -Math.abs(signedBasePoints) * 2,
      reason: "Timed task overdue penalty"
    };
  }

  return {
    minutes: signedBaseMinutes,
    points: signedBasePoints,
    reason: isEntertainment ? "Entertainment time used" : ""
  };
}

export async function completeMission(
  missionId: string,
  evidence?: { actualMinutes?: number; audioUri?: string; endedAt?: string; note?: string; photoUri?: string; startedAt?: string }
) {
  assertPool();

  let occurrenceId = missionId;
  let previousStatus: string | undefined;
  const existingResult = await pool!.query("select status from task_occurrences where id = $1", [missionId]);
  previousStatus = existingResult.rows[0]?.status;
  let missionResult = await pool!.query(
    `
      update task_occurrences
      set progress = total,
          status = 'done',
          actual_start_at = coalesce(actual_start_at, $2::timestamptz),
          actual_end_at = coalesce($3::timestamptz, now()),
          updated_at = now()
      where id = $1
      returning id, child_id, total
    `,
    [missionId, evidence?.startedAt ?? null, evidence?.endedAt ?? null]
  );

  if (missionResult.rowCount === 0) {
    const materialized = await materializeVirtualOccurrence(missionId);

    if (!materialized) {
      return null;
    }

    occurrenceId = materialized.id;
    previousStatus = materialized.occurrenceStatus;
    missionResult = await pool!.query(
      `
        update task_occurrences
        set progress = total,
            status = 'done',
            actual_start_at = coalesce(actual_start_at, $2::timestamptz),
            actual_end_at = coalesce($3::timestamptz, now()),
            updated_at = now()
        where id = $1
        returning id, child_id, total
      `,
      [occurrenceId, evidence?.startedAt ?? null, evidence?.endedAt ?? null]
    );
  }
  const occurrence = missionResult.rows[0];

  if (!occurrence) {
    return null;
  }

  await pool!.query(
    `
      insert into completion_records (id, occurrence_id, child_id, actual_minutes, completed_quantity, parent_confirmed, note, photo_uri, audio_uri)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      `run-${missionId}-${Date.now()}`,
      occurrenceId,
      occurrence.child_id,
      evidence?.actualMinutes ?? null,
      occurrence.total,
      true,
      evidence?.note ?? null,
      evidence?.photoUri ?? null,
      evidence?.audioUri ?? null
    ]
  );

  await pool!.query(
    `
      insert into task_execution_records (id, occurrence_id, child_id, occurrence_date, status)
      select $1, occurrence.id, occurrence.child_id, occurrence.occurrence_date, 'done'
      from task_occurrences occurrence
      where occurrence.id = $2
      on conflict (occurrence_id, status) do nothing
    `,
    [`execution-${occurrenceId}-done`, occurrenceId]
  );

  await insertCompletionReward(occurrenceId, {
    actualMinutes: evidence?.actualMinutes,
    rewardId: `reward-${occurrenceId}-${Date.now()}`
  });

  await insertTaskEvent({
    childId: occurrence.child_id,
    content: `Task completed${evidence?.actualMinutes ? ` in ${evidence.actualMinutes} minutes` : ""}.`,
    eventType: "completion",
    metadata: { actualMinutes: evidence?.actualMinutes, note: evidence?.note ?? null },
    occurrenceId,
    recordedAt: evidence?.endedAt,
    title: "Task completed"
  });

  if (previousStatus && previousStatus !== "done") {
    await insertTaskEvent({
      childId: occurrence.child_id,
      content: `Status changed from ${previousStatus} to done.`,
      eventType: "status_change",
      metadata: { from: previousStatus, to: "done" },
      occurrenceId,
      recordedAt: evidence?.endedAt,
      title: "Status changed"
    });
  }

  return getMissionOccurrence(occurrenceId);
}

export async function recordMissionTimerEvent(missionId: string, input: MissionTimerEventInput) {
  assertPool();

  let occurrenceId = missionId;
  let result = await pool!.query(
    `
      update task_occurrences
      set actual_start_at = case when $2 = 'timer_start' then coalesce(actual_start_at, now()) else actual_start_at end,
          actual_end_at = case when $2 = 'timer_end' then now() else actual_end_at end,
          status = case when $2 = 'timer_end' and time_limit_minutes is not null and status <> 'done' then 'expired' else status end,
          updated_at = now()
      where id = $1
      returning id, child_id
    `,
    [missionId, input.eventType]
  );

  if (result.rowCount === 0) {
    const materialized = await materializeVirtualOccurrence(missionId);

    if (!materialized) {
      return null;
    }

    occurrenceId = materialized.id;
    result = await pool!.query(
      `
        update task_occurrences
        set actual_start_at = case when $2 = 'timer_start' then coalesce(actual_start_at, now()) else actual_start_at end,
            actual_end_at = case when $2 = 'timer_end' then now() else actual_end_at end,
            status = case when $2 = 'timer_end' and time_limit_minutes is not null and status <> 'done' then 'expired' else status end,
            updated_at = now()
        where id = $1
        returning id, child_id
      `,
      [occurrenceId, input.eventType]
    );
  }

  const occurrence = result.rows[0];

  if (!occurrence) {
    return null;
  }

  if (input.eventType === "timer_end") {
    await pool!.query(
      `
        update task_app_runs
        set status = 'completed',
            completed_at = coalesce(completed_at, now()),
            actual_duration_minutes = coalesce(actual_duration_minutes, planned_duration_minutes),
            overdue = coalesce(overdue, false),
            overdue_minutes = coalesce(overdue_minutes, 0),
            updated_at = now()
        where occurrence_id = $1
          and status in ('running', 'paused')
      `,
      [occurrenceId]
    );
  }

  await insertTaskEvent({
    childId: occurrence.child_id,
    content: timerEventContent(input.eventType, input),
    eventType: input.eventType,
    metadata: { elapsedSeconds: input.elapsedSeconds ?? null, remainingSeconds: input.remainingSeconds ?? null },
    occurrenceId,
    title: timerEventTitle(input.eventType)
  });

  return getMissionOccurrence(occurrenceId);
}

export async function startTaskRun(missionId: string, input: StartTaskRunInput) {
  assertPool();

  let occurrenceId = missionId;
  let occurrenceResult = await pool!.query("select id, child_id, status from task_occurrences where id = $1", [missionId]);

  if (occurrenceResult.rowCount === 0) {
    const materialized = await materializeVirtualOccurrence(missionId);

    if (!materialized) {
      return null;
    }

    occurrenceId = materialized.id;
    occurrenceResult = await pool!.query("select id, child_id, status from task_occurrences where id = $1", [occurrenceId]);
  }

  const occurrence = occurrenceResult.rows[0] as { child_id: string; id: string; status: string } | undefined;

  if (!occurrence) {
    return null;
  }

  if (occurrence.status === "done" || occurrence.status === "expired") {
    return getMissionOccurrence(occurrenceId);
  }

  const completedRunResult = await pool!.query(
    "select id from task_app_runs where occurrence_id = $1 and status = 'completed' limit 1",
    [occurrenceId]
  );

  if ((completedRunResult.rowCount ?? 0) > 0) {
    return getMissionOccurrence(occurrenceId);
  }

  await pool!.query(
    `
      update task_app_runs
      set status = 'completed',
          completed_at = coalesce(completed_at, now()),
          updated_at = now()
      where occurrence_id = $1
        and status in ('running', 'paused')
    `,
    [occurrenceId]
  );

  await pool!.query(
    `
      insert into task_app_runs (
        id, occurrence_id, child_id, target_app, planned_duration_minutes,
        start_at, end_at, notification_id, status
      )
      values ($1, $2, $3, $4, $5, $6::timestamptz, $7::timestamptz, $8, 'running')
    `,
    [
      `run-${occurrenceId}-${Date.now()}`,
      occurrenceId,
      occurrence.child_id,
      input.targetApp ?? null,
      input.plannedDurationMinutes,
      input.startAt,
      input.endAt,
      input.notificationId ?? null
    ]
  );

  await pool!.query(
    `
      update task_occurrences
      set actual_start_at = coalesce(actual_start_at, $2::timestamptz),
          updated_at = now()
      where id = $1
    `,
    [occurrenceId, input.startAt]
  );

  await insertTaskEvent({
    childId: occurrence.child_id,
    content: `${input.targetApp ?? "Target app"} started until ${input.endAt}.`,
    eventType: "timer_start",
    metadata: {
      endAt: input.endAt,
      plannedDurationMinutes: input.plannedDurationMinutes,
      targetApp: input.targetApp ?? null
    },
    occurrenceId,
    recordedAt: input.startAt,
    title: "App run started"
  });

  return getMissionOccurrence(occurrenceId);
}

export async function finishTaskRun(missionId: string, runId: string, input: FinishTaskRunInput) {
  assertPool();

  const result = await pool!.query(
    `
      update task_app_runs
      set status = 'completed',
          completed_at = $3::timestamptz,
          actual_duration_minutes = $4,
          overdue = $5,
          overdue_minutes = $6,
          updated_at = now()
      where id = $1
        and occurrence_id = $2
      returning child_id, occurrence_id, target_app
    `,
    [runId, missionId, input.completedAt, input.actualDurationMinutes, input.overdue, input.overdueMinutes]
  );

  const run = result.rows[0] as { child_id: string; occurrence_id: string; target_app: string | null } | undefined;

  if (!run) {
    return null;
  }

  await pool!.query(
    `
      update task_occurrences
      set progress = total,
          status = 'done',
          actual_end_at = $2::timestamptz,
          updated_at = now()
      where id = $1
    `,
    [missionId, input.completedAt]
  );

  await pool!.query(
    `
      insert into completion_records (id, occurrence_id, child_id, actual_minutes, parent_confirmed)
      values ($1, $2, $3, $4, true)
      on conflict do nothing
    `,
    [`run-${missionId}-${runId}-completion`, missionId, run.child_id, input.actualDurationMinutes]
  );

  await pool!.query(
    `
      insert into task_execution_records (id, occurrence_id, child_id, occurrence_date, status)
      select $1, occurrence.id, occurrence.child_id, occurrence.occurrence_date, 'done'
      from task_occurrences occurrence
      where occurrence.id = $2
      on conflict (occurrence_id, status) do nothing
    `,
    [`execution-${missionId}-done`, missionId]
  );

  await insertCompletionReward(missionId, {
    isOverdue: input.overdue,
    rewardId: `reward-${missionId}-${Date.now()}`
  });

  await insertTaskEvent({
    childId: run.child_id,
    content: `${run.target_app ?? "Target app"} finished in ${input.actualDurationMinutes} minutes${input.overdue ? `, overdue by ${input.overdueMinutes} minutes` : ""}.`,
    eventType: "completion",
    metadata: {
      actualDurationMinutes: input.actualDurationMinutes,
      overdue: input.overdue,
      overdueMinutes: input.overdueMinutes,
      targetApp: run.target_app
    },
    occurrenceId: missionId,
    recordedAt: input.completedAt,
    title: "App run finished"
  });

  return getMissionOccurrence(missionId);
}

export async function pauseTaskRun(missionId: string, runId: string, input: PauseTaskRunInput) {
  assertPool();

  const result = await pool!.query(
    `
      update task_app_runs
      set status = 'paused',
          completed_at = $3::timestamptz,
          actual_duration_minutes = $4,
          overdue = $5,
          overdue_minutes = $6,
          updated_at = now()
      where id = $1
        and occurrence_id = $2
        and status = 'running'
      returning child_id, occurrence_id, target_app
    `,
    [runId, missionId, input.pausedAt, input.actualDurationMinutes, input.overdue, input.overdueMinutes]
  );

  const run = result.rows[0] as { child_id: string; occurrence_id: string; target_app: string | null } | undefined;

  if (!run) {
    return null;
  }

  await insertTaskEvent({
    childId: run.child_id,
    content: `${run.target_app ?? "Target app"} paused after ${input.actualDurationMinutes} minutes${input.overdue ? `, overdue by ${input.overdueMinutes} minutes` : ""}.`,
    eventType: "timer_pause",
    metadata: {
      actualDurationMinutes: input.actualDurationMinutes,
      overdue: input.overdue,
      overdueMinutes: input.overdueMinutes,
      targetApp: run.target_app
    },
    occurrenceId: missionId,
    recordedAt: input.pausedAt,
    title: "App run paused"
  });

  return getMissionOccurrence(missionId);
}

export async function resumeTaskRun(missionId: string, runId: string, input: ResumeTaskRunInput) {
  assertPool();

  const result = await pool!.query(
    `
      update task_app_runs
      set status = 'running',
          completed_at = null,
          end_at = $3::timestamptz,
          notification_id = $4,
          updated_at = now()
      where id = $1
        and occurrence_id = $2
        and status = 'paused'
      returning child_id, occurrence_id, target_app
    `,
    [runId, missionId, input.endAt, input.notificationId ?? null]
  );

  const run = result.rows[0] as { child_id: string; occurrence_id: string; target_app: string | null } | undefined;

  if (!run) {
    return null;
  }

  await insertTaskEvent({
    childId: run.child_id,
    content: `${run.target_app ?? "Target app"} timer resumed.`,
    eventType: "timer_resume",
    metadata: {
      endAt: input.endAt,
      targetApp: run.target_app
    },
    occurrenceId: missionId,
    recordedAt: input.resumedAt,
    title: "App run resumed"
  });

  return getMissionOccurrence(missionId);
}

export async function addMissionAttachment(missionId: string, attachment: PlanAttachmentInput) {
  assertPool();

  await pool!.query(
    `
      insert into task_plan_details (id, occurrence_id, summary, goals, attachments, notes)
      select
        'plan-' || occurrence.id,
        occurrence.id,
        occurrence.target,
        '[]'::jsonb,
        jsonb_build_array($2::jsonb),
        ''
      from task_occurrences occurrence
      where occurrence.id = $1
      on conflict (occurrence_id) do update
      set attachments = task_plan_details.attachments || excluded.attachments,
          updated_at = now()
    `,
    [missionId, JSON.stringify(attachment)]
  );

  const occurrenceResult = await pool!.query("select child_id from task_occurrences where id = $1", [missionId]);
  const occurrence = occurrenceResult.rows[0] as { child_id: string } | undefined;

  if (occurrence) {
    await insertTaskEvent({
      childId: occurrence.child_id,
      content: `Attachment "${attachment.name}" was added.`,
      eventType: "attachment_added",
      metadata: { attachmentId: attachment.id, mimeType: attachment.mimeType ?? null, size: attachment.size ?? null },
      occurrenceId: missionId,
      title: "Attachment added"
    });
  }

  return getMissionOccurrence(missionId);
}

function mapChild(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    age: Number(row.age),
    grade: Number(row.grade),
    pinLength: Number(row.pin_length),
    avatarUri: row.avatar_uri ? String(row.avatar_uri) : undefined,
    companion: {
      name: String(row.companion_name),
      level: Number(row.companion_level),
      growth: Number(row.companion_growth)
    }
  };
}

async function insertTaskEvent(input: {
  childId: string;
  content: string;
  eventType: TaskEventType;
  metadata?: Record<string, unknown>;
  occurrenceId: string;
  recordedAt?: string;
  title: string;
}) {
  assertPool();

  await pool!.query(
    `
      insert into task_events (id, occurrence_id, child_id, event_type, title, content, metadata, recorded_at)
      values ($1, $2, $3, $4, $5, $6, $7::jsonb, coalesce($8::timestamptz, now()))
    `,
    [
      `event-${input.occurrenceId}-${input.eventType}-${Date.now()}`,
      input.occurrenceId,
      input.childId,
      input.eventType,
      input.title,
      input.content,
      JSON.stringify(input.metadata ?? {}),
      input.recordedAt ?? null
    ]
  );
}

function timerEventTitle(eventType: MissionTimerEventInput["eventType"]) {
  switch (eventType) {
    case "timer_start":
      return "Timer started";
    case "timer_pause":
      return "Timer paused";
    case "timer_resume":
      return "Timer resumed";
    case "timer_end":
      return "Timer ended";
  }
}

function timerEventContent(eventType: MissionTimerEventInput["eventType"], input: Pick<MissionTimerEventInput, "elapsedSeconds" | "remainingSeconds">) {
  const elapsedText = input.elapsedSeconds === undefined ? "" : ` with ${input.elapsedSeconds} seconds elapsed`;
  const remainingText = input.remainingSeconds === undefined ? "" : ` with ${input.remainingSeconds} seconds remaining`;
  return `${timerEventTitle(eventType)}${elapsedText}${remainingText}.`;
}

async function ensureTodayOccurrences(childId: string) {
  assertPool();

  await pool!.query(
    `
      insert into task_occurrences (
        id, template_id, child_id, occurrence_date, title, target, scheduled_time, time_limit_minutes, progress, total, status
      )
      select
        template.id || '-' || to_char(current_date, 'YYYY-MM-DD'),
        template.id,
        template.child_id,
        current_date,
        template.title,
        template.default_target,
        template.default_scheduled_time,
        template.default_time_limit_minutes,
        0,
        template.default_total,
        'pending'
      from task_templates template
      where template.child_id = $1
        and template.active = true
        and template.rrule <> 'FREQ=NONE'
        and (
          template.rrule like 'FREQ=DAILY%'
          or template.rrule like 'FREQ=WEEKLY%'
        )
        and (
          position('BYDAY=' in template.rrule) = 0
          and template.rrule like 'FREQ=DAILY%'
          or position(
            case extract(isodow from current_date)::int
              when 1 then 'MO'
              when 2 then 'TU'
              when 3 then 'WE'
              when 4 then 'TH'
              when 5 then 'FR'
              when 6 then 'SA'
              else 'SU'
            end
            in split_part(template.rrule, 'BYDAY=', 2)
          ) > 0
        )
        and not exists (
          select 1
          from task_occurrences occurrence
          where occurrence.template_id = template.id
            and occurrence.occurrence_date = current_date
        )
    `,
    [childId]
  );

  await pool!.query(
    `
      insert into task_plan_details (id, occurrence_id, summary, goals, notes)
      select
        'plan-' || occurrence.id,
        occurrence.id,
        occurrence.target,
        template.default_goals,
        ''
      from task_occurrences occurrence
      join task_templates template on template.id = occurrence.template_id
      where occurrence.child_id = $1
        and occurrence.occurrence_date = current_date
        and not exists (
          select 1
          from task_plan_details plan
          where plan.occurrence_id = occurrence.id
        )
    `,
    [childId]
  );
}

async function getMissionOccurrence(occurrenceId: string) {
  assertPool();

  const result = await pool!.query(
    `
      select
        occurrence.id,
        occurrence.child_id,
        occurrence.template_id,
        occurrence.occurrence_date,
        occurrence.scheduled_time,
        occurrence.time_limit_minutes,
        coalesce(template.default_target_app, occurrence.target_app) as target_app,
        coalesce(occurrence.source, template.default_source, 'parent') as source,
        occurrence.actual_start_at,
        occurrence.actual_end_at,
        template.icon,
        occurrence.title,
        template.category,
        template.rrule,
        occurrence.target,
        plan.summary as detail,
        plan.id as plan_detail_id,
        plan.summary as plan_summary,
        plan.goals,
        plan.attachments,
        plan.materials,
        plan.vocabulary,
        plan.notes,
        template.default_reward_minutes as reward_minutes,
        template.default_energy as energy,
        occurrence.progress,
        occurrence.total,
        occurrence.status as occurrence_status,
        template.tone,
        completion.completed_at,
        completion.actual_minutes,
        completion.parent_confirmed,
        completion.ai_score,
        active_run.record as active_run,
        coalesce(rewards.records, '[]'::jsonb) as reward_records,
        coalesce(task_events.records, '[]'::jsonb) as event_records
      from task_occurrences occurrence
      join task_templates template on template.id = occurrence.template_id
      left join task_plan_details plan on plan.occurrence_id = occurrence.id
      left join lateral (
        select completed_at, actual_minutes, parent_confirmed, ai_score
        from completion_records
        where occurrence_id = occurrence.id
        order by completed_at desc
        limit 1
      ) completion on true
      left join lateral (
        select jsonb_build_object(
          'id', id,
          'status', status,
          'targetApp', target_app,
          'plannedDurationMinutes', planned_duration_minutes,
          'startAt', start_at,
          'endAt', end_at,
          'completedAt', completed_at,
          'actualDurationMinutes', actual_duration_minutes,
          'overdue', overdue,
          'overdueMinutes', overdue_minutes,
          'notificationId', notification_id
        ) as record
        from task_app_runs
        where occurrence_id = occurrence.id
          and status in ('running', 'paused')
        order by start_at desc
        limit 1
      ) active_run on true
      left join lateral (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'points', points,
            'reason', reason,
            'source', source
          )
          order by created_at asc
        ) as records
        from reward_records
        where occurrence_id = occurrence.id
      ) rewards on true
      left join lateral (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'eventType', event_type,
            'title', title,
            'content', content,
            'recordedAt', recorded_at,
            'metadata', metadata
          )
          order by recorded_at asc
        ) as records
        from task_events
        where occurrence_id = occurrence.id
      ) task_events on true
      where occurrence.id = $1
    `,
    [occurrenceId]
  );

  return result.rows[0] ? mapMission(result.rows[0]) : null;
}

async function getTaskTemplate(templateId: string) {
  assertPool();

  const result = await pool!.query(
    `
      select
        id,
        child_id,
        icon,
        title,
        category,
        default_target,
        default_goals,
        default_reward_minutes,
        default_energy,
        default_total,
        default_time_limit_minutes,
        default_target_app,
        default_source,
        tone,
        rrule,
        default_scheduled_time,
        active
      from task_templates
      where id = $1
    `,
    [templateId]
  );

  return result.rows[0] ? mapTaskTemplate(result.rows[0]) : null;
}

async function ensureExpiredExecutions(childId: string, range: MissionRange) {
  const today = new Date().toISOString().slice(0, 10);
  const endDate = range.endDate < today ? range.endDate : addDaysToKey(today, -1);

  if (endDate < range.startDate) {
    return;
  }

  const templateResult = await pool!.query(
    `
      select
        template.id,
        template.rrule,
        template.created_at,
        anchor.occurrence_date as first_occurrence_date
      from task_templates template
      left join lateral (
        select occurrence_date
        from task_occurrences
        where template_id = template.id
        order by occurrence_date asc, created_at asc
        limit 1
      ) anchor on true
      where template.child_id = $1
        and template.active = true
        and template.rrule <> 'FREQ=NONE'
    `,
    [childId]
  );

  for (const template of templateResult.rows) {
    const anchorDate = formatDbDate(template.first_occurrence_date ?? template.created_at);

    for (const occurrenceDate of datesBetween(range.startDate, endDate)) {
      if (!repeatRuleOccursOnDate(String(template.rrule ?? "FREQ=DAILY"), occurrenceDate, anchorDate)) {
        continue;
      }

      const mission = await createOccurrenceFromTemplate(String(template.id), occurrenceDate);

      if (!mission || mission.occurrenceStatus === "done") {
        continue;
      }

      await pool!.query(
        `
          update task_occurrences
          set status = 'expired',
              updated_at = now()
          where id = $1
            and status <> 'done'
        `,
        [mission.id]
      );

      await pool!.query(
        `
          insert into task_execution_records (id, occurrence_id, child_id, occurrence_date, status)
          values ($1, $2, $3, $4::date, 'expired')
          on conflict (occurrence_id, status) do nothing
        `,
        [`execution-${mission.id}-expired`, mission.id, childId, occurrenceDate]
      );
    }
  }
}

async function materializeVirtualOccurrence(missionId: string, occurrenceDate?: string) {
  const date = occurrenceDate ?? missionId.match(/(\d{4}-\d{2}-\d{2})$/)?.[1];

  if (!date) {
    return null;
  }

  const suffix = `-${date}`;
  const templateId = missionId.endsWith(suffix) ? missionId.slice(0, -suffix.length) : "";

  if (!templateId) {
    return null;
  }

  return createOccurrenceFromTemplate(templateId, date);
}

async function resolveMissionOccurrences(childId: string, range: MissionRange, storedRows: Record<string, unknown>[]) {
  const storedByTemplateDate = new Map(
    storedRows.map((row) => [`${row.template_id}|${formatDbDate(row.occurrence_date)}`, row])
  );
  const layoutResult = await pool!.query(
    `
      select mission_id, layout_column, layout_order
      from task_occurrence_layouts
      where child_id = $1
        and occurrence_date >= $2::date
        and occurrence_date <= $3::date
    `,
    [childId, range.startDate, range.endDate]
  );
  const layoutByMissionId = new Map(
    layoutResult.rows.map((row) => [
      String(row.mission_id),
      {
        layout_column: row.layout_column,
        layout_order: row.layout_order
      }
    ])
  );

  const templateResult = await pool!.query(
    `
      select
        template.id,
        template.child_id,
        template.icon,
        template.title,
        template.category,
        template.default_target,
        template.default_goals,
        template.default_reward_minutes,
        template.default_energy,
        template.default_total,
        template.default_time_limit_minutes,
        template.default_target_app,
        template.default_source,
        template.tone,
        template.rrule,
        template.default_scheduled_time,
        template.created_at,
        anchor.occurrence_date as first_occurrence_date,
        plan.id as plan_detail_id,
        plan.summary as plan_summary,
        plan.goals as plan_goals,
        plan.attachments,
        plan.materials,
        plan.vocabulary,
        plan.notes
      from task_templates template
      left join lateral (
        select id, occurrence_date
        from task_occurrences
        where template_id = template.id
        order by occurrence_date asc, created_at asc
        limit 1
      ) anchor on true
      left join task_plan_details plan on plan.occurrence_id = anchor.id
      where template.child_id = $1
        and template.active = true
        and template.rrule <> 'FREQ=NONE'
      order by template.title asc
    `,
    [childId]
  );

  const rows = [...storedRows];

  for (const template of templateResult.rows) {
    const anchorDate = formatDbDate(template.first_occurrence_date ?? template.created_at);

    for (const occurrenceDate of datesBetween(range.startDate, range.endDate)) {
      if (!repeatRuleOccursOnDate(String(template.rrule ?? "FREQ=DAILY"), occurrenceDate, anchorDate)) {
        continue;
      }

      const key = `${template.id}|${occurrenceDate}`;

      if (storedByTemplateDate.has(key)) {
        continue;
      }

      rows.push(virtualMissionRow(template, occurrenceDate));
    }
  }

  return rows
    .map((row) => ({
      ...row,
      ...layoutByMissionId.get(String(row.id))
    }))
    .map(mapMission)
    .sort((a, b) => {
      const dateCompare = a.occurrenceDate.localeCompare(b.occurrenceDate);
      if (dateCompare !== 0) {
        return dateCompare;
      }

      if (a.layoutColumn !== b.layoutColumn) {
        return (a.layoutColumn ?? "zz").localeCompare(b.layoutColumn ?? "zz");
      }

      const leftOrder = a.layoutOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = b.layoutOrder ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return (a.scheduledTime || "99:99").localeCompare(b.scheduledTime || "99:99");
    });
}

function virtualMissionRow(template: Record<string, unknown>, occurrenceDate: string) {
  const goals = Array.isArray(template.plan_goals)
    ? template.plan_goals
    : Array.isArray(template.default_goals)
      ? template.default_goals
      : [];
  const target = String(template.default_target);
  const detail = String(template.plan_summary ?? target);

  return {
    id: `${template.id}-${occurrenceDate}`,
    child_id: template.child_id,
    template_id: template.id,
    occurrence_date: occurrenceDate,
    scheduled_time: template.default_scheduled_time,
    time_limit_minutes: template.default_time_limit_minutes,
    target_app: template.default_target_app,
    source: template.default_source ?? "parent",
    actual_start_at: null,
    actual_end_at: null,
    icon: template.icon,
    title: template.title,
    category: template.category,
    rrule: template.rrule,
    target,
    detail,
    plan_detail_id: template.plan_detail_id ?? `plan-${template.id}-${occurrenceDate}`,
    plan_summary: detail,
    goals,
    attachments: Array.isArray(template.attachments) ? template.attachments : [],
    materials: Array.isArray(template.materials) ? template.materials : [],
    vocabulary: Array.isArray(template.vocabulary) ? template.vocabulary : [],
    notes: template.notes ?? "",
    reward_minutes: template.default_reward_minutes,
    energy: template.default_energy,
    progress: 0,
    total: template.default_total,
    occurrence_status: "pending",
    tone: template.tone,
    completed_at: null,
    actual_minutes: null,
    parent_confirmed: null,
    ai_score: null,
    active_run: null,
    reward_records: [],
    event_records: []
  };
}

function mapTaskTemplate(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    childId: String(row.child_id),
    icon: String(row.icon),
    title: String(row.title),
    category: String(row.category),
    target: String(row.default_target),
    goals: Array.isArray(row.default_goals) ? row.default_goals.map(String) : [],
    rewardMinutes: Number(row.default_reward_minutes),
    energy: Number(row.default_energy),
    total: Number(row.default_total),
    timeLimitMinutes: row.default_time_limit_minutes === null || row.default_time_limit_minutes === undefined ? undefined : Number(row.default_time_limit_minutes),
    targetApp: row.default_target_app === null || row.default_target_app === undefined ? undefined : String(row.default_target_app),
    source: row.default_source === null || row.default_source === undefined ? "parent" : String(row.default_source),
    tone: String(row.tone),
    repeatRule: String(row.rrule ?? "FREQ=DAILY"),
    scheduledTime: row.default_scheduled_time === null || row.default_scheduled_time === undefined ? "" : String(row.default_scheduled_time),
    active: Boolean(row.active)
  };
}

function mapMission(row: Record<string, unknown>) {
  const goals = Array.isArray(row.goals) ? row.goals.map(String) : [];
  const occurrenceStatus = String(row.occurrence_status ?? row.status ?? "pending") as OccurrenceStatus;

  return {
    id: String(row.id),
    childId: String(row.child_id),
    templateId: String(row.template_id ?? row.id),
    occurrenceDate: formatDbDate(row.occurrence_date),
    layoutColumn:
      row.layout_column === "primary" || row.layout_column === "secondary"
        ? row.layout_column
        : undefined,
    layoutOrder: row.layout_order === null || row.layout_order === undefined ? undefined : Number(row.layout_order),
    scheduledTime: row.scheduled_time === null || row.scheduled_time === undefined ? "" : String(row.scheduled_time),
    icon: String(row.icon),
    title: String(row.title),
    category: String(row.category),
    repeatRule: String(row.rrule ?? "FREQ=DAILY"),
    target: String(row.target),
    detail: String(row.detail),
    goals,
    planDetail: {
      id: String(row.plan_detail_id ?? `plan-${row.id}`),
      attachments: Array.isArray(row.attachments) ? row.attachments : [],
      materials: Array.isArray(row.materials) ? row.materials.map(String) : [],
      notes: String(row.notes ?? ""),
      summary: String(row.plan_summary ?? row.detail ?? row.target),
      vocabulary: Array.isArray(row.vocabulary) ? row.vocabulary.map(String) : []
    },
    completionRecord: row.completed_at
      ? {
          actualMinutes: row.actual_minutes === null ? undefined : Number(row.actual_minutes),
          aiScore: row.ai_score === null ? undefined : Number(row.ai_score),
          completedAt: String(row.completed_at),
          endedAt: row.actual_end_at === null || row.actual_end_at === undefined ? String(row.completed_at) : String(row.actual_end_at),
          parentConfirmed: Boolean(row.parent_confirmed),
          startedAt: row.actual_start_at === null || row.actual_start_at === undefined ? undefined : String(row.actual_start_at)
        }
      : undefined,
    activeRun: mapTaskRun(row.active_run),
    rewardRecords: Array.isArray(row.reward_records) ? row.reward_records : [],
    eventRecords: Array.isArray(row.event_records) ? row.event_records : [],
    rewardMinutes: Number(row.reward_minutes),
    executionType: inferExecutionType({
      category: String(row.category),
      targetApp: row.target_app === null || row.target_app === undefined ? undefined : String(row.target_app),
      timeLimitMinutes: row.time_limit_minutes === null || row.time_limit_minutes === undefined ? undefined : Number(row.time_limit_minutes)
    }),
    timeLimitMinutes: row.time_limit_minutes === null || row.time_limit_minutes === undefined ? undefined : Number(row.time_limit_minutes),
    targetApp: row.target_app === null || row.target_app === undefined ? undefined : String(row.target_app),
    source: row.source === null || row.source === undefined ? "parent" : String(row.source),
    actualStartAt: row.actual_start_at === null || row.actual_start_at === undefined ? undefined : String(row.actual_start_at),
    actualEndAt: row.actual_end_at === null || row.actual_end_at === undefined ? undefined : String(row.actual_end_at),
    energy: Number(row.energy),
    progress: Number(row.progress),
    total: Number(row.total),
    status: toMissionStatus(occurrenceStatus, Number(row.progress), Number(row.total)),
    occurrenceStatus,
    tone: String(row.tone)
  };
}

function inferExecutionType(input: { category: string; targetApp?: string; timeLimitMinutes?: number }) {
  if (["schedule", "reminder", "calendar"].includes(input.category) || input.category.startsWith("google_calendar")) {
    return "schedule";
  }

  if (input.targetApp || input.timeLimitMinutes || input.category === "entertainment" || input.category === "Movies" || input.category === "Game") {
    return "timed";
  }

  if (["reading", "language", "math", "music", "chinese", "english", "Math", "Chinese", "Eng"].includes(input.category)) {
    return "submission";
  }

  return "completion";
}

function mapTaskRun(value: unknown) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const run = value as Record<string, unknown>;

  return {
    actualDurationMinutes:
      run.actualDurationMinutes === null || run.actualDurationMinutes === undefined ? undefined : Number(run.actualDurationMinutes),
    completedAt: run.completedAt === null || run.completedAt === undefined ? undefined : String(run.completedAt),
    endAt: String(run.endAt),
    id: String(run.id),
    notificationId: run.notificationId === null || run.notificationId === undefined ? undefined : String(run.notificationId),
    overdue: run.overdue === null || run.overdue === undefined ? undefined : Boolean(run.overdue),
    overdueMinutes: run.overdueMinutes === null || run.overdueMinutes === undefined ? undefined : Number(run.overdueMinutes),
    plannedDurationMinutes: Number(run.plannedDurationMinutes),
    startAt: String(run.startAt),
    status: String(run.status),
    targetApp: run.targetApp === null || run.targetApp === undefined ? undefined : String(run.targetApp)
  };
}

function toMissionStatus(status: OccurrenceStatus, progress: number, total: number) {
  if (status === "done") {
    return "done";
  }

  if (status === "skipped") {
    return "cancelled";
  }

  if (status === "expired") {
    return "expired";
  }

  if (progress > 0 && progress < total) {
    return "in_progress";
  }

  return "todo";
}

function toOccurrenceStatus(status: MissionInput["status"]): OccurrenceStatus {
  if (status === "cancelled") {
    return "skipped";
  }

  if (status === "done" || status === "expired") {
    return status;
  }

  return "pending";
}

function formatDbDate(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}

function datesBetween(startDate: string, endDate: string) {
  const dates: string[] = [];
  const current = parseDateKey(startDate);
  const end = parseDateKey(endDate);

  while (current <= end) {
    dates.push(toDateKey(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function addDaysToKey(dateKey: string, days: number) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function repeatRuleOccursOnDate(rule: string, occurrenceDate: string, anchorDate: string) {
  if (rule === "FREQ=NONE" || occurrenceDate < anchorDate) {
    return false;
  }

  const parts = Object.fromEntries(
    rule.split(";").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );
  const frequency = String(parts.FREQ ?? "DAILY").toUpperCase();
  const interval = Math.max(1, Number(parts.INTERVAL ?? 1) || 1);
  const byDay = parts.BYDAY ? String(parts.BYDAY).split(",").filter(Boolean) : [];

  if (byDay.length && !byDay.includes(dayCode(occurrenceDate))) {
    return false;
  }

  if (frequency === "DAILY") {
    return daysBetween(anchorDate, occurrenceDate) % interval === 0;
  }

  if (frequency === "WEEKLY") {
    return weeksBetween(anchorDate, occurrenceDate) % interval === 0;
  }

  if (frequency === "MONTHLY") {
    const anchor = parseDateKey(anchorDate);
    const occurrence = parseDateKey(occurrenceDate);
    const months = (occurrence.getFullYear() - anchor.getFullYear()) * 12 + occurrence.getMonth() - anchor.getMonth();

    return months >= 0 && months % interval === 0 && occurrence.getDate() === anchor.getDate();
  }

  return false;
}

function dayCode(dateKey: string) {
  return ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][parseDateKey(dateKey).getDay()];
}

function daysBetween(startDate: string, endDate: string) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((parseDateKey(endDate).getTime() - parseDateKey(startDate).getTime()) / millisecondsPerDay);
}

function weeksBetween(startDate: string, endDate: string) {
  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);
  start.setDate(start.getDate() - start.getDay());
  end.setDate(end.getDate() - end.getDay());
  return Math.floor(daysBetween(toDateKey(start), toDateKey(end)) / 7);
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function uniqueId(table: "children" | "missions" | "task_templates" | "task_occurrences", baseId: string) {
  assertPool();

  let nextId = baseId;
  let index = 2;

  while (true) {
    const result = await pool!.query(`select 1 from ${table} where id = $1`, [nextId]);

    if (result.rowCount === 0) {
      return nextId;
    }

    nextId = `${baseId}-${index}`;
    index += 1;
  }
}

function assertPool() {
  if (!pool) {
    throw new Error("Database is not configured");
  }
}

async function withDbRetry<T>(operation: () => Promise<T>, retries = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isTransientDbError(error) || attempt === retries) {
        break;
      }

      await sleep(attempt * 250);
    }
  }

  throw lastError;
}

function isTransientDbError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /Connection terminated unexpectedly|ECONNRESET|ETIMEDOUT|ENETUNREACH|Connection ended unexpectedly/i.test(message);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeConnectionString(value?: string) {
  if (!value) {
    return value;
  }

  try {
    const url = new URL(value);
    const sslMode = url.searchParams.get("sslmode");

    if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }
  } catch {
    return value;
  }

  return value;
}

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function familyIdForEmail(email: string) {
  return `family-${slugify(email)}`;
}

async function seedDefaultData() {
  assertPool();

  await pool!.query(
    `
      insert into families (id, name, time_zone, language)
      values ('family-demo', 'Chen Family', 'America/Los_Angeles', '中文')
      on conflict (id) do nothing;

      insert into parents (id, family_id, name, email, provider, password_hash)
      values ('parent-chenli0741-gmail-com', 'family-demo', 'Chen Li', 'chenli0741@gmail.com', 'password', '${hashPassword("123456")}')
      on conflict (email) do update
      set password_hash = coalesce(parents.password_hash, excluded.password_hash);

      insert into children (id, family_id, name, age, grade, pin, companion_name, companion_level, companion_growth)
      values ('caitlyn', 'family-demo', 'Caitlyn', 9, 3, '1234', 'Koko', 1, 0)
      on conflict (id) do nothing;
    `
  );

}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || `item-${createHash("sha1").update(value).digest("hex").slice(0, 8)}`;
}
