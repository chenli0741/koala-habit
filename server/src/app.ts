import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import {
  addMissionAttachment,
  completeMission,
  createOccurrenceFromTemplate,
  createChild,
  createMission,
  createTaskTemplate,
  deleteMission,
  deleteTaskTemplate,
  dbEnabled,
  findChildByPin,
  getChildren,
  getFamily,
  getMissionsForChild,
  getTaskTemplatesForChild,
  getToday,
  initDb,
  loginParent,
  MissionInput,
  pauseTaskRun,
  recordMissionTimerEvent,
  registerParent,
  resetTimedMission,
  finishTaskRun,
  resumeTaskRun,
  startTaskRun,
  updateMission,
  updateTaskTemplate,
  upsertFamilyWithParent
} from "./db.js";

const app = new Hono();

app.use("*", cors());

app.onError((error, c) => {
  if (error instanceof z.ZodError) {
    return c.json(
      {
        error: "Validation failed",
        issues: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      },
      400
    );
  }

  console.error(error);
  return c.json({ error: "Internal server error" }, 500);
});

const family = {
  id: "family-demo",
  name: "Koala Family",
  parent: {
    id: "parent-demo",
    name: "Chen",
    email: "parent@example.com",
    provider: "apple"
  },
  children: [
    {
      id: "caitlyn",
      name: "Caitlyn",
      age: 9,
      grade: 3,
      pinLength: 4,
      companion: {
        name: "Koko",
        level: 3,
        growth: 72
      }
    }
  ]
};

type DemoMission = MissionInput & {
  actualEndAt?: string;
  actualStartAt?: string;
  completionRecord?: {
    actualMinutes?: number;
    completedAt: string;
    endedAt?: string;
    parentConfirmed: boolean;
    startedAt?: string;
  };
  eventRecords?: Array<{ content: string; eventType: string; id: string; metadata?: Record<string, unknown>; recordedAt: string; title: string }>;
  rewardRecords?: Array<{ id: string; points: number; reason: string; source: "completion" | "streak" | "bonus" | "parent" }>;
  activeRun?: {
    actualDurationMinutes?: number;
    completedAt?: string;
    endAt: string;
    id: string;
    notificationId?: string;
    overdue?: boolean;
    overdueMinutes?: number;
    plannedDurationMinutes: number;
    startAt: string;
    status: "running" | "paused" | "completed";
    targetApp?: string;
  };
};

const todayMissions: Array<DemoMission & { id: string }> = [
  {
    id: "english-reading",
    childId: "caitlyn",
    icon: "📘",
    title: "English Reading",
    category: "reading",
    target: "Read 20 min",
    detail: "Read for 20 minutes and learn 3 new words.",
    goals: ["Read 20 minutes", "Learn 3 new words", "Tell one favorite sentence"],
    rewardMinutes: 10,
    timeLimitMinutes: 20,
    energy: 10,
    progress: 1,
    total: 1,
    tone: "#3F7D58",
    status: "done"
  },
  {
    id: "chinese",
    childId: "caitlyn",
    icon: "🀄",
    title: "Chinese",
    category: "language",
    target: "Poem or Chinese reading",
    detail: "Read a Chinese story or practice one short poem.",
    goals: ["Read aloud", "Practice one poem", "Explain one new phrase"],
    rewardMinutes: 10,
    timeLimitMinutes: 15,
    energy: 10,
    progress: 0,
    total: 1,
    tone: "#B75F4A",
    status: "todo"
  },
  {
    id: "math",
    childId: "caitlyn",
    icon: "➕",
    title: "Math",
    category: "math",
    target: "10 questions",
    detail: "Finish 10 math questions and check mistakes carefully.",
    goals: ["Finish 10 questions", "Check all answers", "Fix mistakes"],
    rewardMinutes: 10,
    timeLimitMinutes: 10,
    energy: 10,
    progress: 6,
    total: 10,
    tone: "#4B6FA8",
    status: "in_progress"
  },
  {
    id: "piano",
    childId: "caitlyn",
    icon: "🎹",
    title: "Piano",
    category: "music",
    target: "Practice 20 min",
    detail: "Practice piano for 20 minutes with a steady rhythm.",
    goals: ["Warm up", "Practice assigned piece", "Play one part smoothly"],
    rewardMinutes: 10,
    timeLimitMinutes: 20,
    energy: 10,
    progress: 0,
    total: 1,
    tone: "#8B5E83",
    status: "todo"
  },
  {
    id: "soccer",
    childId: "caitlyn",
    icon: "⚽",
    title: "Soccer",
    category: "sport",
    target: "Soccer training",
    detail: "Do soccer drills or outdoor play with movement.",
    goals: ["Warm up safely", "Practice ball control", "Drink water after training"],
    rewardMinutes: 10,
    timeLimitMinutes: 2,
    targetApp: "Maps",
    energy: 10,
    progress: 0,
    total: 1,
    tone: "#D8892B",
    status: "todo"
  }
];

