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
  registerParent,
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

const todayMissions: Array<MissionInput & { id: string }> = [
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
  detail: z.string().default(""),
  goals: z.array(z.string()).default([]),
  occurrenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  repeatRule: z.string().min(1).optional(),
  rewardMinutes: z.number().int().min(0).default(10),
  energy: z.number().int().min(0).default(10),
  progress: z.number().int().min(0).default(0),
  scheduledTime: z.string().optional(),
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
  goals: z.array(z.string()).default([]),
  repeatRule: z.string().min(1).default("FREQ=DAILY"),
  rewardMinutes: z.number().int().min(0).default(10),
  energy: z.number().int().min(0).default(10),
  scheduledTime: z.string().optional(),
  total: z.number().int().min(1).default(1),
  tone: z.string().min(1).default("#3F7D58")
});

const createOccurrenceSchema = z.object({
  occurrenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default(new Date().toISOString().slice(0, 10))
});

const completeMissionSchema = z.object({
  audioUri: z.string().optional(),
  photoUri: z.string().optional(),
  note: z.string().optional()
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
      goals: mission.goals,
      rewardMinutes: mission.rewardMinutes,
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
    detail: payload.detail,
    goals: payload.goals,
    rewardMinutes: payload.rewardMinutes,
    energy: payload.energy,
    progress: payload.progress,
    total: payload.total,
    tone: payload.tone,
    status: payload.status,
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

  const mission = {
    ...todayMissions[index],
    ...payload,
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

  mission.status = "done";
  mission.progress = mission.total;
  return c.json({ mission });
});

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
    planDetail?: {
      attachments?: Array<z.infer<typeof planAttachmentSchema>>;
    };
  };
  mutableMission.planDetail = {
    ...mutableMission.planDetail,
    attachments: [...(mutableMission.planDetail?.attachments ?? []), payload]
  };

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

export default app;
