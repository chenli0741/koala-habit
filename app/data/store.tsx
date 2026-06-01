import * as SecureStore from "expo-secure-store";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import {
  addMissionAttachmentApi,
  completeMissionApi,
  createChildApi,
  createMissionApi,
  deleteMissionApi,
  fetchFamily,
  fetchToday,
  loginChildApi,
  loginParentApi,
  MissionEvidence,
  MissionTimerEventPayload,
  recordMissionTimerEventApi,
  registerParentApi,
  signInGoogleParentApi,
  signInParentApi,
  toMissionPayload,
  updateMissionApi
} from "./api";
import { childProfile, Mission, MissionCategory, TaskAttachment, TaskEventType } from "./demo";
import { Language, translate } from "./i18n";

export type ParentAccount = {
  name: string;
  email: string;
  provider: string;
};

export type ChildAccount = {
  id: string;
  name: string;
  age: number;
  grade: number;
  avatar: string;
  pin: string;
  pinLength?: number;
};

type MissionDraft = {
  icon: string;
  title: string;
  category: MissionCategory;
  target: string;
  detail: string;
  goals: string[];
  energy: number;
  timeLimitMinutes?: number;
  total: number;
  tone: string;
};

type KoalaStore = {
  isSessionReady: boolean;
  language: Language;
  parent: ParentAccount | null;
  children: ChildAccount[];
  activeChild: ChildAccount | null;
  missions: Mission[];
  todayEnergy: number;
  completedCount: number;
  loginParent: (email: string, password: string) => Promise<boolean>;
  registerParent: (name: string, email: string, password: string) => Promise<void>;
  signInGoogleParent: (name: string, email: string, idToken?: string) => Promise<void>;
  signInParent: (name: string, email: string) => Promise<void>;
  createChild: (child: Omit<ChildAccount, "id">) => Promise<ChildAccount>;
  loginChild: (childId: string, pin: string) => Promise<boolean>;
  logout: () => void;
  addMission: (draft: MissionDraft) => Promise<void>;
  addMissionAttachment: (missionId: string, attachment: TaskAttachment) => Promise<void>;
  updateMission: (missionId: string, draft: MissionDraft) => Promise<void>;
  deleteMission: (missionId: string) => Promise<void>;
  completeMission: (missionId: string, evidence?: MissionEvidence) => Promise<void>;
  recordMissionTimerEvent: (missionId: string, payload: MissionTimerEventPayload) => Promise<void>;
  getMission: (missionId: string | string[] | undefined) => Mission | undefined;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const KoalaContext = createContext<KoalaStore | null>(null);
const parentSessionKey = "koala.parent.session";

type StoredParentSession = {
  children: ChildAccount[];
  parent: ParentAccount;
};

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || `item-${Date.now()}`;
}

function uniqueMissionId(title: string, existing: Mission[]) {
  const baseId = slugify(title);
  let nextId = baseId;
  let index = 2;

  while (existing.some((mission) => mission.id === nextId)) {
    nextId = `${baseId}-${index}`;
    index += 1;
  }

  return nextId;
}