const parentAppleSchema = z.object({
  identityToken: z.string().min(1),
  email: z.string().email().optional(),
  name: z.string().min(1).optional()
});

const parentGoogleSchema = z.object({
  idToken: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1)
});

const parentRegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6)
});

const parentLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const createChildSchema = z.object({
  name: z.string().min(1),
  grade: z.number().int().min(1).max(6),
  pin: z.string().regex(/^\d{4,6}$/)
});

const childLoginSchema = z.object({
  childId: z.string().min(1),
  pin: z.string().regex(/^\d{4,6}$/)
});

const planAttachmentSchema = z.object({
  id: z.string().min(1),
  mimeType: z.string().optional(),
  name: z.string().min(1),
  size: z.number().int().min(0).optional(),
  uri: z.string().min(1)
});

const createMissionSchema = z.object({
  attachments: z.array(planAttachmentSchema).default([]),
  childId: z.string().min(1),
  icon: z.string().min(1).default("📌"),
  title: z.string().min(1),
  category: z.string().min(1),
  target: z.string().min(1),
  targetApp: z.string().optional(),
  detail: z.string().default(""),
  goals: z.array(z.string()).default([]),
  occurrenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  repeatRule: z.string().min(1).optional(),
  rewardMinutes: z.number().int().default(10),
  energy: z.number().int().default(10),
  progress: z.number().int().min(0).default(0),
  scheduledTime: z.string().optional(),
  timeLimitMinutes: z.number().int().min(1).optional(),
  total: z.number().int().min(1).default(1),
  tone: z.string().min(1).default("#3F7D58"),
  status: z.enum(["done", "todo", "in_progress"]).default("todo")
});

const taskTemplateSchema = z.object({
  active: z.boolean().default(true),
  childId: z.string().min(1),
  icon: z.string().min(1).default("📌"),
  title: z.string().min(1),
  category: z.string().min(1),
  target: z.string().min(1),
  targetApp: z.string().optional(),
  goals: z.array(z.string()).default([]),
  repeatRule: z.string().min(1).default("FREQ=DAILY"),
  rewardMinutes: z.number().int().default(10),
  energy: z.number().int().default(10),
  scheduledTime: z.string().optional(),
  timeLimitMinutes: z.number().int().min(1).optional(),
  total: z.number().int().min(1).default(1),
  tone: z.string().min(1).default("#3F7D58")
});

const createOccurrenceSchema = z.object({
  occurrenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default(new Date().toISOString().slice(0, 10))
});

const completeMissionSchema = z.object({
  actualMinutes: z.number().int().min(0).optional(),
  audioUri: z.string().optional(),
  endedAt: z.string().datetime().optional(),
  photoUri: z.string().optional(),
  note: z.string().optional(),
  startedAt: z.string().datetime().optional()
});

const timerEventSchema = z.object({
  eventType: z.enum(["timer_start", "timer_pause", "timer_resume", "timer_end"]),
  remainingSeconds: z.number().int().min(0).optional()
});

const startTaskRunSchema = z.object({
  endAt: z.string().datetime(),
  notificationId: z.string().optional(),
  plannedDurationMinutes: z.number().int().min(1),
  startAt: z.string().datetime(),
  targetApp: z.string().optional()
});

const finishTaskRunSchema = z.object({
  actualDurationMinutes: z.number().int().min(0),
  completedAt: z.string().datetime(),
  overdue: z.boolean(),
  overdueMinutes: z.number().int().min(0)
});

