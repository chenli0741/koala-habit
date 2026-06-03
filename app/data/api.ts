import Constants from "expo-constants";
import { Mission, MissionCategory, MissionExecutionType, TaskAttachment } from "./demo";
import type { ChildAccount, ParentAccount } from "./store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? Constants.expoConfig?.extra?.apiUrl ?? getDefaultApiBaseUrl();

type ServerChild = {
  id: string;
  name: string;
  age: number;
  grade: number;
  pinLength?: number;
};

type ServerMission = {
  childId?: string;
  completionRecord?: {
    actualMinutes?: number;
    aiScore?: number;
    completedAt?: string;
    endedAt?: string;
    parentConfirmed?: boolean;
    startedAt?: string;
  };
  actualEndAt?: string;
  actualStartAt?: string;
  occurrenceDate?: string;
  occurrenceStatus?: "pending" | "done" | "skipped" | "expired";
  id: string;
  icon?: string;
  title: string;
  category: string;
  target: string;
  detail?: string;
  goals?: string[];
  planDetail?: {
    attachments?: Array<{
      id: string;
      mimeType?: string;
      name: string;
      size?: number;
      uri: string;
    }>;
    id: string;
    materials?: string[];
    notes?: string;
    summary?: string;
    vocabulary?: string[];
  };
  rewardRecords?: Array<{
    id: string;
    points: number;
    reason: string;
    source: "completion" | "streak" | "bonus" | "parent";
  }>;
  rewardMinutes?: number;
  eventRecords?: Array<{
    content: string;
    eventType: "created" | "updated" | "status_change" | "timer_start" | "timer_pause" | "timer_resume" | "timer_end" | "completion" | "attachment_added";
    id: string;
    metadata?: Record<string, unknown>;
    recordedAt: string;
    title: string;
  }>;
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
  executionType?: MissionExecutionType;
  timeLimitMinutes?: number;
  targetApp?: string;
  energy: number;
  progress?: number;
  total?: number;
  status: string;
  templateId?: string;
  tone?: string;
};

type MissionPayload = {
  childId: string;
  icon: string;
  title: string;
  category: MissionCategory;
  target: string;
  detail: string;
  goals: string[];
  executionType?: MissionExecutionType;
  rewardMinutes: number;
  timeLimitMinutes?: number;
  targetApp?: string;
  energy: number;
  progress: number;
  total: number;
  status: "done" | "todo" | "in_progress";
  tone: string;
};

export async function fetchFamily() {
  const data = await request<{ family: { parent: ParentAccount | null; children: ServerChild[] } | null }>("/families/demo");

  return {
    parent: data.family?.parent ?? null,
    children: data.family?.children.map(mapChild) ?? []
  };
}

export async function fetchToday(childId: string) {
  const today = todayKey();
  return fetchMissions(childId, today, today);
}

export async function fetchMissions(childId: string, startDate: string, endDate: string) {
  const data = await request<{ missions: ServerMission[] }>(
    `/families/demo/missions?childId=${encodeURIComponent(childId)}&startDate=${startDate}&endDate=${endDate}`
  );
  return data.missions.map(mapMission);
}

export async function signInParentApi(name: string, email: string) {
  const data = await request<{ family: { parent: ParentAccount | null; children: ServerChild[] } }>("/auth/apple/parent", {
    body: JSON.stringify({
      identityToken: "local-demo-token",
      name,
      email
    }),
    method: "POST"
  });

  return {
    parent: data.family.parent,
    children: data.family.children.map(mapChild)
  };
}

export async function registerParentApi(name: string, email: string, password: string) {
  const data = await request<{ family: { parent: ParentAccount | null; children: ServerChild[] } }>("/auth/register/parent", {
    body: JSON.stringify({
      name,
      email,
      password
    }),
    method: "POST"
  });

  return {
    parent: data.family.parent,
    children: data.family.children.map(mapChild)
  };
}

export async function loginParentApi(email: string, password: string) {
  const data = await request<{ family: { parent: ParentAccount | null; children: ServerChild[] } }>("/auth/login/parent", {
    body: JSON.stringify({
      email,
      password
    }),
    method: "POST"
  });

  return {
    parent: data.family.parent,
    children: data.family.children.map(mapChild)
  };
}

