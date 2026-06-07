import { Link, router } from "expo-router";
import { useState } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Mission, MissionCategory, MissionExecutionType } from "../data/demo";
import { profileForChild, useKoalaStore } from "../data/store";
import { palette, shared } from "../ui/styles";

type TaskKind = "completion" | "timed" | "schedule";

const todayKey = () => new Date().toISOString().slice(0, 10);

const initialDraft = {
  category: "other" as MissionCategory,
  date: todayKey(),
  detail: "",
  energy: "10",
  goals: "",
  icon: "📌",
  scheduledTime: "",
  target: "",
  targetApp: "",
  timeLimitMinutes: "",
  title: ""
};

export default function ParentScreen() {
  const { activeChild, addMission, cancelMission, completeMission, completedCount, logout, missions, t, updateMission } = useKoalaStore();
  const [taskKind, setTaskKind] = useState<TaskKind>("completion");
  const [draft, setDraft] = useState(initialDraft);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const profile = profileForChild(activeChild);
  const pendingMissions = missions.filter((mission) => mission.status !== "done");
  const completedMissions = missions.filter((mission) => mission.status === "done");
  const totalEnergy = completedMissions.reduce((sum, mission) => sum + mission.energy, 0);
  const isEditing = Boolean(editingMissionId);

  const saveMission = async () => {
    if (!draft.title.trim()) {
      return;
    }

    const executionType = executionTypeForKind(taskKind);
    const nextDraft = {
      icon: draft.icon.trim() || iconForKind(taskKind),
      title: draft.title.trim(),
      category: categoryForKind(taskKind, draft.category),
      target: draft.target.trim() || defaultTargetForKind(taskKind),
      targetApp: taskKind === "timed" ? draft.targetApp.trim() || undefined : undefined,
      executionType,
      detail: detailForKind(taskKind, draft),
      goals: goalsForDraft(taskKind, draft),
      energy: Number(draft.energy) || 0,
      occurrenceDate: draft.date || todayKey(),
      repeatRule: taskKind === "schedule" ? "FREQ=DAILY;COUNT=1" : "FREQ=DAILY",
      scheduledTime: draft.scheduledTime.trim() || undefined,
      source: taskKind === "schedule" ? "parent_schedule" : "parent",
      timeLimitMinutes: taskKind === "timed" ? Number(draft.timeLimitMinutes) || 1 : undefined,
      total: taskKind === "schedule" ? 1 : Math.max(1, goalsForDraft(taskKind, draft).length),
      tone: toneForKind(taskKind)
    };

    if (editingMissionId) {
      await updateMission(editingMissionId, nextDraft);
    } else {
      await addMission(nextDraft);
    }

    setDraft(initialDraft);
    setEditingMissionId(null);
    setTaskKind("completion");
  };

  const startEditing = (mission: Mission) => {
    const kind = kindForMission(mission);
    setTaskKind(kind);
    setEditingMissionId(mission.id);
    setDraft({
      category: mission.category,
      date: mission.occurrenceDate.slice(0, 10),
      detail: mission.detail,
      energy: String(mission.energy),
      goals: mission.goals.join(", "),
      icon: mission.icon,
      scheduledTime: mission.scheduledTime ?? "",
      target: mission.target,
      targetApp: mission.targetApp ?? "",
      timeLimitMinutes: mission.timeLimitMinutes ? String(mission.timeLimitMinutes) : "",
      title: mission.title
    });
  };

  return (
    <View style={shared.screen}>
      <View style={shared.pageHeader}>
        <View>
          <Text style={shared.kicker}>{t("parentCheckIn")}</Text>
          <Text style={shared.title}>{profile.name}</Text>
          <Text style={shared.subtitle}>{t("useIpadQuickReview")}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={shared.navButtonAlt}
            onPress={() => {
              void logout().then(() => router.replace("/auth"));
            }}
          >
            <Text style={shared.navButtonAltText}>{t("logout")}</Text>
          </Pressable>
          <Link href="/" style={shared.navButton}>
            <Text style={shared.navButtonText}>{t("backToday")}</Text>
          </Link>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.grid}>
        <View style={StyleSheet.flatten([shared.card, styles.createCard])}>
          <View style={styles.createHeader}>
            <View>
              <Text style={styles.cardTitle}>{isEditing ? "编辑任务 Edit task" : "创建任务 Create task"}</Text>
              <Text style={styles.createSubtitle}>先选择任务类型，再填写对应信息。</Text>
            </View>
            <Text style={styles.createBadge}>{kindLabel(taskKind)}</Text>
          </View>
          <View style={styles.kindSwitch}>
            {(["completion", "timed", "schedule"] as TaskKind[]).map((kind) => (
              <Pressable
                key={kind}
                style={StyleSheet.flatten([styles.kindButton, taskKind === kind && styles.kindButtonActive])}
                onPress={() => {
                  setTaskKind(kind);
                  setDraft((current) => ({
                    ...current,
                    category: categoryForKind(kind, current.category),
                    icon: current.icon === iconForKind(taskKind) ? iconForKind(kind) : current.icon,
                    timeLimitMinutes: kind === "timed" ? current.timeLimitMinutes || "20" : ""
                  }));
                }}
              >
                <Text style={StyleSheet.flatten([styles.kindButtonText, taskKind === kind && styles.kindButtonTextActive])}>{kindLabel(kind)}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput style={styles.input} value={draft.title} onChangeText={(title) => setDraft((current) => ({ ...current, title }))} placeholder="Title" />
          <TextInput style={styles.input} value={draft.target} onChangeText={(target) => setDraft((current) => ({ ...current, target }))} placeholder={taskKind === "schedule" ? "Time, place, or short note" : "Goal"} />
          {taskKind !== "timed" ? (
            <TextInput style={styles.input} value={draft.detail} onChangeText={(detail) => setDraft((current) => ({ ...current, detail }))} placeholder={taskKind === "schedule" ? "Location / notes / reminder" : "Instructions or materials"} />
          ) : null}
          {taskKind === "completion" ? (
            <TextInput style={styles.input} value={draft.goals} onChangeText={(goals) => setDraft((current) => ({ ...current, goals }))} placeholder="Goal list, comma separated" />
          ) : null}
          {taskKind === "timed" ? (
            <>
              <TextInput style={styles.input} value={draft.timeLimitMinutes} onChangeText={(timeLimitMinutes) => setDraft((current) => ({ ...current, timeLimitMinutes }))} keyboardType="number-pad" placeholder="Limit minutes" />
              <TextInput style={styles.input} value={draft.targetApp} onChangeText={(targetApp) => setDraft((current) => ({ ...current, targetApp }))} placeholder="Target app, optional" />
            </>
          ) : null}
          {taskKind === "schedule" ? (
            <TextInput style={styles.input} value={draft.date} onChangeText={(date) => setDraft((current) => ({ ...current, date }))} placeholder="YYYY-MM-DD" />
          ) : null}
          <View style={styles.formRow}>
            <TextInput style={StyleSheet.flatten([styles.input, styles.halfInput])} value={draft.scheduledTime} onChangeText={(scheduledTime) => setDraft((current) => ({ ...current, scheduledTime }))} placeholder="Reminder HH:MM" />
            <TextInput style={StyleSheet.flatten([styles.input, styles.halfInput])} value={draft.energy} onChangeText={(energy) => setDraft((current) => ({ ...current, energy }))} keyboardType="number-pad" placeholder="Reward" />
          </View>
          <View style={styles.formActions}>
            {isEditing ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setEditingMissionId(null);
                  setDraft(initialDraft);
                  setTaskKind("completion");
                }}
              >
                <Text style={styles.secondaryButtonText}>Cancel edit</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.saveButton} onPress={saveMission}>
              <Text style={styles.saveButtonText}>{isEditing ? "Save" : "Create"}</Text>
            </Pressable>
          </View>
        </View>

        <View style={StyleSheet.flatten([shared.card, styles.summaryCard])}>
          <Text style={styles.cardLabel}>{t("todayComplete")}</Text>
          <Text style={styles.bigMetric}>{completedCount}/{missions.length}</Text>
          <Text style={styles.summaryText}>{t("rewardEnergyEarned")}: {totalEnergy}</Text>
          <View style={styles.webNotice}>
            <Text style={styles.webNoticeTitle}>{t("webHandlesSetup")}</Text>
            <Text style={styles.webNoticeText}>{t("webHandlesSetupDetail")}</Text>
          </View>
        </View>

        <View style={StyleSheet.flatten([shared.card, styles.reviewCard])}>
          <Text style={styles.cardTitle}>{t("quickConfirmations")}</Text>
          {pendingMissions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>{t("nothingPending")}</Text>
              <Text style={styles.emptyText}>{t("allTasksComplete")}</Text>
            </View>
          ) : pendingMissions.map((mission) => (
            <View key={mission.id} style={styles.reviewRow}>
              <Text style={styles.missionIcon}>{mission.icon}</Text>
              <View style={styles.reviewCopy}>
                <Text style={styles.reviewTitle}>{mission.title}</Text>
                <Text style={styles.reviewMeta}>{missionMetaText(mission, t)}</Text>
              </View>
              <View style={styles.rowActions}>
                <Pressable style={styles.secondaryButton} onPress={() => startEditing(mission)}>
                  <Text style={styles.secondaryButtonText}>Edit</Text>
                </Pressable>
                {kindForMission(mission) === "schedule" ? (
                  <Pressable style={styles.secondaryButton} onPress={() => cancelMission(mission.id)}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </Pressable>
                ) : null}
                {kindForMission(mission) !== "timed" ? (
                  <Pressable style={styles.confirmButton} onPress={() => completeMission(mission.id, { note: "Parent quick confirmed on iPad" })}>
                    <Text style={styles.confirmText}>{t("confirm")}</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <View style={StyleSheet.flatten([shared.card, styles.recordsCard])}>
          <Text style={styles.cardTitle}>{t("childSubmissionRecords")}</Text>
          {missions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>{t("noTasksYet")}</Text>
              <Text style={styles.emptyText}>{t("askParentAddTask")}</Text>
            </View>
          ) : missions.map((mission) => (
            <View key={`record-${mission.id}`} style={styles.recordRow}>
              <View style={styles.recordHeader}>
                <Text style={styles.missionIcon}>{mission.icon}</Text>
                <View style={styles.reviewCopy}>
                  <Text style={styles.reviewTitle}>{mission.title}</Text>
                  <Text style={styles.reviewMeta}>{missionRecordMetaText(mission, t)}</Text>
                </View>
                <Text style={StyleSheet.flatten([styles.statusPill, mission.status === "done" && styles.statusPillDone])}>
                  {missionStatusText(mission.status, t)}
                </Text>
              </View>
              {proofPhotoUriForMission(mission) || proofAudioUriForMission(mission) ? (
                <View style={styles.proofPanel}>
                  {proofPhotoUriForMission(mission) ? (
                    <Pressable onPress={() => void Linking.openURL(proofPhotoUriForMission(mission) ?? "")}>
                      <Image source={{ uri: proofPhotoUriForMission(mission) ?? "" }} style={styles.proofImage} />
                    </Pressable>
                  ) : null}
                  <View style={styles.proofCopy}>
                    <Text style={styles.proofTitle}>{t("proofAttached")}</Text>
                    <Text style={styles.proofMeta}>
                      {proofPhotoUriForMission(mission) ? t("photoReady") : t("noPhoto")} · {proofAudioUriForMission(mission) ? t("audioReady") : t("noAudio")}
                    </Text>
                    {proofAudioUriForMission(mission) ? (
                      <Pressable style={styles.linkButton} onPress={() => void Linking.openURL(proofAudioUriForMission(mission) ?? "")}>
                        <Text style={styles.linkButtonText}>{t("openAudio")}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ) : null}
              {mission.eventRecords.length > 0 || mission.activeRun ? (
                <View style={styles.logPanel}>
                  <Text style={styles.logTitle}>{t("executionLog")}</Text>
                  {mission.activeRun ? (
                    <Text style={styles.logItem}>
                      {t("inProgress")} · {mission.activeRun.targetApp ?? mission.target} · {formatClock(mission.activeRun.startAt)}
                    </Text>
                  ) : null}
                  {mission.eventRecords.slice(-5).map((event) => (
                    <Text key={event.id} style={styles.logItem}>
                      {event.title || taskEventText(event.eventType, t)} · {formatClock(event.recordedAt)}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexGrow: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 22
  },
  scroll: {
    flex: 1
  },
  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  summaryCard: {
    flexBasis: 300,
    flexGrow: 0.7,
    backgroundColor: palette.deepGreen
  },
  reviewCard: {
    flexBasis: 520,
    flexGrow: 1
  },
  recordsCard: {
    flexBasis: "100%",
    flexGrow: 1
  },
  createCard: {
    flexBasis: "100%",
    flexGrow: 1
  },
  createHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 12
  },
  createSubtitle: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4
  },
  createBadge: {
    borderRadius: 8,
    backgroundColor: "#EEF3EA",
    color: palette.green,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  cardLabel: {
    color: "#DDE8DC",
    fontSize: 16,
    fontWeight: "900"
  },
  bigMetric: {
    color: "#FFFFFF",
    fontSize: 88,
    lineHeight: 100,
    fontWeight: "900",
    marginTop: 12
  },
  summaryText: {
    color: "#DDE8DC",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8
  },
  webNotice: {
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginTop: 28
  },
  webNoticeTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  webNoticeText: {
    color: palette.muted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 16
  },
  reviewRow: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE8DD"
  },
  rowActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 8
  },
  missionIcon: {
    width: 42,
    fontSize: 28,
    textAlign: "center"
  },
  reviewCopy: {
    flex: 1
  },
  reviewTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  reviewMeta: {
    color: palette.muted,
    fontSize: 14,
    marginTop: 4
  },
  recordRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#EFE8DD",
    paddingVertical: 14
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  statusPill: {
    borderRadius: 8,
    backgroundColor: "#F4EFE5",
    color: palette.muted,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  statusPillDone: {
    backgroundColor: "#E5F1E8",
    color: palette.green
  },
  proofPanel: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 8,
    backgroundColor: "#FAF7F0",
    borderWidth: 1,
    borderColor: palette.line,
    marginLeft: 56,
    marginTop: 12,
    padding: 10
  },
  proofImage: {
    width: 96,
    height: 72,
    borderRadius: 8,
    backgroundColor: "#EFE8DD"
  },
  proofCopy: {
    flex: 1,
    justifyContent: "center"
  },
  proofTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  proofMeta: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4
  },
  linkButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: "#EEF3EA",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  linkButtonText: {
    color: palette.green,
    fontSize: 12,
    fontWeight: "900"
  },
  logPanel: {
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: palette.line,
    marginLeft: 56,
    marginTop: 10,
    padding: 10
  },
  logTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4
  },
  logItem: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18
  },
  confirmButton: {
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: palette.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  secondaryButton: {
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: "#EEF3EA",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  secondaryButtonText: {
    color: palette.green,
    fontSize: 13,
    fontWeight: "900"
  },
  kindSwitch: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12
  },
  kindButton: {
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12
  },
  kindButtonActive: {
    backgroundColor: palette.deepGreen,
    borderColor: palette.deepGreen
  },
  kindButtonText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  kindButtonTextActive: {
    color: "#FFFFFF"
  },
  input: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FFFFFF",
    color: palette.ink,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
    paddingHorizontal: 12
  },
  formRow: {
    flexDirection: "row",
    gap: 10
  },
  halfInput: {
    flex: 1
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10
  },
  saveButton: {
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: palette.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  saveButtonText: {
    color: "#392D12",
    fontSize: 14,
    fontWeight: "900"
  },
  confirmText: {
    color: "#392D12",
    fontSize: 14,
    fontWeight: "900"
  },
  emptyBox: {
    borderRadius: 8,
    backgroundColor: "#FAF7F0",
    borderWidth: 1,
    borderColor: palette.line,
    padding: 18
  },
  emptyTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  emptyText: {
    color: palette.muted,
    fontSize: 15,
    marginTop: 6
  }
});

function missionStatusText(status: Mission["status"], t: (key: string) => string) {
  return status === "done" ? t("done") : status === "in_progress" ? t("inProgress") : status === "cancelled" ? "Cancelled" : t("todo");
}

function kindForMission(mission: Mission): TaskKind {
  if (mission.executionType === "schedule") {
    return "schedule";
  }

  if (mission.executionType === "timed" || mission.timeLimitMinutes || mission.targetApp) {
    return "timed";
  }

  return "completion";
}

function executionTypeForKind(kind: TaskKind): MissionExecutionType {
  return kind === "schedule" ? "schedule" : kind === "timed" ? "timed" : "completion";
}

function categoryForKind(kind: TaskKind, current: MissionCategory): MissionCategory {
  if (kind === "schedule") {
    return "schedule";
  }

  if (kind === "timed") {
    return current === "schedule" ? "entertainment" : current;
  }

  return current === "schedule" || current === "entertainment" ? "other" : current;
}

function iconForKind(kind: TaskKind) {
  return kind === "schedule" ? "📅" : kind === "timed" ? "⏱️" : "📌";
}

function toneForKind(kind: TaskKind) {
  return kind === "schedule" ? "#4B6FA8" : kind === "timed" ? "#B75F4A" : "#3F7D58";
}

function kindLabel(kind: TaskKind) {
  return kind === "schedule" ? "日程提醒 Schedule" : kind === "timed" ? "限时执行 Timed" : "柔性完成 Flexible";
}

function defaultTargetForKind(kind: TaskKind) {
  return kind === "schedule" ? "Reminder" : kind === "timed" ? "Use within limit" : "Mark complete";
}

function goalsForDraft(kind: TaskKind, draft: typeof initialDraft) {
  if (kind === "schedule") {
    return [draft.target.trim() || "Show up"];
  }

  const goals = draft.goals
    .split(",")
    .map((goal) => goal.trim())
    .filter(Boolean);

  if (goals.length === 0 && draft.target.trim()) {
    return [draft.target.trim()];
  }

  return goals;
}

function detailForKind(kind: TaskKind, draft: typeof initialDraft) {
  if (kind === "timed") {
    return draft.targetApp.trim() ? `Target app: ${draft.targetApp.trim()}` : draft.target.trim();
  }

  return draft.detail.trim() || draft.target.trim();
}

function missionMetaText(mission: Mission, t: (key: string) => string) {
  const kind = kindForMission(mission);
  if (kind === "schedule") {
    return [mission.occurrenceDate, mission.scheduledTime, mission.target, missionStatusText(mission.status, t)].filter(Boolean).join(" · ");
  }

  if (kind === "timed") {
    return [mission.timeLimitMinutes ? `${mission.timeLimitMinutes} min` : undefined, mission.targetApp, missionStatusText(mission.status, t)].filter(Boolean).join(" · ");
  }

  return `${mission.target} · ${missionStatusText(mission.status, t)}`;
}

function missionRecordMetaText(mission: Mission, t: (key: string) => string) {
  const parts = [mission.occurrenceDate, mission.scheduledTime, mission.target, missionStatusText(mission.status, t)].filter(Boolean);

  if (mission.completionRecord?.completedAt) {
    parts.push(`${t("completedAt")} ${formatClock(mission.completionRecord.completedAt)}`);
  }

  if (mission.completionRecord?.actualMinutes !== undefined) {
    parts.push(`${mission.completionRecord.actualMinutes} min`);
  }

  return parts.join(" · ");
}

function proofPhotoUriForMission(mission: Mission) {
  return mission.completionRecord?.photoUri ?? latestProofAttachmentUri(mission, "image");
}

function proofAudioUriForMission(mission: Mission) {
  return mission.completionRecord?.audioUri ?? latestProofAttachmentUri(mission, "audio");
}

function latestProofAttachmentUri(mission: Mission, mediaType: "audio" | "image") {
  return mission.planDetail.attachments
    .slice()
    .reverse()
    .find((attachment) => attachment.mimeType?.startsWith(`${mediaType}/`) || attachment.name.toLowerCase().includes(`proof-${mediaType === "image" ? "photo" : "audio"}`))
    ?.uri;
}

function formatClock(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function taskEventText(eventType: string, t: (key: string) => string) {
  switch (eventType) {
    case "timer_start":
      return t("timerStarted");
    case "timer_pause":
      return t("timerPaused");
    case "timer_resume":
      return t("timerResumed");
    case "timer_end":
      return t("timerEnded");
    case "completion":
      return t("complete");
    case "attachment_added":
      return t("attachmentAdded");
    case "cancelled":
      return "Cancelled";
    case "created":
      return "Created";
    case "updated":
      return "Updated";
    case "status_change":
      return "Status changed";
    default:
      return eventType;
  }
}