const pauseTaskRunSchema = z.object({
  actualDurationMinutes: z.number().int().min(0),
  overdue: z.boolean(),
  overdueMinutes: z.number().int().min(0),
  pausedAt: z.string().datetime()
});

const resumeTaskRunSchema = z.object({
  endAt: z.string().datetime(),
  notificationId: z.string().optional(),
  resumedAt: z.string().datetime()
});

app.get("/health", (c) => c.json({ ok: true, db: dbEnabled, service: "koala-habit-server" }));

app.post("/auth/apple/parent", async (c) => {
  const payload = parentAppleSchema.parse(await c.req.json());
  const name = payload.name ?? family.parent.name;
  const email = payload.email ?? family.parent.email;

  if (dbEnabled) {
    const dbFamily = await upsertFamilyWithParent({
      name,
      email,
      provider: "apple"
    });

    return c.json({
      session: {
        token: "demo-parent-apple-session",
        role: "parent",
        provider: "apple"
      },
      family: dbFamily
    });
  }

  return c.json({
    session: {
      token: "demo-parent-apple-session",
      role: "parent",
      provider: "apple"
    },
    family: {
      ...family,
      parent: {
        ...family.parent,
        name,
        email
      }
    }
  });
});

app.post("/auth/google/parent", async (c) => {
  const payload = parentGoogleSchema.parse(await c.req.json());

  if (dbEnabled) {
    const dbFamily = await upsertFamilyWithParent({
      name: payload.name,
      email: payload.email,
      provider: "google"
    });

    return c.json({
      session: {
        token: "demo-parent-session",
        role: "parent",
        provider: "google",
        phase: "later"
      },
      family: dbFamily
    });
  }

  return c.json({
    session: {
      token: "demo-parent-session",
      role: "parent",
      provider: "google",
      phase: "later"
    },
    family: {
      ...family,
      parent: {
        ...family.parent,
        name: payload.name,
        email: payload.email
      }
    }
  });
});

app.post("/auth/register/parent", async (c) => {
  const payload = parentRegisterSchema.parse(await c.req.json());

  if (dbEnabled) {
    const dbFamily = await registerParent({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      provider: "password"
    });

    return c.json(
      {
        session: {
          token: "demo-parent-password-session",
          role: "parent",
          provider: "password"
        },
        family: dbFamily
      },
      201
    );
  }

  return c.json(
    {
      session: {
        token: "demo-parent-password-session",
        role: "parent",
        provider: "password"
      },
      family: {
        ...family,
        parent: {
          ...family.parent,
          name: payload.name,
          email: payload.email,
          provider: "password"
        }
      }
    },
    201
  );
});

app.post("/auth/login/parent", async (c) => {
  const payload = parentLoginSchema.parse(await c.req.json());

  if (dbEnabled) {
    const dbFamily = await loginParent(payload.email, payload.password);

    if (!dbFamily) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    return c.json({
      session: {
        token: "demo-parent-password-session",
        role: "parent",
        provider: "password"
      },
      family: dbFamily
    });
  }

  if (payload.email !== family.parent.email || payload.password.length < 6) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  return c.json({
    session: {
      token: "demo-parent-password-session",
      role: "parent",
      provider: "password"
    },
    family
  });
});

app.get("/families/demo", async (c) => {
  if (dbEnabled) {
    const dbFamily = await getFamily();
    return c.json({ family: dbFamily });
  }

  return c.json({ family });
});

app.get("/families/demo/children", async (c) => {
  if (dbEnabled) {
    return c.json({ children: await getChildren() });
  }

  return c.json({ children: family.children });
});

app.post("/families/demo/children", async (c) => {
  const payload = createChildSchema.parse(await c.req.json());

  if (dbEnabled) {
    return c.json({ child: await createChild({ ...payload, age: 9 }) }, 201);
  }

  const childId = uniqueDemoChildId(payload.name);

  return c.json(
    {
      child: {
        id: childId,
        name: payload.name,
        age: 9,
        grade: payload.grade,
        pinLength: payload.pin.length,
        companion: {
          name: "Koko",
          level: 1,
          growth: 0
        }
      }
    },
    201
  );
});

