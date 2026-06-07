import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Pool } from "pg";

const childId = "caitlyn";
const startDate = "2026-06-07";
const daysToGenerate = 90;
const workdayRule = "FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR";

const taskTables = [
  "task_app_runs",
  "task_timer_events",
  "task_execution_records",
  "completion_records",
  "task_events",
  "reward_records",
  "task_plan_details",
  "task_occurrence_layouts",
  "task_occurrences",
  "task_runs",
  "task_templates",
  "missions"
];

const templates = [
  {
    icon: "➕",
    title: "新加坡数学",
    category: "Math",
    target: "新加坡数学 60 分钟",
    detail: "每工作日柔性任务：完成新加坡数学学习 1 小时，订正错题。",
    goals: ["完成新加坡数学", "检查答案", "订正错题"],
    repeatRule: workdayRule,
    rewardMinutes: 10,
    energy: 10,
    tone: "#4B6FA8"
  },
  {
    icon: "🀄",
    title: "中文认读和字帖",
    category: "Chinese",
    target: "中文 60 分钟",
    detail: "每工作日柔性任务：每天认读一篇文章，抄写字帖一篇。",
    goals: ["认读一篇文章", "抄写一篇字帖", "圈出新词"],
    repeatRule: workdayRule,
    rewardMinutes: 10,
    energy: 10,
    tone: "#B75F4A"
  },
  {
    icon: "📘",
    title: "iReady 阅读和读后感日记",
    category: "Eng",
    target: "英语 60 分钟",
    detail: "每工作日柔性任务：读 iReady 和书，写一篇读后感和日记。",
    goals: ["完成 iReady 阅读", "读书", "写读后感", "写日记"],
    repeatRule: workdayRule,
    rewardMinutes: 10,
    energy: 10,
    tone: "#3F7D58"
  },
  {
    icon: "🏐",
    title: "排球基础练习",
    category: "Sports",
    target: "排球基础练习 10 分钟",
    detail: "每工作日任务：完成 10 分钟排球基础练习。",
    goals: ["热身", "排球基础练习 10 分钟"],
    repeatRule: workdayRule,
    rewardMinutes: 5,
    energy: 6,
    tone: "#2C7DA0"
  },
  {
    icon: "🏃",
    title: "跑步和晨练",
    category: "Sports",
    target: "跑步和晨练 1 小时",
    detail: "每工作日早晨 7 点完成跑步和晨练 1 小时。",
    goals: ["早晨 7 点开始", "跑步和晨练 1 小时", "拉伸放松"],
    repeatRule: workdayRule,
    scheduledTime: "07:00",
    rewardMinutes: 10,
    energy: 10,
    tone: "#D17A22"
  },
  {
    icon: "💪",
    title: "体能和基本功练习",
    category: "Sports",
    target: "体能和基本功练习 20 分钟",
    detail: "每工作日任务：完成 20 分钟体能和基本功练习。",
    goals: ["核心训练", "基本功练习", "拉伸"],
    repeatRule: workdayRule,
    rewardMinutes: 8,
    energy: 8,
    tone: "#7A6A3A"
  },
  {
    icon: "🏊",
    title: "游泳",
    category: "Sports",
    target: "游泳训练",
    detail: "柔性任务：每周三、周五 17:00 游泳。",
    goals: ["准备泳具", "完成游泳训练", "整理洗澡"],
    repeatRule: "FREQ=WEEKLY;BYDAY=WE,FR",
    scheduledTime: "17:00",
    rewardMinutes: 12,
    energy: 10,
    tone: "#2C7DA0"
  },
  {
    icon: "📺",
    title: "电视和视频",
    category: "Game",
    target: "电视和视频限时 30 分钟",
    detail: "限时任务：每工作日电视和视频 30 分钟。",
    goals: ["开始计时", "30 分钟内结束"],
    repeatRule: workdayRule,
    timeLimitMinutes: 30,
    targetApp: "TV;Video",
    rewardMinutes: 0,
    energy: 0,
    tone: "#6B5B95"
  },
  {
    icon: "🎮",
    title: "游戏和视频",
    category: "Game",
    target: "游戏和视频限时 30 分钟",
    detail: "限时任务：每周一、周三、周五游戏和视频 30 分钟。",
    goals: ["开始计时", "30 分钟内结束"],
    repeatRule: "FREQ=WEEKLY;BYDAY=MO,WE,FR",
    timeLimitMinutes: 30,
    targetApp: "Game;Video",
    rewardMinutes: 0,
    energy: 0,
    tone: "#8B5E83"
  },
  {
    icon: "🌳",
    title: "户外活动",
    category: "Sports",
    target: "户外活动 60 分钟",
    detail: "每工作日柔性任务：完成 1 小时户外活动。",
    goals: ["户外活动 60 分钟", "记录完成情况"],
    repeatRule: workdayRule,
    rewardMinutes: 10,
    energy: 8,
    tone: "#3F7D58"
  },
  {
    icon: "🎹",
    title: "弹钢琴和小叶子辅导",
    category: "Other",
    target: "音乐限时 30 分钟",
    detail: "限时任务：周二、周四各 30 分钟，弹钢琴 + 小叶子辅导。",
    goals: ["弹钢琴", "完成小叶子辅导", "30 分钟内结束"],
    repeatRule: "FREQ=WEEKLY;BYDAY=TU,TH",
    timeLimitMinutes: 30,
    targetApp: "Piano;小叶子",
    rewardMinutes: 10,
    energy: 8,
    tone: "#8B5E83"
  },
  {
    icon: "🎨",
    title: "画啦啦绘画课",
    category: "calendar",
    target: "画啦啦绘画课 19:40-20:30",
    detail: "日程提醒：每周三、周四 19:40-20:30 参加画啦啦绘画课。",
    goals: ["准时上课", "完成课堂内容"],
    repeatRule: "FREQ=WEEKLY;BYDAY=WE,TH",
    scheduledTime: "19:40",
    rewardMinutes: 0,
    energy: 0,
    source: "calendar",
    tone: "#B75F4A"
  },
  {
    icon: "🖼️",
    title: "提交画画作业",
    category: "Other",
    target: "提交画画作业",
    detail: "柔性任务：每周六提交画画作业。",
    goals: ["整理作品", "提交画画作业"],
    repeatRule: "FREQ=WEEKLY;BYDAY=SA",
    rewardMinutes: 8,
    energy: 6,
    tone: "#B75F4A"
  }
];