export async function signInGoogleParentApi(name: string, email: string, idToken = "local-google-demo-token") {
  const data = await request<{ family: { parent: ParentAccount | null; children: ServerChild[] } }>("/auth/google/parent", {
    body: JSON.stringify({
      idToken,
      name,
      email
    }),
    method: "POST"
  });

  return {
    parent: data.family.parent,
    children: data.family.children.map(mapChild)
  };
}

export async function createChildApi(child: Omit<ChildAccount, "id">) {
  const data = await request<{ child: ServerChild }>("/families/demo/children", {
    body: JSON.stringify({
      name: child.name,
      grade: child.grade,
      pin: child.pin
    }),
    method: "POST"
  });

  return {
    ...mapChild(data.child),
    avatar: child.avatar,
    pin: child.pin
  };
}

export async function loginChildApi(childId: string, pin: string) {
  const data = await request<{ child: ServerChild }>("/auth/child/pin", {
    body: JSON.stringify({ childId, pin }),
    method: "POST"
  });

  return mapChild(data.child);
}

export async function createMissionApi(payload: MissionPayload) {
  const data = await request<{ mission: ServerMission }>("/families/demo/missions", {
    body: JSON.stringify(payload),
    method: "POST"
  });

  return mapMission(data.mission);
}

export async function updateMissionApi(missionId: string, payload: MissionPayload) {
  const data = await request<{ mission: ServerMission }>(`/families/demo/missions/${missionId}`, {
    body: JSON.stringify(payload),
    method: "PATCH"
  });

  return mapMission(data.mission);
}

export async function deleteMissionApi(missionId: string) {
  await request<{ ok: true }>(`/families/demo/missions/${missionId}`, {
    method: "DELETE"
  });
}

export type MissionEvidence = {
  audioUri?: string;
  actualMinutes?: number;
  endedAt?: string;
  note?: string;
  photoUri?: string;
  startedAt?: string;
};

export type MissionTimerEventPayload = {
  eventType: "timer_start" | "timer_pause" | "timer_resume" | "timer_end";
  remainingSeconds?: number;
};

export type StartEntertainmentRunPayload = {
  endAt: string;
  notificationId?: string;
  plannedDurationMinutes: number;
  startAt: string;
  targetApp?: string;
};

export type FinishEntertainmentRunPayload = {
  actualDurationMinutes: number;
  completedAt: string;
  overdue: boolean;
  overdueMinutes: number;
};

export type PauseEntertainmentRunPayload = {
  actualDurationMinutes: number;
  overdue: boolean;
  overdueMinutes: number;
  pausedAt: string;
};

export type ResumeEntertainmentRunPayload = {
  endAt: string;
  notificationId?: string;
  resumedAt: string;
};

export async function completeMissionApi(missionId: string, evidence?: MissionEvidence) {
  const data = await request<{ mission: ServerMission }>(`/families/demo/missions/${missionId}/complete`, {
    body: JSON.stringify(evidence ?? {}),
    method: "POST"
  });

  return mapMission(data.mission);
}

export async function recordMissionTimerEventApi(missionId: string, payload: MissionTimerEventPayload) {
  const data = await request<{ mission: ServerMission }>(`/families/demo/missions/${missionId}/timer-events`, {
    body: JSON.stringify(payload),
    method: "POST"
  });

  return mapMission(data.mission);
}

export async function startEntertainmentRunApi(missionId: string, payload: StartEntertainmentRunPayload) {
  const data = await request<{ mission: ServerMission }>(`/families/demo/missions/${missionId}/runs`, {
    body: JSON.stringify(payload),
    method: "POST"
  });

  return mapMission(data.mission);
}

export async function finishEntertainmentRunApi(missionId: string, runId: string, payload: FinishEntertainmentRunPayload) {
  const data = await request<{ mission: ServerMission }>(`/families/demo/missions/${missionId}/runs/${runId}/finish`, {
    body: JSON.stringify(payload),
    method: "POST"
  });

  return mapMission(data.mission);
}

export async function pauseEntertainmentRunApi(missionId: string, runId: string, payload: PauseEntertainmentRunPayload) {
  const data = await request<{ mission: ServerMission }>(`/families/demo/missions/${missionId}/runs/${runId}/pause`, {
    body: JSON.stringify(payload),
    method: "POST"
  });

  return mapMission(data.mission);
}