app.post("/auth/child/pin", async (c) => {
  const payload = childLoginSchema.parse(await c.req.json());

  if (dbEnabled) {
    const child = await findChildByPin(payload.childId, payload.pin);

    if (!child) {
      return c.json({ error: "Invalid child or PIN" }, 401);
    }

    return c.json({
      session: {
        token: "demo-child-session",
        role: "child"
      },
      child
    });
  }

  const child = family.children.find((item) => item.id === payload.childId);

  if (!child || payload.pin !== "1234") {
    return c.json({ error: "Invalid child or PIN" }, 401);
  }

  return c.json({
    session: {
      token: "demo-child-session",
      role: "child"
    },
    child
  });
});

app.get("/families/demo/today", async (c) => {
  const requestedChildId = c.req.query("childId") ?? "caitlyn";

  if (dbEnabled) {
    const today = await getToday(requestedChildId);

    if (today) {
      return c.json(today);
    }
  }

  return c.json({
    child: {
      id: "caitlyn",
      name: "Caitlyn",
      age: 9,
      companion: {
        name: "Koko",
        level: 3,
        growth: 72
      }
    },
    missions: todayMissions,
    rewards: {
      entertainmentMinutesUnlocked: 25,
      pendingParentConfirmations: 1,
      streakDays: 5
    }
  });
});

app.get("/families/demo/missions", async (c) => {
  const requestedChildId = c.req.query("childId") ?? "caitlyn";
  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");
  const range =
    startDate && endDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate) && /^\d{4}-\d{2}-\d{2}$/.test(endDate)
      ? { startDate, endDate }
      : undefined;

  if (dbEnabled) {
    return c.json({ missions: await getMissionsForChild(requestedChildId, range) });
  }

  return c.json({ missions: todayMissions });
});

app.get("/families/demo/templates", async (c) => {
  const requestedChildId = c.req.query("childId") ?? "caitlyn";

  if (dbEnabled) {
    return c.json({ templates: await getTaskTemplatesForChild(requestedChildId) });
  }

  return c.json({
    templates: todayMissions.map((mission) => ({
      id: `template-${mission.id}`,
      childId: mission.childId,
      icon: mission.icon,
      title: mission.title,
      category: mission.category,
      target: mission.target,
      targetApp: mission.targetApp,
      goals: mission.goals,
      rewardMinutes: mission.rewardMinutes,
      timeLimitMinutes: mission.timeLimitMinutes,
      energy: mission.energy,
      total: mission.total,
      tone: mission.tone,
      repeatRule: mission.repeatRule ?? "FREQ=DAILY",
      scheduledTime: mission.scheduledTime ?? "",
      active: true
    }))
  });
});

app.post("/families/demo/templates", async (c) => {
  const payload = taskTemplateSchema.parse(await c.req.json());

  if (dbEnabled) {
    return c.json({ template: await createTaskTemplate(payload) }, 201);
  }

  return c.json({ template: { id: `template-${Date.now()}`, ...payload } }, 201);
});

app.patch("/families/demo/templates/:id", async (c) => {
  const templateId = c.req.param("id");
  const payload = taskTemplateSchema.parse(await c.req.json());

  if (dbEnabled) {
    const template = await updateTaskTemplate(templateId, payload);

    if (!template) {
      return c.json({ error: "Template not found" }, 404);
    }

    return c.json({ template });
  }

  return c.json({ template: { id: templateId, ...payload } });
});

app.delete("/families/demo/templates/:id", async (c) => {
  const templateId = c.req.param("id");

  if (dbEnabled) {
    const deleted = await deleteTaskTemplate(templateId);

    if (!deleted) {
      return c.json({ error: "Template not found" }, 404);
    }

    return c.json({ ok: true });
  }

  return c.json({ ok: true });
});

app.post("/families/demo/templates/:id/occurrences", async (c) => {
  const templateId = c.req.param("id");
  const payload = createOccurrenceSchema.parse(await c.req.json().catch(() => ({})));

  if (dbEnabled) {
    const mission = await createOccurrenceFromTemplate(templateId, payload.occurrenceDate);

    if (!mission) {
      return c.json({ error: "Template not found" }, 404);
    }

    return c.json({ mission }, 201);
  }

  const template = todayMissions.find((mission) => `template-${mission.id}` === templateId);

  if (!template) {
    return c.json({ error: "Template not found" }, 404);
  }

  const mission = {
    ...template,
    id: `${template.id}-${payload.occurrenceDate}`,
    occurrenceDate: payload.occurrenceDate,
    progress: 0,
    status: "todo" as const
  };
  todayMissions.push(mission);
  return c.json({ mission }, 201);
});

