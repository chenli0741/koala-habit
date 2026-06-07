import * as SecureStore from "expo-secure-store";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import {
  addMissionAttachmentApi,
  cancelMissionApi,
  completeMissionApi,
  createChildApi,
  createFamilyApi,
  createMissionApi,
  deleteMissionApi,
  fetchFamily,
  fetchToday,
  finishEntertainmentRunApi,
  FinishEntertainmentRunPayload,
  loginChildApi,
  loginParentApi,
  MissionEvidence,
  MissionTimerEventPayload,
  pauseEntertainmentRunApi,
  PauseEntertainmentRunPayload,
  recordMissionTimerEventApi,
  registerParentApi,
  resumeEntertainmentRunApi,
  ResumeEntertainmentRunPayload,
  signInGoogleParentApi,
  signInParentApi,
  startEntertainmentRunApi,
  StartEntertainmentRunPayload,
  toMissionPayload,
  updateChildApi,
  updateMissionLayoutApi,
  updateMissionApi
} from "./api";
import { childProfile, Mission, MissionCategory, MissionExecutionType, TaskAttachment, TaskEventType } from "./demo";
import { Language, translate } from "./i18n";

export type ParentAccount = {
  id?: string;
  name: string;
  email: string;
  provider: string;
};

export type FamilyAccount = {
  id: string;
  language: string;
  name: string;
  timeZone: string;
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
  targetApp?: string;
  executionType?: MissionExecutionType;
  detail: string;
  goals: string[];
  energy: number;
  occurrenceDate?: string;
  repeatRule?: string;
  scheduledTime?: string;
  source?: string;
  timeLimitMinutes?: number;
  total: number;
  tone: string;
};