export function KoalaStoreProvider({ children }: PropsWithChildren) {
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [parent, setParent] = useState<ParentAccount | null>(null);
  const [childAccounts, setChildAccounts] = useState<ChildAccount[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [missionItems, setMissionItems] = useState<Mission[]>([]);
  const [language, setLanguage] = useState<Language>("en");

  const activeChild = childAccounts.find((child) => child.id === activeChildId) ?? null;
  const completedCount = missionItems.filter((mission) => mission.status === "done").length;
  const todayEnergy = missionItems.reduce((sum, mission) => sum + (mission.status === "done" ? mission.energy : 0), 0);

  useEffect(() => {
    let isMounted = true;

    async function loadStoredData() {
      try {
        const storedSession = await readParentSession();

        if (!isMounted) {
          return;
        }

        if (!storedSession) {
          setIsSessionReady(true);
          return;
        }

        setParent(storedSession.parent);
        setChildAccounts(storedSession.children);
        setActiveChildId(null);

        const family = await fetchFamily();

        if (!isMounted) {
          return;
        }

        if (family.parent) {
          setParent(family.parent);
        }

        if (family.children.length > 0) {
          setChildAccounts((current) => mergeChildren(family.children, current));
          await saveParentSession({
            parent: family.parent ?? storedSession.parent,
            children: mergeChildren(family.children, storedSession.children)
          });
        }
      } catch {
        // Keep the stored parent session if the API is not reachable.
      } finally {
        if (isMounted) {
          setIsSessionReady(true);
        }
      }
    }

    void loadStoredData();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<KoalaStore>(
    () => ({
      isSessionReady,
      parent,
      language,
      children: childAccounts,
      activeChild,
      missions: missionItems,
      todayEnergy,
      completedCount,
      loginParent: async (email, password) => {
        try {
          const family = await loginParentApi(email.trim(), password);

          if (!family.parent) {
            return false;
          }

          setParent(family.parent);
          setChildAccounts((current) => mergeChildren(family.children, current));
          setActiveChildId(null);
          setMissionItems([]);
          await saveParentSession({ parent: family.parent, children: family.children });
          return true;
        } catch {
          return false;
        }
      },
      registerParent: async (name, email, password) => {
        const nextParent = { name: name.trim() || "Parent", email: email.trim(), provider: "password" };

        try {
          const family = await registerParentApi(nextParent.name, nextParent.email, password);
          const storedParent = family.parent ?? nextParent;
          setParent(storedParent);
          setActiveChildId(null);
          setMissionItems([]);

          if (family.children.length > 0) {
            setChildAccounts((current) => mergeChildren(family.children, current));
          }

          await saveParentSession({ parent: storedParent, children: family.children });
        } catch {
          setParent(nextParent);
          setActiveChildId(null);
          setMissionItems([]);
          await saveParentSession({ parent: nextParent, children: childAccounts });
        }
      },
      signInGoogleParent: async (name, email, idToken) => {
        const nextParent = { name: name.trim() || "Google Parent", email: email.trim(), provider: "google" };
        setParent(nextParent);

        try {
          const family = await signInGoogleParentApi(nextParent.name, nextParent.email, idToken);
          const storedParent = family.parent ?? nextParent;
          setParent(storedParent);
          setActiveChildId(null);
          setMissionItems([]);

          if (family.children.length > 0) {
            setChildAccounts((current) => mergeChildren(family.children, current));
          }

          await saveParentSession({ parent: storedParent, children: family.children });
        } catch {
          setParent(nextParent);
          setActiveChildId(null);
          setMissionItems([]);
          await saveParentSession({ parent: nextParent, children: childAccounts });
        }
      },
      signInParent: async (name, email) => {
        const nextParent = { name: name.trim() || "Parent", email: email.trim() || "parent@example.com", provider: "Apple" };
        setParent(nextParent);

        try {
          const family = await signInParentApi(nextParent.name, nextParent.email);
          const storedParent = family.parent ?? nextParent;
          setParent(storedParent);
          setActiveChildId(null);
          setMissionItems([]);

          if (family.children.length > 0) {
            setChildAccounts((current) => mergeChildren(family.children, current));
          }

          await saveParentSession({ parent: storedParent, children: family.children });
        } catch {
          setParent(nextParent);
          setActiveChildId(null);
          setMissionItems([]);
          await saveParentSession({ parent: nextParent, children: childAccounts });
        }
      },
      createChild: async (child) => {
        const newChild = { ...child, id: uniqueChildId(child.name, childAccounts) };
        setChildAccounts((current) => [...current, newChild]);

        try {
          const storedChild = await createChildApi(child);
          const nextChildren = replaceOptimisticChild([...childAccounts, newChild], newChild.id, storedChild);
          setChildAccounts(nextChildren);

          if (parent) {
            await saveParentSession({ parent, children: nextChildren });
          }

          return storedChild;
        } catch {
          if (parent) {
            await saveParentSession({ parent, children: [...childAccounts, newChild] });
          }

          return newChild;
        }
      },
      loginChild: async (childId, pin) => {
        const child = childAccounts.find((item) => item.id === childId);

        try {
          const storedChild = await loginChildApi(childId, pin);
          setChildAccounts((current) => mergeChildren([storedChild], current));
          setActiveChildId(storedChild.id);
          const missions = await fetchToday(storedChild.id);

          if (missions.length > 0) {
            setMissionItems(missions);
          }

          return true;
        } catch {
          // Fall through to local demo PIN validation.
        }

        const isValid = Boolean(child && child.pin === pin);

        if (isValid) {
          setActiveChildId(childId);
        }

        return isValid;
      },
      logout: () => {
        setActiveChildId(null);
        setMissionItems([]);
      },
      addMission: async (draft) => {
        const missionId = uniqueMissionId(draft.title, missionItems);
        const localMission = {
          ...draft,
          id: missionId,
          templateId: `template-${missionId}`,
          occurrenceDate: new Date().toISOString().slice(0, 10),
          planDetail: {
            id: `plan-${missionId}`,
            attachments: [],
            materials: [],
            notes: draft.detail,
            summary: draft.detail || draft.target,
            vocabulary: []
          },
          rewardRecords: [],
          eventRecords: [
            taskEvent(missionId, "created", "Task created", `Task "${draft.title}" was created.`, {
              timeLimitMinutes: draft.timeLimitMinutes ?? null
            })
          ],
          progress: 0,
          occurrenceStatus: "pending" as const,
          status: "todo" as const
        };
        setMissionItems((current) => [...current, localMission]);

        try {
          const storedMission = await createMissionApi(
            toMissionPayload(activeChild?.id ?? childAccounts[0]?.id ?? "caitlyn", localMission)
          );
          setMissionItems((current) => current.map((mission) => (mission.id === localMission.id ? storedMission : mission)));
        } catch {
          setMissionItems((current) => current);
        }
      },
      addMissionAttachment: async (missionId, attachment) => {
        setMissionItems((current) =>
          current.map((mission) =>
            mission.id === missionId
              ? {
                  ...mission,
                  planDetail: {
                    ...mission.planDetail,
                    attachments: [...mission.planDetail.attachments, attachment]
                  },
                  eventRecords: [
                    ...mission.eventRecords,
                    taskEvent(mission.id, "attachment_added", "Attachment added", `Attachment "${attachment.name}" was added.`, {
                      attachmentId: attachment.id,
                      mimeType: attachment.mimeType ?? null,
                      size: attachment.size ?? null
                    })
                  ]
                }
              : mission
          )
        );

        try {
          const storedMission = await addMissionAttachmentApi(missionId, attachment);
          setMissionItems((current) => current.map((mission) => (mission.id === missionId ? storedMission : mission)));
        } catch {
          setMissionItems((current) => current);
        }
      },
      updateMission: async (missionId, draft) => {
        const currentMission = missionItems.find((mission) => mission.id === missionId);

        if (!currentMission) {
          return;
        }

        const nextMission = normalizeMissionProgress({
          ...currentMission,
          ...draft,
          eventRecords: [
            ...currentMission.eventRecords,
            taskEvent(missionId, "updated", "Task updated", `Task "${draft.title}" details were updated.`, {
              timeLimitMinutes: draft.timeLimitMinutes ?? null
            })
          ],
          progress: Math.min(currentMission.progress, draft.total)
        });

        setMissionItems((current) => current.map((mission) => (mission.id === missionId ? nextMission : mission)));

        try {
          const storedMission = await updateMissionApi(
            missionId,
            toMissionPayload(activeChild?.id ?? childAccounts[0]?.id ?? "caitlyn", nextMission)
          );
          setMissionItems((current) => current.map((mission) => (mission.id === missionId ? storedMission : mission)));
        } catch {
          setMissionItems((current) => current);
        }
      },
      deleteMission: async (missionId) => {
        const deletedMission = missionItems.find((mission) => mission.id === missionId);
        setMissionItems((current) => current.filter((mission) => mission.id !== missionId));

        try {
          await deleteMissionApi(missionId);
        } catch {
          if (deletedMission) {
            setMissionItems((current) => [...current, deletedMission]);
          }
        }
      },
      completeMission: async (missionId, evidence) => {
        const currentMission = missionItems.find((mission) => mission.id === missionId);
        const completedMission = currentMission
          ? {
              ...currentMission,
              actualStartAt: currentMission.actualStartAt ?? evidence?.startedAt,
              actualEndAt: evidence?.endedAt ?? new Date().toISOString(),
              completionRecord: {
                actualMinutes: evidence?.actualMinutes ?? currentMission.completionRecord?.actualMinutes,
                completedAt: evidence?.endedAt ?? new Date().toISOString(),
                endedAt: evidence?.endedAt ?? new Date().toISOString(),
                parentConfirmed: true,
                startedAt: evidence?.startedAt ?? currentMission.completionRecord?.startedAt
              },
              progress: currentMission.total,
              occurrenceStatus: "done" as const,
              rewardRecords:
                currentMission.rewardRecords.length > 0
                  ? currentMission.rewardRecords
                  : [
                      {
                        id: `reward-${currentMission.id}-${Date.now()}`,
                        points: currentMission.energy,
                        reason: `Completed ${currentMission.title}`,
                        source: "completion" as const
                      }
                    ],
              status: "done" as const
            }
          : null;

        if (completedMission) {
          setMissionItems((current) =>
            current.map((mission) =>
              mission.id === missionId
                ? {
                    ...completedMission,
                    eventRecords: [
                      ...completedMission.eventRecords,
                      taskEvent(missionId, "status_change", "Status changed", "Status changed to done.", { to: "done" }),
                      taskEvent(missionId, "completion", "Task completed", `Task "${completedMission.title}" was completed.`, {
                        actualMinutes: evidence?.actualMinutes ?? null
                      })
                    ]
                  }
                : mission
            )
          );
        }

        try {
          const storedMission = await completeMissionApi(missionId, evidence);
          setMissionItems((current) => current.map((mission) => (mission.id === missionId ? storedMission : mission)));
        } catch {
          setMissionItems((current) => current);
        }
      },
      getMission: (id) => {
        const missionId = Array.isArray(id) ? id[0] : id;
        return missionItems.find((mission) => mission.id === missionId);
      },
      recordMissionTimerEvent: async (missionId, payload) => {
        const recordedAt = new Date().toISOString();
        setMissionItems((current) =>
          current.map((mission) =>
            mission.id === missionId
              ? {
                  ...mission,
                  actualStartAt: payload.eventType === "timer_start" ? mission.actualStartAt ?? recordedAt : mission.actualStartAt,
                  actualEndAt: payload.eventType === "timer_end" ? recordedAt : mission.actualEndAt,
                  eventRecords: [
                    ...mission.eventRecords,
                    {
                      content: timerEventContent(payload.eventType, payload.remainingSeconds),
                      id: `timer-${mission.id}-${payload.eventType}-${Date.now()}`,
                      eventType: payload.eventType,
                      metadata: { remainingSeconds: payload.remainingSeconds },
                      recordedAt,
                      title: timerEventTitle(payload.eventType)
                    }
                  ]
                }
              : mission
          )
        );

        try {
          const storedMission = await recordMissionTimerEventApi(missionId, payload);
          setMissionItems((current) => current.map((mission) => (mission.id === missionId ? storedMission : mission)));
        } catch {
          setMissionItems((current) => current);
        }
      },
      setLanguage,
      t: (key) => translate(language, key)
    }),
    [activeChild, childAccounts, completedCount, isSessionReady, language, missionItems, parent, todayEnergy]
  );

  return <KoalaContext.Provider value={value}>{children}</KoalaContext.Provider>;
}

async function readParentSession() {
  const value = await SecureStore.getItemAsync(parentSessionKey);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredParentSession;
  } catch {
    await SecureStore.deleteItemAsync(parentSessionKey);
    return null;
  }
}

async function saveParentSession(session: StoredParentSession) {
  await SecureStore.setItemAsync(parentSessionKey, JSON.stringify(session));
}

function mergeChildren(incoming: ChildAccount[], current: ChildAccount[]) {
  const byId = new Map<string, ChildAccount>();

  current.forEach((child) => {
    const existing = byId.get(child.id);
    byId.set(child.id, existing ? { ...existing, ...child, pin: child.pin || existing.pin } : child);
  });

  incoming.forEach((child) => {
    const existing = byId.get(child.id);
    byId.set(child.id, existing ? { ...existing, ...child, pin: child.pin || existing.pin } : child);
  });

  return Array.from(byId.values());
}

function replaceOptimisticChild(current: ChildAccount[], optimisticId: string, storedChild: ChildAccount) {
  const next = current.filter((child) => child.id !== optimisticId && child.id !== storedChild.id);

  return mergeChildren([storedChild], next);
}

function uniqueChildId(name: string, existing: ChildAccount[]) {
  const baseId = slugify(name);
  const existingIds = new Set(existing.map((child) => child.id));
  let nextId = baseId;
  let index = 2;

  while (existingIds.has(nextId)) {
    nextId = `${baseId}-${index}`;
    index += 1;
  }

  return nextId;
}

function normalizeMissionProgress(mission: Mission): Mission {
  return {
    ...mission,
    status: mission.progress >= mission.total ? "done" : mission.progress > 0 ? "in_progress" : "todo"
  };
}

function taskEvent(
  missionId: string,
  eventType: TaskEventType,
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

function timerEventTitle(eventType: MissionTimerEventPayload["eventType"]) {
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

function timerEventContent(eventType: MissionTimerEventPayload["eventType"], remainingSeconds?: number) {
  const remainingText = remainingSeconds === undefined ? "" : ` Remaining ${remainingSeconds} seconds.`;
  return `${timerEventTitle(eventType)}.${remainingText}`;
}

export function useKoalaStore() {
  const context = useContext(KoalaContext);

  if (!context) {
    throw new Error("useKoalaStore must be used inside KoalaStoreProvider");
  }

  return context;
}

export function profileForChild(child: ChildAccount | null) {
  if (!child) {
    return childProfile;
  }

  return {
    ...childProfile,
    name: child.name,
    age: child.age,
    grade: `Grade ${child.grade}`,
    avatar: child.avatar
  };
}