app.post("/families/demo/missions", async (c) => {
  const payload = createMissionSchema.parse(await c.req.json());

  if (dbEnabled) {
    return c.json({ mission: await createMission(payload) }, 201);
  }

  const mission = {
    id: payload.title.toLowerCase().replaceAll(/\s+/g, "-"),
    childId: payload.childId,
    icon: payload.icon,
    title: payload.title,
    category: payload.category,
    target: payload.target,
    targetApp: payload.targetApp,
    detail: payload.detail,
    goals: payload.goals,
    rewardMinutes: payload.rewardMinutes,
    timeLimitMinutes: payload.timeLimitMinutes,
    energy: payload.energy,
    progress: payload.progress,
    total: payload.total,
    tone: payload.tone,
    status: payload.status,
    eventRecords: [
      demoEvent(missionIdFromTitle(payload.title), "created", "Task created", `Task "${payload.title || "New task"}" was created.`, {
        status: payload.status,
        targetApp: payload.targetApp ?? null,
        timeLimitMinutes: payload.timeLimitMinutes ?? null
      })
    ],
    planDetail: {
      attachments: payload.attachments,
      goals: payload.goals,
      id: `plan-${payload.title.toLowerCase().replaceAll(/\s+/g, "-")}`,
      materials: [],
      notes: payload.detail,
      summary: payload.detail || payload.target,
      vocabulary: []
    }
  };

  todayMissions.push(mission);
  return c.json({ mission }, 201);
});

app.patch("/families/demo/missions/:id", async (c) => {
  const missionId = c.req.param("id");
  const payload = createMissionSchema.parse(await c.req.json());

  if (dbEnabled) {
    const mission = await updateMission(missionId, payload);

    if (!mission) {
      return c.json({ error: "Mission not found" }, 404);
    }

    return c.json({ mission });
  }

  const index = todayMissions.findIndex((mission) => mission.id === missionId);

  if (index === -1) {
    return c.json({ error: "Mission not found" }, 404);
  }

  const previous = todayMissions[index];
  const nextStatus = payload.status === "done" ? "done" : "pending";
  const previousStatus = previous.status === "done" ? "done" : "pending";
  const mission = {
    ...todayMissions[index],
    ...payload,
    eventRecords: [
      ...(previous.eventRecords ?? []),
      demoEvent(missionId, "updated", "Task updated", `Task "${payload.title}" details were updated.`, {
        scheduledTime: payload.scheduledTime ?? null,
        targetApp: payload.targetApp ?? null,
        timeLimitMinutes: payload.timeLimitMinutes ?? null
      }),
      ...(previousStatus !== nextStatus
        ? [demoEvent(missionId, "status_change", "Status changed", `Status changed from ${previousStatus} to ${nextStatus}.`, { from: previousStatus, to: nextStatus })]
        : [])
    ],
    planDetail: {
      ...(todayMissions[index] as MissionInput & {
        planDetail?: {
          attachments?: Array<z.infer<typeof planAttachmentSchema>>;
        };
      }).planDetail,
      attachments: payload.attachments,
      goals: payload.goals,
      notes: payload.detail,
      summary: payload.detail || payload.target
    }
  };
  todayMissions[index] = mission;

  return c.json({ mission });
});

app.delete("/families/demo/missions/:id", async (c) => {
  const missionId = c.req.param("id");

  if (dbEnabled) {
    const deleted = await deleteMission(missionId);

    if (!deleted) {
      return c.json({ error: "Mission not found" }, 404);
    }

    return c.json({ ok: true });
  }

  const index = todayMissions.findIndex((mission) => mission.id === missionId);

  if (index === -1) {
    return c.json({ error: "Mission not found" }, 404);
  }

  todayMissions.splice(index, 1);
  return c.json({ ok: true });
});

