export type MissionCategory = "reading" | "language" | "math" | "music" | "sport";
export type MissionStatus = "done" | "todo" | "in_progress";

export type Mission = {
  id: string;
  icon: string;
  title: string;
  category: MissionCategory;
  target: string;
  detail: string;
  goals: string[];
  energy: number;
  progress: number;
  total: number;
  status: MissionStatus;
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
    icon: "📘",
    title: "English Reading",
    category: "reading",
    target: "Read 20 min",
    detail: "Read for 20 minutes and learn 3 new words.",
    goals: ["Read 20 minutes", "Learn 3 new words", "Tell one favorite sentence"],
    energy: 10,
    progress: 1,
    total: 1,
    status: "done",
    tone: "#3F7D58"
  },
  {
    id: "chinese",
    icon: "🀄",
    title: "Chinese",
    category: "language",
    target: "Poem or Chinese reading",
    detail: "Read a Chinese story or practice one short poem.",
    goals: ["Read aloud", "Practice one poem", "Explain one new phrase"],
    energy: 10,
    progress: 0,
    total: 1,
    status: "todo",
    tone: "#B75F4A"
  },
  {
    id: "math",
    icon: "➕",
    title: "Math",
    category: "math",
    target: "10 questions",
    detail: "Finish 10 math questions and check mistakes carefully.",
    goals: ["Finish 10 questions", "Check all answers", "Fix mistakes"],
    energy: 10,
    progress: 6,
    total: 10,
    status: "in_progress",
    tone: "#4B6FA8"
  },
  {
    id: "piano",
    icon: "🎹",
    title: "Piano",
    category: "music",
    target: "Practice 20 min",
    detail: "Practice piano for 20 minutes with a steady rhythm.",
    goals: ["Warm up", "Practice assigned piece", "Play one part smoothly"],
    energy: 10,
    progress: 0,
    total: 1,
    status: "todo",
    tone: "#8B5E83"
  },
  {
    id: "soccer",
    icon: "⚽",
    title: "Soccer",
    category: "sport",
    target: "Soccer training",
    detail: "Do soccer drills or outdoor play with movement.",
    goals: ["Warm up safely", "Practice ball control", "Drink water after training"],
    energy: 10,
    progress: 0,
    total: 1,
    status: "todo",
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
  }
}
