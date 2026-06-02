export type MissionCategory = "reading" | "language" | "math" | "music" | "sport" | "entertainment";
export type MissionExecutionType = "completion" | "submission" | "timed";
export type MissionStatus = "done" | "todo" | "in_progress" | "expired";
export type OccurrenceStatus = "pending" | "done" | "skipped" | "expired";

export type RewardRecord = {
  id: string;
  points: number;
  reason: string;
  source: "completion" | "streak" | "bonus" | "parent";
};

export type CompletionRecord = {
  aiScore?: number;
  actualMinutes?: number;
  completedAt?: string;
  endedAt?: string;
  parentConfirmed?: boolean;
  startedAt?: string;
};

export type TaskEventType =
  | "created"
  | "updated"
  | "status_change"
  | "timer_start"
  | "timer_pause"
  | "timer_resume"
  | "timer_end"
  | "completion"
  | "attachment_added";

export type TaskEventRecord = {
  content: string;
  eventType: TaskEventType;
  id: string;
  metadata?: Record<string, unknown>;
  recordedAt: string;
  title: string;
};

export type TaskRun = {
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

export type TaskPlanDetail = {
  attachments: TaskAttachment[];
  id: string;
  materials: string[];
  notes: string;
  summary: string;
  vocabulary: string[];
};

export type TaskAttachment = {
  id: string;
  mimeType?: string;
  name: string;
  size?: number;
  uri: string;
};

export type Mission = {
  id: string;
  templateId: string;
  occurrenceDate: string;
  icon: string;
  title: string;
  category: MissionCategory;
  target: string;
  detail: string;
  goals: string[];
  planDetail: TaskPlanDetail;
  completionRecord?: CompletionRecord;
  rewardRecords: RewardRecord[];
  eventRecords: TaskEventRecord[];
  activeRun?: TaskRun;
  executionType: MissionExecutionType;
  timeLimitMinutes?: number;
  targetApp?: string;
  actualStartAt?: string;
  actualEndAt?: string;
  energy: number;
  progress: number;
  total: number;
  status: MissionStatus;
  occurrenceStatus: OccurrenceStatus;
  tone: string;
};

export const childProfile = {
  name: "Caitlyn",
  age: 9,
  grade: "Grade 3",
  avatar: "Koala",
  todayEnergy: 120,
  companionName: "Koko",
  treeLevel: 3,
  treeGrowth: 64,
  readingStreakDays: 7
};

export const missions: Mission[] = [
  {
    id: "english-reading",
    templateId: "template-english-reading",
    occurrenceDate: "2026-07-01",
    icon: "📘",
    title: "English Reading",
    category: "reading",
    target: "Read 20 min",
    detail: "Charlotte's Web pages 12-15; learn whisper, forest, adventure.",
    goals: ["Read pages 12-15", "Learn 3 new words", "Tell one favorite sentence"],
    planDetail: {
      id: "plan-english-reading",
      attachments: [
        {
          id: "attachment-english-vocab",
          mimeType: "application/pdf",
          name: "Charlotte vocabulary sheet.pdf",
          uri: "https://example.com/charlotte-vocabulary-sheet.pdf"
        }
      ],
      summary: "Charlotte's Web pages 12-15",
      materials: ["Charlotte's Web"],
      notes: "Tell one favorite sentence after reading.",
      vocabulary: ["whisper", "forest", "adventure"]
    },
    completionRecord: {
      actualMinutes: 22,
      aiScore: 85,
      completedAt: "2026-07-01T19:30:00.000Z",
      parentConfirmed: true
    },
    rewardRecords: [{ id: "reward-english-reading", points: 10, reason: "Completed reading", source: "completion" }],
    eventRecords: [],
    executionType: "submission",
    timeLimitMinutes: 20,
    actualStartAt: "2026-07-01T19:08:00.000Z",
    actualEndAt: "2026-07-01T19:30:00.000Z",
    energy: 10,
    progress: 1,
    total: 1,
    status: "done",
    occurrenceStatus: "done",
    tone: "#3F7D58"
  },
  {
    id: "chinese",
    templateId: "template-chinese",
    occurrenceDate: "2026-07-01",
    icon: "🀄",
    title: "Chinese",
    category: "language",
    target: "Poem or Chinese reading",
    detail: "Practice 暖、愿、影 and read one short story aloud.",
    goals: ["Read aloud", "Practice 暖、愿、影", "Explain one new phrase"],
    planDetail: {
      id: "plan-chinese",
      attachments: [],
      summary: "Practice three Chinese characters",
      materials: ["Chinese reader"],
      notes: "Write each character three times.",
      vocabulary: ["暖", "愿", "影"]
    },
    rewardRecords: [],
    eventRecords: [],
    executionType: "submission",
    timeLimitMinutes: 15,
    energy: 10,
    progress: 0,
    total: 1,
    status: "todo",
    occurrenceStatus: "pending",
    tone: "#B75F4A"
  },
  {
    id: "math",
    templateId: "template-math",
    occurrenceDate: "2026-07-01",
    icon: "➕",
    title: "Math",
    category: "math",
    target: "10 questions",
    detail: "Singapore Math workbook page 24, two-digit multiplication.",
    goals: ["Finish page 24", "Check all answers", "Fix mistakes"],
    planDetail: {
      id: "plan-math",
      attachments: [],
      summary: "Singapore Math workbook page 24",
      materials: ["Singapore Math workbook"],
      notes: "Focus on two-digit multiplication and write corrections.",
      vocabulary: []
    },
    rewardRecords: [],
    eventRecords: [],
    executionType: "submission",
    timeLimitMinutes: 10,
    energy: 10,
    progress: 6,
    total: 10,
    status: "in_progress",
    occurrenceStatus: "pending",
    tone: "#4B6FA8"
  },
  {
    id: "piano",
    templateId: "template-piano",
    occurrenceDate: "2026-07-01",
    icon: "🎹",
    title: "Piano",
    category: "music",
    target: "Practice 20 min",
    detail: "Practice assigned piece bars 9-16 with a steady rhythm.",
    goals: ["Warm up", "Practice assigned piece", "Play one part smoothly"],
    planDetail: {
      id: "plan-piano",
      attachments: [],
      summary: "Assigned piece bars 9-16",
      materials: ["Piano book"],
      notes: "Slow tempo first, then play once smoothly.",
      vocabulary: []
    },
    rewardRecords: [],
    eventRecords: [],
    executionType: "submission",
    timeLimitMinutes: 20,
    energy: 10,
    progress: 0,
    total: 1,
    status: "todo",
    occurrenceStatus: "pending",
    tone: "#8B5E83"
  },
  {
    id: "soccer",
    templateId: "template-soccer",
    occurrenceDate: "2026-07-01",
    icon: "⚽",
    title: "Soccer",
    category: "sport",
    target: "Soccer training",
    detail: "Ball control drills: 20 touches, dribble cones, short passing.",
    goals: ["Warm up safely", "Practice ball control", "Drink water after training"],
    planDetail: {
      id: "plan-soccer",
      attachments: [],
      summary: "Ball control and short passing",
      materials: ["Soccer ball", "Cones"],
      notes: "Keep water nearby and stretch after training.",
      vocabulary: []
    },
    rewardRecords: [],
    eventRecords: [],
    executionType: "timed",
    timeLimitMinutes: 1,
    targetApp: "Maps",
    energy: 10,
    progress: 0,
    total: 1,
    status: "todo",
    occurrenceStatus: "pending",
    tone: "#D8892B"
  }
];

export const taskTemplates = missions.map((mission) => ({
  id: mission.id,
  icon: mission.icon,
  title: mission.title,
  category: mission.category,
  target: mission.target,
  energy: mission.energy,
  rrule: "FREQ=DAILY",
  repeat: "Daily"
}));

export const growthStages = [
  { level: 1, title: "Seed", description: "A tiny habit is planted." },
  { level: 2, title: "Sprout", description: "The first routines are showing." },
  { level: 3, title: "Young Tree", description: "Caitlyn is building momentum." },
  { level: 4, title: "Blooming Tree", description: "Steady effort starts to shine." },
  { level: 5, title: "Forest", description: "Habits feel like part of family life." }
];

export const historyStats = {
  todayCompleted: 1,
  totalToday: missions.length,
  weeklyCompletionRate: 76,
  readingStreakDays: 7,
  energyThisWeek: 430
};

export const reminders = [
  { id: "reading", time: "7:00 PM", title: "Reading time is here" },
  { id: "piano", time: "4:30 PM", title: "Piano practice starts soon" },
  { id: "soccer", time: "9:00 AM", title: "Soccer training day" }
];

export const encouragements = [
  "Great job today!",
  "You kept going even when it was hard.",
  "Your growth tree got stronger today.",
  "Small habits make big summer wins."
];

export function getMission(id: string | string[] | undefined) {
  const missionId = Array.isArray(id) ? id[0] : id;
  return missions.find((mission) => mission.id === missionId);
}

export function missionStatusLabel(status: MissionStatus) {
  switch (status) {
    case "done":
      return "Done";
    case "todo":
      return "Todo";
    case "in_progress":
      return "In progress";
    case "expired":
      return "Expired";
  }
}