app.post("/families/demo/missions/:id/reset-timer", async (c) => {
  const missionId = c.req.param("id");

  if (dbEnabled) {
    const mission = await resetTimedMission(missionId);

    if (!mission) {
      return c.json({ error: "Mission not found" }, 404);
    }

    return c.json({ mission });
  }

  const mission = todayMissions.find((item) => item.id === missionId);

  if (!mission) {
    return c.json({ error: "Mission not found" }, 404);
  }

  mission.activeRun = undefined;
  mission.actualStartAt = undefined;
  mission.actualEndAt = undefined;
  mission.completionRecord = undefined;
  mission.progress = 0;
  mission.status = "todo";
  mission.rewardRecords = [];
  mission.eventRecords = [
    ...(mission.eventRecords ?? []).filter((event) => !["timer_start", "timer_pause", "timer_resume", "timer_end", "completion"].includes(event.eventType)),
    demoEvent(missionId, "status_change", "Timed task reset", `Timed task "${mission.title}" was reset by parent.`, {
      reset: "timed_task"
    })
  ];

  return c.json({ mission });
});

app.post("/families/demo/missions/:id/complete", async (c) => {
  const missionId = c.req.param("id");
  const payload = completeMissionSchema.parse(await c.req.json().catch(() => ({})));

  if (dbEnabled) {
    const mission = await completeMission(missionId, payload);

    if (!mission) {
      return c.json({ error: "Mission not found" }, 404);
    }

    return c.json({ mission });
  }

  const mission = todayMissions.find((item) => item.id === missionId);

  if (!mission) {
    return c.json({ error: "Mission not found" }, 404);
  }

  const previousStatus = mission.status === "done" ? "done" : "pending";
  mission.status = "done";
  mission.progress = mission.total;
  mission.actualEndAt = payload.endedAt ?? new Date().toISOString();
  mission.completionRecord = {
    actualMinutes: payload.actualMinutes,
    completedAt: mission.actualEndAt,
    endedAt: mission.actualEndAt,
    parentConfirmed: true,
    startedAt: payload.startedAt
  };
  mission.rewardRecords = mission.rewardRecords?.length
    ? mission.rewardRecords
    : [
        {
          id: `reward-${missionId}-${Date.now()}`,
          points: fallbackRewardPoints(mission, false),
          reason: mission.category === "entertainment" ? "Entertainment time used" : `Completed ${mission.title}`,
          source: "completion"
        }
      ];
  mission.eventRecords = [
    ...(mission.eventRecords ?? []),
    ...(previousStatus !== "done"
      ? [demoEvent(missionId, "status_change", "Status changed", `Status changed from ${previousStatus} to done.`, { from: previousStatus, to: "done" })]
      : []),
    {
      content: `Task completed${payload.actualMinutes ? ` in ${payload.actualMinutes} minutes` : ""}.`,
      id: `timer-${missionId}-completion-${Date.now()}`,
      eventType: "completion",
      metadata: { actualMinutes: payload.actualMinutes ?? null, note: payload.note ?? null },
      recordedAt: mission.actualEndAt,
      title: "Task completed"
    }
  ];
  return c.json({ mission });
});

app.post("/families/demo/missions/:id/timer-events", async (c) => {
  const missionId = c.req.param("id");
  const payload = timerEventSchema.parse(await c.req.json());

  if (dbEnabled) {
    const mission = await recordMissionTimerEvent(missionId, payload);

    if (!mission) {
      return c.json({ error: "Mission not found" }, 404);
    }

    return c.json({ mission }, 201);
  }

  const mission = todayMissions.find((item) => item.id === missionId) as
    | (MissionInput & {
        actualEndAt?: string;
        actualStartAt?: string;
        eventRecords?: Array<{ content: string; eventType: string; id: string; metadata?: Record<string, unknown>; recordedAt: string; title: string }>;
      })
    | undefined;

  if (!mission) {
    return c.json({ error: "Mission not found" }, 404);
  }

  const recordedAt = new Date().toISOString();
  mission.actualStartAt = payload.eventType === "timer_start" ? mission.actualStartAt ?? recordedAt : mission.actualStartAt;
  mission.actualEndAt = payload.eventType === "timer_end" ? recordedAt : mission.actualEndAt;
  mission.eventRecords = [
    ...(mission.eventRecords ?? []),
    {
      content: `${timerEventTitle(payload.eventType)}${payload.remainingSeconds === undefined ? "." : ` with ${payload.remainingSeconds} seconds remaining.`}`,
      id: `timer-${missionId}-${payload.eventType}-${Date.now()}`,
      eventType: payload.eventType,
      metadata: { remainingSeconds: payload.remainingSeconds ?? null },
      recordedAt,
      title: timerEventTitle(payload.eventType)
    }
  ];

  return c.json({ mission }, 201);
});