export async function resumeEntertainmentRunApi(missionId: string, runId: string, payload: ResumeEntertainmentRunPayload) {
  const data = await request<{ mission: ServerMission }>(`/families/demo/missions/${missionId}/runs/${runId}/resume`, {
    body: JSON.stringify(payload),
    method: "POST"
  });

  return mapMission(data.mission);
}

export async function addMissionAttachmentApi(missionId: string, attachment: TaskAttachment) {
  const data = await request<{ mission: ServerMission }>(`/families/demo/missions/${missionId}/attachments`, {
    body: JSON.stringify(attachment),
    method: "POST"
  });

  return mapMission(data.mission);
}

export function toMissionPayload(childId: string, draft: Omit<Mission, "id">): MissionPayload {
  return {
    childId,
    icon: draft.icon,
    title: draft.title,
    category: draft.category,
    target: draft.target,
    targetApp: draft.targetApp,
    executionType: draft.executionType,
    detail: draft.detail,
    goals: draft.goals,
    rewardMinutes: draft.energy,
    timeLimitMinutes: draft.timeLimitMinutes,
    energy: draft.energy,
    progress: draft.progress,
    total: draft.total,
    status: draft.status === "expired" ? "todo" : draft.status,
    tone: draft.tone
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function getDefaultApiBaseUrl() {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];

  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:8787`;
  }

  return "http://localhost:8787";
}

function todayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function mapChild(child: ServerChild): ChildAccount {
  return {
    id: child.id,
    name: child.name,
    age: child.age,
    grade: child.grade,
    avatar: "Koala",
    pin: "",
    pinLength: child.pinLength
  };
}

function mapMission(mission: ServerMission): Mission {
  const target = mission.target;
  const planSummary = mission.planDetail?.summary ?? mission.detail ?? target;

  return {
    id: mission.id,
    templateId: mission.templateId ?? mission.id,
    occurrenceDate: mission.occurrenceDate ?? new Date().toISOString().slice(0, 10),
    icon: mission.icon ?? "📌",
    title: mission.title,
    category: mission.category as MissionCategory,
    target,
    detail: mission.detail ?? planSummary,
    goals: mission.goals?.length ? mission.goals : [target],
    planDetail: {
      id: mission.planDetail?.id ?? `plan-${mission.id}`,
      attachments: mission.planDetail?.attachments ?? [],
      materials: mission.planDetail?.materials ?? [],
      notes: mission.planDetail?.notes ?? "",
      summary: planSummary,
      vocabulary: mission.planDetail?.vocabulary ?? []
    },
    completionRecord: mission.completionRecord,
    rewardRecords: mission.rewardRecords ?? [],
    eventRecords: mission.eventRecords ?? [],
    activeRun: mission.activeRun,
    executionType: mission.executionType ?? inferExecutionType(mission),
    timeLimitMinutes: demoTimeLimitForMission(mission.title) ?? mission.timeLimitMinutes,
    targetApp: mission.targetApp ?? demoTargetAppForMission(mission.title),
    actualStartAt: mission.actualStartAt,
    actualEndAt: mission.actualEndAt,
    energy: mission.energy,
    progress: mission.progress ?? (mission.status === "done" ? mission.total ?? 1 : 0),
    total: mission.total ?? 1,
    status: mission.status as Mission["status"],
    occurrenceStatus: mission.occurrenceStatus ?? (mission.status === "done" ? "done" : "pending"),
    tone: mission.tone ?? "#3F7D58"
  };
}

function inferExecutionType(mission: Pick<ServerMission, "category" | "targetApp" | "timeLimitMinutes" | "title">): MissionExecutionType {
  if (mission.targetApp || demoTargetAppForMission(mission.title)) {
    return "timed";
  }

  if (mission.timeLimitMinutes && (mission.category === "entertainment" || mission.category === "Movies" || mission.category === "Game")) {
    return "timed";
  }

  if (["reading", "language", "math", "music", "chinese", "english", "Math", "Chinese", "Eng"].includes(mission.category)) {
    return "submission";
  }

  return "completion";
}

function demoTargetAppForMission(title: string) {
  if (title === "日常体能训练" || title === "电视时间" || title === "Soccer") {
    return title === "电视时间" ? "Maps;Youtobe" : "Maps";
  }

  return undefined;
}

function demoTimeLimitForMission(title: string) {
  if (title === "日常体能训练" || title === "电视时间" || title === "Soccer") {
    return 1;
  }

  return undefined;
}