const envText = readFileSync("server/.env", "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    })
);

function normalizeConnectionString(value) {
  const url = new URL(value);
  const sslMode = url.searchParams.get("sslmode");

  if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
    url.searchParams.set("sslmode", "verify-full");
  }

  return url.toString();
}

function slugify(value) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || `item-${createHash("sha1").update(value).digest("hex").slice(0, 8)}`;
}

function parseDateKey(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateKey, days) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function dayCode(dateKey) {
  return ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][parseDateKey(dateKey).getDay()];
}

function daysBetween(left, right) {
  return Math.floor((parseDateKey(right).getTime() - parseDateKey(left).getTime()) / 86400000);
}

function weeksBetween(left, right) {
  const start = parseDateKey(left);
  const end = parseDateKey(right);
  start.setDate(start.getDate() - start.getDay());
  end.setDate(end.getDate() - end.getDay());
  return Math.floor(daysBetween(toDateKey(start), toDateKey(end)) / 7);
}

function occursOnDate(rule, occurrenceDate, anchorDate) {
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

  return false;
}

const pool = new Pool({
  connectionString: normalizeConnectionString(env.DATABASE_URL),
  ssl: { rejectUnauthorized: false }
});

const client = await pool.connect();

try {
  await client.query("begin");
  await client.query(`truncate table ${taskTables.join(", ")} cascade`);

  for (const template of templates) {
    const templateId = `template-${slugify(template.title)}`;

    await client.query(
      `
        insert into task_templates (
          id, child_id, icon, title, category, default_target, default_goals,
          default_reward_minutes, default_energy, default_total, tone, rrule,
          default_scheduled_time, default_time_limit_minutes, default_target_app, default_source, active
        )
        values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, $14, $15, $16, true)
      `,
      [
        templateId,
        childId,
        template.icon,
        template.title,
        template.category,
        template.target,
        JSON.stringify(template.goals),
        template.rewardMinutes,
        template.energy,
        1,
        template.tone,
        template.repeatRule,
        template.scheduledTime ?? null,
        template.timeLimitMinutes ?? null,
        template.targetApp ?? null,
        template.source ?? "parent"
      ]
    );

    for (let offset = 0; offset < daysToGenerate; offset += 1) {
      const occurrenceDate = addDays(startDate, offset);

      if (!occursOnDate(template.repeatRule, occurrenceDate, startDate)) {
        continue;
      }

      const occurrenceId = `${templateId}-${occurrenceDate}`;
      await client.query(
        `
          insert into task_occurrences (
            id, template_id, child_id, occurrence_date, title, target, scheduled_time,
            time_limit_minutes, target_app, source, progress, total, status
          )
          values ($1, $2, $3, $4::date, $5, $6, $7, $8, $9, $10, 0, 1, 'pending')
        `,
        [
          occurrenceId,
          templateId,
          childId,
          occurrenceDate,
          template.title,
          template.target,
          template.scheduledTime ?? null,
          template.timeLimitMinutes ?? null,
          template.targetApp ?? null,
          template.source ?? "parent"
        ]
      );

      await client.query(
        `
          insert into task_plan_details (id, occurrence_id, summary, goals, notes)
          values ($1, $2, $3, $4::jsonb, $5)
        `,
        [`plan-${occurrenceId}`, occurrenceId, template.detail, JSON.stringify(template.goals), template.detail]
      );
    }
  }

  await client.query("commit");

  const templateCount = await client.query("select count(*)::int as count from task_templates");
  const occurrenceCount = await client.query("select count(*)::int as count from task_occurrences");
  const sample = await client.query(
    `
      select occurrence_date::text as date, array_agg(title order by scheduled_time nulls last, title) as titles
      from task_occurrences
      where child_id = $1 and occurrence_date between $2::date and $3::date
      group by occurrence_date
      order by occurrence_date
    `,
    [childId, startDate, addDays(startDate, 7)]
  );

  console.log(
    JSON.stringify(
      {
        templates: templateCount.rows[0].count,
        occurrences: occurrenceCount.rows[0].count,
        startDate,
        endDate: addDays(startDate, daysToGenerate - 1),
        sample: sample.rows
      },
      null,
      2
    )
  );
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  client.release();
  await pool.end();
}