app.post("/families/demo/missions/:id/runs", async (c) => {
  const missionId = c.req.param("id");
  const payload = startTaskRunSchema.parse(await c.req.json());

  if (dbEnabled) {
    const mission = await startTaskRun(missionId, payload);

    if (!mission) {
      return c.json({ error: "Mission not found" }, 404);
    }

    return c.json({ mission }, 201);
  }

  const mission = todayMissions.find((item) => item.id === missionId);

  if (!mission) {
    return c.json({ error: "Mission not found" }, 404);
  }

  if (mission.activeRun?.status === "completed" || mission.eventRecords?.some(isAppRunFinishedEvent)) {
    return c.json({ mission });
  }

  mission.activeRun = {
    id: `run-${missionId}-${Date.now()}`,
    status: "running",
    ...payload
  };
  mission.actualStartAt = payload.startAt;
  mission.eventRecords = [
    ...(mission.eventRecords ?? []),
    demoEvent(missionId, "timer_start", "App run started", `${payload.targetApp ?? "Target app"} started.`, {
      endAt: payload.endAt,
      plannedDurationMinutes: payload.plannedDurationMinutes,
      targetApp: payload.targetApp ?? null
    })
  ];

  return c.json({ mission }, 201);
});

app.post("/families/demo/missions/:id/runs/:runId/pause", async (c) => {
  const missionId = c.req.param("id");
  const runId = c.req.param("runId");
  const payload = pauseTaskRunSchema.parse(await c.req.json());

  if (dbEnabled) {
    const mission = await pauseTaskRun(missionId, runId, payload);

    if (!mission) {
      return c.json({ error: "Task run not found" }, 404);
    }

    return c.json({ mission });
  }

  const mission = todayMissions.find((item) => item.id === missionId);

  if (!mission?.activeRun || mission.activeRun.id !== runId || mission.activeRun.status !== "running") {
    return c.json({ error: "Task run not found" }, 404);
  }

  mission.activeRun = {
    ...mission.activeRun,
    ...payload,
    completedAt: payload.pausedAt,
    status: "paused"
  };
  mission.eventRecords = [
    ...(mission.eventRecords ?? []),
    demoEvent(missionId, "timer_pause", "App run paused", `${mission.targetApp ?? "Target app"} paused after ${payload.actualDurationMinutes} minutes.`, {
      actualDurationMinutes: payload.actualDurationMinutes,
      overdue: payload.overdue,
      overdueMinutes: payload.overdueMinutes,
      targetApp: mission.targetApp ?? null
    })
  ];

  return c.json({ mission });
});

app.post("/families/demo/missions/:id/runs/:runId/resume", async (c) => {
  const missionId = c.req.param("id");
  const runId = c.req.param("runId");
  const payload = resumeTaskRunSchema.parse(await c.req.json());

  if (dbEnabled) {
    const mission = await resumeTaskRun(missionId, runId, payload);

    if (!mission) {
      return c.json({ error: "Task run not found" }, 404);
    }

    return c.json({ mission });
  }

  const mission = todayMissions.find((item) => item.id === missionId);

  if (!mission?.activeRun || mission.activeRun.id !== runId || mission.activeRun.status !== "paused") {
    return c.json({ error: "Task run not found" }, 404);
  }

  mission.activeRun = {
    ...mission.activeRun,
    completedAt: undefined,
    endAt: payload.endAt,
    notificationId: payload.notificationId,
    status: "running"
  };
  mission.eventRecords = [
    ...(mission.eventRecords ?? []),
    demoEvent(missionId, "timer_resume", "App run resumed", `${mission.targetApp ?? "Target app"} timer resumed.`, {
      endAt: payload.endAt,
      targetApp: mission.targetApp ?? null
    })
  ];

  return c.json({ mission });
});