type KoalaStore = {
  isSessionReady: boolean;
  language: Language;
  parent: ParentAccount | null;
  family: FamilyAccount | null;
  children: ChildAccount[];
  activeChild: ChildAccount | null;
  missions: Mission[];
  todayEnergy: number;
  completedCount: number;
  loginParent: (email: string, password: string) => Promise<{ hasChildren: boolean } | null>;
  registerParent: (name: string, email: string, password: string) => Promise<void>;
  createFamily: (name: string, timeZone: string, language: string) => Promise<void>;
  signInGoogleParent: (name: string, email: string, idToken?: string) => Promise<void>;
  signInParent: (name: string, email: string) => Promise<{ hasChildren: boolean }>;
  createChild: (child: Omit<ChildAccount, "id">) => Promise<ChildAccount>;
  updateChild: (childId: string, child: Partial<Omit<ChildAccount, "id">>) => Promise<ChildAccount | null>;
  loginChild: (childId: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addMission: (draft: MissionDraft) => Promise<void>;
  addMissionAttachment: (missionId: string, attachment: TaskAttachment) => Promise<void>;
  updateMission: (missionId: string, draft: MissionDraft) => Promise<void>;
  updateMissionLayout: (layout: Array<{ id: string; layoutColumn: "primary" | "secondary"; layoutOrder: number }>) => Promise<void>;
  deleteMission: (missionId: string) => Promise<void>;
  cancelMission: (missionId: string) => Promise<void>;
  completeMission: (missionId: string, evidence?: MissionEvidence) => Promise<void>;
  recordMissionTimerEvent: (missionId: string, payload: MissionTimerEventPayload) => Promise<void>;
  startEntertainmentRun: (missionId: string, payload: StartEntertainmentRunPayload) => Promise<void>;
  finishEntertainmentRun: (missionId: string, runId: string, payload: FinishEntertainmentRunPayload) => Promise<void>;
  pauseEntertainmentRun: (missionId: string, runId: string, payload: PauseEntertainmentRunPayload) => Promise<void>;
  resumeEntertainmentRun: (missionId: string, runId: string, payload: ResumeEntertainmentRunPayload) => Promise<void>;
  getMission: (missionId: string | string[] | undefined) => Mission | undefined;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const KoalaContext = createContext<KoalaStore | null>(null);
const parentSessionKey = "koala.parent.session";

type StoredParentSession = {
  children: ChildAccount[];
  family: FamilyAccount | null;
  parent: ParentAccount;
  token?: string;
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
  const [family, setFamily] = useState<FamilyAccount | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
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

        const storedFamily = storedSession.family ?? pendingFamilyForParent(storedSession.parent);
        setParent(storedSession.parent);
        setFamily(storedFamily);
        setSessionToken(storedSession.token ?? null);
        setChildAccounts(storedSession.children);
        setActiveChildId(null);

        const family = await fetchFamily(storedFamily.id);

        if (!isMounted) {
          return;
        }

        if (family.parent) {
          setParent(family.parent);
        }

        setFamily(familySummary(family));

        if (family.children.length > 0) {
          setChildAccounts((current) => mergeChildren(family.children, current));
          await saveParentSession({
            token: storedSession.token,
            family: familySummary(family),
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
      family,
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
            return null;
          }

          setParent(family.parent);
          setFamily(familySummary(family));
          setSessionToken(family.token);
          setChildAccounts((current) => mergeChildren(family.children, current));
          setActiveChildId(null);
          setMissionItems([]);
          await saveParentSession({ token: family.token, family: familySummary(family), parent: family.parent, children: family.children });
          return { hasChildren: family.children.length > 0 };
        } catch {
          return null;
        }
      },
      registerParent: async (name, email, password) => {
        const nextParent = { name: name.trim() || "Parent", email: email.trim(), provider: "password" };

        try {
          const family = await registerParentApi(nextParent.name, nextParent.email, password);
          const storedParent = family.parent ?? nextParent;
          setParent(storedParent);
          setFamily(familySummary(family));
          setSessionToken(family.token);
          setActiveChildId(null);
          setMissionItems([]);
          setChildAccounts(family.children);

          await saveParentSession({ token: family.token, family: familySummary(family), parent: storedParent, children: family.children });
        } catch {
          const nextFamily = pendingFamilyForParent(nextParent);
          setParent(nextParent);
          setFamily(nextFamily);
          setSessionToken("local-parent-password-session");
          setChildAccounts([]);
          setActiveChildId(null);
          setMissionItems([]);
          await saveParentSession({ token: "local-parent-password-session", family: nextFamily, parent: nextParent, children: [] });
        }
      },
      createFamily: async (name, timeZone, familyLanguage) => {
        if (!parent) {
          throw new Error("Parent session is required before creating a family.");
        }

        const currentFamily = family ?? pendingFamilyForParent(parent);
        const nextFamily = {
          id: currentFamily.id,
          language: familyLanguage,
          name: name.trim(),
          timeZone
        };

        setFamily(nextFamily);

        try {
          const storedFamily = await createFamilyApi(nextFamily.id, nextFamily.name, nextFamily.timeZone, nextFamily.language);
          const savedFamily = familySummary(storedFamily);
          setFamily(savedFamily);
          await saveParentSession({ token: sessionToken ?? undefined, family: savedFamily, parent, children: childAccounts });
        } catch {
          await saveParentSession({ token: sessionToken ?? undefined, family: nextFamily, parent, children: childAccounts });
        }
      },
      signInGoogleParent: async (name, email, idToken) => {
        const nextParent = { name: name.trim() || "Google Parent", email: email.trim(), provider: "google" };
        setParent(nextParent);

        try {
          const family = await signInGoogleParentApi(nextParent.name, nextParent.email, idToken);
          const storedParent = family.parent ?? nextParent;
          setParent(storedParent);
          setFamily(familySummary(family));
          setSessionToken(family.token);
          setActiveChildId(null);
          setMissionItems([]);

          if (family.children.length > 0) {
            setChildAccounts((current) => mergeChildren(family.children, current));
          }

          await saveParentSession({ token: family.token, family: familySummary(family), parent: storedParent, children: family.children });
        } catch {
          const nextFamily = pendingFamilyForParent(nextParent);
          setParent(nextParent);
          setFamily(nextFamily);
          setSessionToken("local-google-parent-session");
          setActiveChildId(null);
          setMissionItems([]);
          await saveParentSession({ token: "local-google-parent-session", family: nextFamily, parent: nextParent, children: childAccounts });
        }
      },
      signInParent: async (name, email) => {
        const nextParent = { name: name.trim() || "Parent", email: email.trim() || "parent@example.com", provider: "Apple" };
        setParent(nextParent);

        try {
          const family = await signInParentApi(nextParent.name, nextParent.email);
          const storedParent = family.parent ?? nextParent;
          setParent(storedParent);
          setFamily(familySummary(family));
          setSessionToken(family.token);
          setActiveChildId(null);
          setMissionItems([]);

          if (family.children.length > 0) {
            setChildAccounts((current) => mergeChildren(family.children, current));
          }

          await saveParentSession({ token: family.token, family: familySummary(family), parent: storedParent, children: family.children });
          return { hasChildren: family.children.length > 0 };
        } catch {
          const nextFamily = pendingFamilyForParent(nextParent);
          setParent(nextParent);
          setFamily(nextFamily);
          setSessionToken("local-apple-parent-session");
          setActiveChildId(null);
          setMissionItems([]);
          await saveParentSession({ token: "local-apple-parent-session", family: nextFamily, parent: nextParent, children: childAccounts });
          return { hasChildren: childAccounts.length > 0 };
        }
      },
      createChild: async (child) => {
        const newChild = { ...child, id: uniqueChildId(child.name, childAccounts) };
        setChildAccounts((current) => [...current, newChild]);

        try {
          const storedChild = await createChildApi(family?.id ?? "demo", child);
          const nextChildren = replaceOptimisticChild([...childAccounts, newChild], newChild.id, storedChild);
          setChildAccounts(nextChildren);
          setActiveChildId(storedChild.id);

          if (parent) {
            await saveParentSession({ token: sessionToken ?? undefined, family, parent, children: nextChildren });
          }

          return storedChild;
        } catch {
          if (parent) {
            await saveParentSession({ token: sessionToken ?? undefined, family, parent, children: [...childAccounts, newChild] });
          }

          setActiveChildId(newChild.id);
          return newChild;
        }
      },
      updateChild: async (childId, child) => {
        const currentChild = childAccounts.find((item) => item.id === childId);

        if (!currentChild) {
          return null;
        }

        const optimisticChild = {
          ...currentChild,
          ...child,
          pinLength: child.pin ? child.pin.length : currentChild.pinLength
        };
        const optimisticChildren = childAccounts.map((item) => (item.id === childId ? optimisticChild : item));
        setChildAccounts(optimisticChildren);

        try {
          const storedChild = await updateChildApi(family?.id ?? "demo", childId, child);
          const nextChild = {
            ...optimisticChild,
            ...storedChild,
            avatar: child.avatar ?? storedChild.avatar,
            pin: child.pin ?? optimisticChild.pin
          };
          const nextChildren = optimisticChildren.map((item) => (item.id === childId ? nextChild : item));
          setChildAccounts(nextChildren);

          if (parent) {
            await saveParentSession({ token: sessionToken ?? undefined, family, parent, children: nextChildren });
          }

          return nextChild;
        } catch {
          if (parent) {
            await saveParentSession({ token: sessionToken ?? undefined, family, parent, children: optimisticChildren });
          }

          return optimisticChild;
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
        setParent(null);
        setFamily(null);
        setSessionToken(null);
        setChildAccounts([]);
        setActiveChildId(null);
        setMissionItems([]);
        return deleteSessionValue();
      },
      addMission: async (draft) => {
        const missionId = uniqueMissionId(draft.title, missionItems);
        const executionType = draft.executionType ?? inferDraftExecutionType(draft);
        const localMission = {
          ...draft,
          executionType,
          id: missionId,
          templateId: `template-${missionId}`,
          occurrenceDate: draft.occurrenceDate ?? new Date().toISOString().slice(0, 10),
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
      updateMissionLayout: async (layout) => {
        const layoutById = new Map(layout.map((item) => [item.id, item]));
        setMissionItems((current) => applyMissionLayout(current, layoutById));

        try {
          const childId = activeChild?.id ?? childAccounts[0]?.id ?? "caitlyn";
          const occurrenceDate = missionItems.find((mission) => layoutById.has(mission.id))?.occurrenceDate.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
          const storedMissions = await updateMissionLayoutApi(childId, occurrenceDate, layout);
          const storedById = new Map(storedMissions.map((mission) => [mission.id, mission]));
          setMissionItems((current) => current.map((mission) => storedById.get(mission.id) ?? mission));
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
      cancelMission: async (missionId) => {
        const recordedAt = new Date().toISOString();
        setMissionItems((current) =>
          current.map((mission) =>
            mission.id === missionId
              ? {
                  ...mission,
                  activeRun: undefined,
                  actualEndAt: recordedAt,
                  eventRecords: [
                    ...mission.eventRecords,
                    taskEvent(missionId, "cancelled", "Task cancelled", `Task "${mission.title}" was cancelled.`, { status: "skipped" })
                  ],
                  occurrenceStatus: "skipped" as const,
                  status: "cancelled" as const
                }
              : mission
          )
        );

        try {
          const storedMission = await cancelMissionApi(missionId);
          setMissionItems((current) => current.map((mission) => (mission.id === missionId ? storedMission : mission)));
        } catch {
          setMissionItems((current) => current);
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
                audioUri: evidence?.audioUri ?? currentMission.completionRecord?.audioUri,
                completedAt: evidence?.endedAt ?? new Date().toISOString(),
                endedAt: evidence?.endedAt ?? new Date().toISOString(),
                parentConfirmed: true,
                photoUri: evidence?.photoUri ?? currentMission.completionRecord?.photoUri,
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
                  activeRun:
                    payload.eventType === "timer_end" && mission.activeRun
                      ? {
                          ...mission.activeRun,
                          actualDurationMinutes: mission.activeRun.actualDurationMinutes ?? mission.activeRun.plannedDurationMinutes,
                          completedAt: recordedAt,
                          overdue: mission.activeRun.overdue ?? false,
                          overdueMinutes: mission.activeRun.overdueMinutes ?? 0,
                          status: "completed"
                        }
                      : mission.activeRun,
                  eventRecords: [
                    ...mission.eventRecords,
                    {
                      content: timerEventContent(payload.eventType, payload),
                      id: `timer-${mission.id}-${payload.eventType}-${Date.now()}`,
                      eventType: payload.eventType,
                      metadata: { elapsedSeconds: payload.elapsedSeconds, remainingSeconds: payload.remainingSeconds },
                      recordedAt,
                      title: timerEventTitle(payload.eventType)
                    }
                  ],
                  occurrenceStatus:
                    payload.eventType === "timer_end" && isLimitedTimerMission(mission) && mission.occurrenceStatus !== "done" ? "expired" : mission.occurrenceStatus,
                  status: payload.eventType === "timer_end" && isLimitedTimerMission(mission) && mission.status !== "done" ? "expired" : mission.status
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
      startEntertainmentRun: async (missionId, payload) => {
        const runId = `run-${missionId}-${Date.now()}`;
        setMissionItems((current) =>
          current.map((mission) =>
            mission.id === missionId &&
            mission.status !== "done" &&
            mission.status !== "expired" &&
            mission.activeRun?.status !== "completed" &&
            !hasLockedTimedRun(mission.eventRecords)
              ? {
                  ...mission,
                  activeRun: {
                    id: runId,
                    status: "running",
                    ...payload
                  },
                  eventRecords: [
                    ...mission.eventRecords,
                    taskEvent(missionId, "timer_start", "App run started", `${payload.targetApp ?? "Target app"} started.`, {
                      endAt: payload.endAt,
                      plannedDurationMinutes: payload.plannedDurationMinutes,
                      targetApp: payload.targetApp ?? null
                    })
                  ]
                }
              : mission
          )
        );

        try {
          const storedMission = await startEntertainmentRunApi(missionId, payload);
          setMissionItems((current) => current.map((mission) => (mission.id === missionId ? storedMission : mission)));
        } catch {
          setMissionItems((current) => current);
        }
      },
      finishEntertainmentRun: async (missionId, runId, payload) => {
        setMissionItems((current) =>
          current.map((mission) =>
            mission.id === missionId
              ? {
                  ...mission,
                  activeRun: mission.activeRun
                    ? {
                        ...mission.activeRun,
                        ...payload,
                        status: "completed"
                      }
                    : undefined,
                  actualEndAt: payload.completedAt,
                  completionRecord: {
                    actualMinutes: payload.actualDurationMinutes,
                    completedAt: payload.completedAt,
                    endedAt: payload.completedAt,
                    parentConfirmed: true,
                    startedAt: mission.actualStartAt ?? mission.activeRun?.startAt
                  },
                  eventRecords: [
                    ...mission.eventRecords,
                    taskEvent(missionId, "completion", "App run finished", `Target app finished in ${payload.actualDurationMinutes} minutes.`, {
                      overdue: payload.overdue,
                      overdueMinutes: payload.overdueMinutes
                    })
                  ],
                  occurrenceStatus: "done",
                  progress: mission.total,
                  status: "done"
                }
              : mission
          )
        );

        try {
          const storedMission = await finishEntertainmentRunApi(missionId, runId, payload);
          setMissionItems((current) => current.map((mission) => (mission.id === missionId ? storedMission : mission)));
        } catch {
          setMissionItems((current) => current);
        }
      },
      pauseEntertainmentRun: async (missionId, runId, payload) => {
        setMissionItems((current) =>
          current.map((mission) =>
            mission.id === missionId
              ? {
                  ...mission,
                  activeRun: mission.activeRun
                    ? {
                        ...mission.activeRun,
                        actualDurationMinutes: payload.actualDurationMinutes,
                        completedAt: payload.pausedAt,
                        overdue: payload.overdue,
                        overdueMinutes: payload.overdueMinutes,
                        status: "paused"
                      }
                    : undefined,
                  eventRecords: [
                    ...mission.eventRecords,
                    taskEvent(missionId, "timer_pause", "App run paused", `Target app paused after ${payload.actualDurationMinutes} minutes.`, {
                      overdue: payload.overdue,
                      overdueMinutes: payload.overdueMinutes
                    })
                  ]
                }
              : mission
          )
        );

        try {
          const storedMission = await pauseEntertainmentRunApi(missionId, runId, payload);
          setMissionItems((current) => current.map((mission) => (mission.id === missionId ? storedMission : mission)));
        } catch {
          setMissionItems((current) => current);
        }
      },
      resumeEntertainmentRun: async (missionId, runId, payload) => {
        setMissionItems((current) =>
          current.map((mission) =>
            mission.id === missionId
              ? {
                  ...mission,
                  activeRun: mission.activeRun
                    ? {
                        ...mission.activeRun,
                        completedAt: undefined,
                        endAt: payload.endAt,
                        notificationId: payload.notificationId,
                        status: "running"
                      }
                    : undefined,
                  eventRecords: [
                    ...mission.eventRecords,
                    taskEvent(missionId, "timer_resume", "App run resumed", "Target app timer resumed.", {
                      endAt: payload.endAt
                    })
                  ]
                }
              : mission
          )
        );

        try {
          const storedMission = await resumeEntertainmentRunApi(missionId, runId, payload);
          setMissionItems((current) => current.map((mission) => (mission.id === missionId ? storedMission : mission)));
        } catch {
          setMissionItems((current) => current);
        }
      },
      setLanguage,
      t: (key) => translate(language, key)
    }),
    [activeChild, childAccounts, completedCount, family, isSessionReady, language, missionItems, parent, sessionToken, todayEnergy]
  );

  return <KoalaContext.Provider value={value}>{children}</KoalaContext.Provider>;
}

async function readParentSession() {
  const value = await readSessionValue();

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredParentSession;
  } catch {
    await deleteSessionValue();
    return null;
  }
}

async function saveParentSession(session: StoredParentSession) {
  await writeSessionValue(JSON.stringify(session));
}

async function readSessionValue() {
  try {
    return await SecureStore.getItemAsync(parentSessionKey);
  } catch {
    return globalThis.localStorage?.getItem(parentSessionKey) ?? null;
  }
}

async function writeSessionValue(value: string) {
  try {
    await SecureStore.setItemAsync(parentSessionKey, value);
  } catch {
    globalThis.localStorage?.setItem(parentSessionKey, value);
  }
}

async function deleteSessionValue() {
  try {
    await SecureStore.deleteItemAsync(parentSessionKey);
  } catch {
    globalThis.localStorage?.removeItem(parentSessionKey);
  }
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

function familySummary(family: FamilyAccount & { children?: ChildAccount[]; parent?: ParentAccount | null; token?: string }): FamilyAccount {
  return {
    id: family.id,
    language: family.language,
    name: family.name,
    timeZone: family.timeZone
  };
}

function pendingFamilyForParent(parent: ParentAccount): FamilyAccount {
  return {
    id: `family-${slugify(parent.email)}`,
    language: "English",
    name: `${parent.name}'s Family`,
    timeZone: "America/Los_Angeles"
  };
}

function normalizeMissionProgress(mission: Mission): Mission {
  if (mission.occurrenceStatus === "skipped" || mission.status === "cancelled") {
    return {
      ...mission,
      status: "cancelled"
    };
  }

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

function timerEventContent(eventType: MissionTimerEventPayload["eventType"], payload: Pick<MissionTimerEventPayload, "elapsedSeconds" | "remainingSeconds">) {
  const elapsedText = payload.elapsedSeconds === undefined ? "" : ` Elapsed ${payload.elapsedSeconds} seconds.`;
  const remainingText = payload.remainingSeconds === undefined ? "" : ` Remaining ${payload.remainingSeconds} seconds.`;
  return `${timerEventTitle(eventType)}.${elapsedText}${remainingText}`;
}

function isLimitedTimerMission(mission: Pick<Mission, "executionType" | "targetApp" | "timeLimitMinutes">) {
  return mission.executionType === "timed" || Boolean(mission.timeLimitMinutes || mission.targetApp);
}

function applyMissionLayout(missions: Mission[], layoutById: Map<string, { layoutColumn: "primary" | "secondary"; layoutOrder: number }>) {
  return missions
    .map((mission) => {
      const layout = layoutById.get(mission.id);
      return layout ? { ...mission, ...layout } : mission;
    })
    .sort((left, right) => {
      const leftOrder = left.layoutOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.layoutOrder ?? Number.MAX_SAFE_INTEGER;

      if (left.layoutColumn !== right.layoutColumn) {
        return (left.layoutColumn ?? "zz").localeCompare(right.layoutColumn ?? "zz");
      }

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.title.localeCompare(right.title);
    });
}

function inferDraftExecutionType(draft: Pick<MissionDraft, "category" | "targetApp" | "timeLimitMinutes">): MissionExecutionType {
  if (["schedule", "reminder", "calendar"].includes(draft.category)) {
    return "schedule";
  }

  if (draft.targetApp || draft.timeLimitMinutes || draft.category === "entertainment" || draft.category === "Movies" || draft.category === "Game") {
    return "timed";
  }

  if (["reading", "language", "math", "music", "chinese", "english", "Math", "Chinese", "Eng"].includes(draft.category)) {
    return "submission";
  }

  return "completion";
}

function hasLockedTimedRun(events: Mission["eventRecords"]) {
  return eventsSinceLastTimedReset(events).some(
    (event) => event.eventType === "timer_end" || isAppRunFinishedEvent(event)
  );
}

function eventsSinceLastTimedReset(events: Mission["eventRecords"]) {
  const lastResetIndex = events.findLastIndex((event) => event.metadata?.reset === "timed_task" || event.title === "Timed task reset");
  return lastResetIndex === -1 ? events : events.slice(lastResetIndex + 1);
}

function isAppRunFinishedEvent(event: Mission["eventRecords"][number]) {
  return event.title === "App run finished" || event.title === "Entertainment finished";
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
