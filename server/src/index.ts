import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono();

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

const todayMissions = [
  {
    id: "english-reading",
    childId: "caitlyn",
    title: "English Reading",
    category: "reading",
    target: "Read 20 min",
    rewardMinutes: 10,
    energy: 10,
    status: "done"
  },
  {
    id: "chinese",
    childId: "caitlyn",
    title: "Chinese",
    category: "language",
    target: "Poem or Chinese reading",
    rewardMinutes: 10,
    energy: 10,
    status: "todo"
  },
  {
    id: "math",
    childId: "caitlyn",
    title: "Math",
    category: "math",
    target: "10 questions",
    rewardMinutes: 10,
    energy: 10,
    status: "in_progress"
  },
  {
    id: "piano",
    childId: "caitlyn",
    title: "Piano",
    category: "music",
    target: "Practice 20 min",
    rewardMinutes: 10,
    energy: 10,
    status: "todo"
  },
  {
    id: "soccer",
    childId: "caitlyn",
    title: "Soccer",
    category: "sport",
    target: "Soccer training",
    rewardMinutes: 10,
    energy: 10,
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

const createChildSchema = z.object({
  name: z.string().min(1),
  grade: z.number().int().min(1).max(6),
  pin: z.string().regex(/^\d{4,6}$/)
});

const childLoginSchema = z.object({
  childId: z.string().min(1),
  pin: z.string().regex(/^\d{4,6}$/)
});

app.get("/health", (c) => c.json({ ok: true, service: "koala-habit-server" }));

app.post("/auth/apple/parent", async (c) => {
  const payload = parentAppleSchema.parse(await c.req.json());
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
        name: payload.name ?? family.parent.name,
        email: payload.email ?? family.parent.email
      }
    }
  });
});

app.post("/auth/google/parent", async (c) => {
  const payload = parentGoogleSchema.parse(await c.req.json());
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

app.get("/families/demo/children", (c) => c.json({ children: family.children }));

app.post("/families/demo/children", async (c) => {
  const payload = createChildSchema.parse(await c.req.json());
  return c.json(
    {
      child: {
        id: payload.name.toLowerCase().replaceAll(/\s+/g, "-"),
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

app.get("/families/demo/today", (c) =>
  c.json({
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
  })
);

serve(
  {
    fetch: app.fetch,
    port: 8787
  },
  (info) => {
    console.log(`Koala Habit API listening on http://localhost:${info.port}`);
  }
);