app.post("/families/demo/missions/:id/runs/:runId/finish", async (c) => {
  const missionId = c.req.param("id");
  const runId = c.req.param("runId");
  const payload = finishTaskRunSchema.parse(await c.req.json());

  if (dbEnabled) {
    const mission = await finishTaskRun(missionId, runId, payload);

    if (!mission) {
      return c.json({ error: "Task run not found" }, 404);
    }

    return c.json({ mission });
  }

  const mission = todayMissions.find((item) => item.id === missionId);

  if (!mission?.activeRun || mission.activeRun.id !== runId) {
    return c.json({ error: "Task run not found" }, 404);
  }

  mission.activeRun = {
    ...mission.activeRun,
    ...payload,
    status: "completed"
  };
  mission.actualEndAt = payload.completedAt;
  mission.progress = mission.total;
  mission.status = "done";
  mission.rewardRecords = mission.rewardRecords?.length
    ? mission.rewardRecords
    : [
        {
          id: `reward-${missionId}-${Date.now()}`,
          points: fallbackRewardPoints(mission, payload.overdue),
          reason: payload.overdue ? "Timed task overdue penalty" : mission.category === "entertainment" ? "Entertainment time used" : `Completed ${mission.title}`,
          source: "completion"
        }
      ];
  mission.eventRecords = [
    ...(mission.eventRecords ?? []),
    demoEvent(missionId, "completion", "App run finished", `${mission.targetApp ?? "Target app"} finished in ${payload.actualDurationMinutes} minutes.`, {
      actualDurationMinutes: payload.actualDurationMinutes,
      overdue: payload.overdue,
      overdueMinutes: payload.overdueMinutes,
      targetApp: mission.targetApp ?? null
    })
  ];

  return c.json({ mission });
});

function fallbackRewardPoints(mission: MissionInput, isOverdue: boolean) {
  const basePoints = mission.category === "entertainment" ? -Math.abs(mission.energy) : mission.energy;

  if (mission.timeLimitMinutes && isOverdue) {
    return -Math.abs(basePoints) * 2;
  }

  return basePoints;
}

app.post("/families/demo/missions/:id/attachments", async (c) => {
  const missionId = c.req.param("id");
  const payload = planAttachmentSchema.parse(await c.req.json());

  if (dbEnabled) {
    const mission = await addMissionAttachment(missionId, payload);

    if (!mission) {
      return c.json({ error: "Mission not found" }, 404);
    }

    return c.json({ mission }, 201);
  }

  const mission = todayMissions.find((item) => item.id === missionId);

  if (!mission) {
    return c.json({ error: "Mission not found" }, 404);
  }

  const mutableMission = mission as MissionInput & {
    eventRecords?: DemoMission["eventRecords"];
    planDetail?: {
      attachments?: Array<z.infer<typeof planAttachmentSchema>>;
    };
  };
  mutableMission.planDetail = {
    ...mutableMission.planDetail,
    attachments: [...(mutableMission.planDetail?.attachments ?? []), payload]
  };
  mutableMission.eventRecords = [
    ...((mutableMission as DemoMission).eventRecords ?? []),
    demoEvent(missionId, "attachment_added", "Attachment added", `Attachment "${payload.name}" was added.`, {
      attachmentId: payload.id,
      mimeType: payload.mimeType ?? null,
      size: payload.size ?? null
    })
  ];

  return c.json({ mission: mutableMission }, 201);
});

await initDb();

function uniqueDemoChildId(name: string) {
  const baseId = name.toLowerCase().replaceAll(/\s+/g, "-") || `child-${Date.now()}`;
  const existingIds = new Set(family.children.map((child) => child.id));
  let nextId = baseId;
  let index = 2;

  while (existingIds.has(nextId)) {
    nextId = `${baseId}-${index}`;
    index += 1;
  }

  return nextId;
}

function missionIdFromTitle(title: string) {
  return title.toLowerCase().replaceAll(/\s+/g, "-");
}

function demoEvent(
  missionId: string,
  eventType: string,
  title: string,
  content: string,
  metadata: Record<string, unknown> = {}
) {
  return {
    content,
    eventType,
    id: `event-${missionId}-${eventType}-${Date.now()}`,
    metadata,
    recordedAt: new Date().toISOString(),
    title
  };
}

function isAppRunFinishedEvent(event: { title: string }) {
  return event.title === "App run finished" || event.title === "Entertainment finished";
}

function timerEventTitle(eventType: "timer_start" | "timer_pause" | "timer_resume" | "timer_end") {
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

export default app;
