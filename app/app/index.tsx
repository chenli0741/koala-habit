import { Link, Redirect, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { fetchMissions, uploadMissionFileApi } from "../data/api";
import { childProfile, Mission } from "../data/demo";
import { profileForChild, useKoalaStore } from "../data/store";
import { palette, shared } from "../ui/styles";

type TaskViewMode = "day" | "week";
type CalendarDay = {
  dayNumber: number;
  key: string;
  label: string;
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function HomeScreen() {
  const { activeChild, children, completedCount, isSessionReady, language, missions, parent, setLanguage, t, todayEnergy, updateChild } = useKoalaStore();
  const [taskViewMode, setTaskViewMode] = useState<TaskViewMode>("day");
  const [calendarMissions, setCalendarMissions] = useState<Mission[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const profile = profileForChild(activeChild);
  const totalTasks = missions.length;
  const today = useMemo(() => todayKey(), []);
  const todayTitleDate = useMemo(() => formatShortDate(today), [today]);
  const calendarDays = useMemo(() => weekDaysForDate(new Date()), []);
  const scheduleMissions = taskViewMode === "day" ? missions : calendarMissions;

  useEffect(() => {
    let isMounted = true;

    async function loadCalendarMissions() {
      if (taskViewMode === "day") {
        setCalendarMissions([]);
        return;
      }

      if (!activeChild || calendarDays.length === 0) {
        setCalendarMissions([]);
        return;
      }

      setIsCalendarLoading(true);

      try {
        const nextMissions = await fetchMissions(activeChild.id, calendarDays[0].key, calendarDays[calendarDays.length - 1].key);

        if (isMounted) {
          setCalendarMissions(nextMissions);
        }
      } catch {
        if (isMounted) {
          setCalendarMissions([]);
        }
      } finally {
        if (isMounted) {
          setIsCalendarLoading(false);
        }
      }
    }

    void loadCalendarMissions();

    return () => {
      isMounted = false;
    };
  }, [activeChild, calendarDays, taskViewMode]);

  if (!isSessionReady) {
    return (
      <View style={styles.screen}>
        <Text style={styles.logo}>Koala Habit</Text>
      </View>
    );
  }

  if (!parent) {
    return <Redirect href="/auth" />;
  }

  if (children.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.emptyDashboard}>
          <Text style={styles.logo}>Koala Habit</Text>
          <Text style={shared.kicker}>{t("taskDashboard")}</Text>
          <Text style={shared.title}>{t("addFirstChildPrompt")}</Text>
          <Text style={shared.subtitle}>{t("addFirstChildDetail")}</Text>
          <View style={styles.emptyActions}>
            <Link href="/auth/create-child" style={shared.navButtonAlt}>
              <Text style={shared.navButtonAltText}>{t("addChild")}</Text>
            </Link>
            <Link href="/parent" style={shared.navButton}>
              <Text style={shared.navButtonText}>{t("parent")}</Text>
            </Link>
          </View>
        </View>
      </View>
    );
  }

  if (!activeChild) {
    return <Redirect href="/auth/child-pin" />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.sidebar}>
        <Text style={styles.logo}>Koala Habit</Text>
        <View style={styles.childCard}>
          <Pressable style={styles.avatarButton} onPress={() => setIsProfileEditorOpen(true)}>
            <KoalaAvatar avatarUri={profile.avatar} />
          </Pressable>
          <Text style={styles.childName}>{profile.name}</Text>
          <Text style={styles.childSubtext}>{t("growthTree")}</Text>
        </View>
        <View style={styles.energyCard}>
          <Text style={styles.energyLabel}>{t("todayEnergy")}</Text>
          <Text style={styles.energyValue}>⭐ {todayEnergy}</Text>
          <Text style={styles.energyMeta}>{t("readingStreak")}: {profile.readingStreakDays}</Text>
        </View>
        <View style={styles.companionPanel}>
          <Text style={styles.panelTitle}>{t("growthTree")}</Text>
          <LargeKoala />
          <Text style={styles.companionName}>Lv{childProfile.treeLevel} {t("youngTree")}</Text>
          <Text style={styles.companionText}>
            {completedCount}/{totalTasks} {t("todayComplete")}
          </Text>
          <View style={styles.growthTrack}>
            <View style={StyleSheet.flatten([styles.growthFill, { width: `${childProfile.treeGrowth}%` }])} />
          </View>
          <Link href="/reminders" style={styles.reminderLink}>
            <Text style={styles.reminderText}>{t("reminders")}</Text>
          </Link>
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={shared.kicker}>{t("today")}</Text>
            <Text style={shared.title}>🌞 {t("goodMorning")}, {profile.name}!</Text>
            <Text style={shared.subtitle}>{t("summerHabits")}</Text>
          </View>
          <HomeActionMenu language={language} setLanguage={setLanguage} t={t} />
        </View>

        <View style={styles.contentGrid}>
          <View style={styles.missionPanel}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelTitle}>
                  {taskViewMode === "day" ? `${t("todayTasks")} (${todayTitleDate})` : t("taskCalendar")}
                </Text>
                <TaskViewSwitch value={taskViewMode} onChange={setTaskViewMode} t={t} />
              </View>
              <View style={styles.panelActions}>
                <Link href="/history" style={styles.smallLink}>
                  <Text style={styles.smallLinkText}>{t("history")}</Text>
                </Link>
              </View>
            </View>
            <TaskSchedule
              calendarDays={calendarDays}
              isLoading={isCalendarLoading}
              missions={scheduleMissions}
              t={t}
              today={today}
              viewMode={taskViewMode}
            />
          </View>

        </View>
      </View>
      <ChildProfileEditor
        avatarUri={activeChild.avatar}
        childId={activeChild.id}
        isOpen={isProfileEditorOpen}
        pinLength={activeChild.pinLength}
        t={t}
        updateChild={updateChild}
        onClose={() => setIsProfileEditorOpen(false)}
      />
    </View>
  );
}

function ChildProfileEditor({
  avatarUri,
  childId,
  isOpen,
  onClose,
  pinLength,
  t,
  updateChild
}: {
  avatarUri: string;
  childId: string;
  isOpen: boolean;
  onClose: () => void;
  pinLength?: number;
  t: (key: string) => string;
  updateChild: (childId: string, child: { avatar?: string; pin?: string }) => Promise<unknown>;
}) {
  const [draftAvatar, setDraftAvatar] = useState(avatarUri);
  const [draftAvatarMimeType, setDraftAvatarMimeType] = useState("image/jpeg");
  const [draftPin, setDraftPin] = useState("");
  const isChinese = t("language") === "语言";

  useEffect(() => {
    if (isOpen) {
      setDraftAvatar(avatarUri);
      setDraftAvatarMimeType("image/jpeg");
      setDraftPin("");
    }
  }, [avatarUri, isOpen]);

  async function chooseAvatar() {
    const ImagePicker = await import("expo-image-picker");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(t("photo"), "Photo library permission is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ["images"],
      quality: 0.75
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setDraftAvatar(result.assets[0].uri);
      setDraftAvatarMimeType(result.assets[0].mimeType ?? "image/jpeg");
    }
  }

  async function saveProfile() {
    const avatar = draftAvatar && isLocalFileUri(draftAvatar)
      ? await uploadMissionFileApi({
          fileName: childProfileFileName(childId, draftAvatarMimeType),
          kind: "avatar",
          mimeType: draftAvatarMimeType,
          missionId: childId,
          uri: draftAvatar
        })
      : draftAvatar;

    await updateChild(childId, {
      avatar,
      pin: draftPin || undefined
    });
    onClose();
  }

  return (
    <Modal transparent animationType="fade" supportedOrientations={["landscape-left", "landscape-right"]} visible={isOpen} onRequestClose={onClose}>
      <View style={styles.profileModalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.profileModal}>
          <Text style={styles.profileModalTitle}>{isChinese ? "孩子资料" : "Child Profile"}</Text>
          <Pressable style={styles.profileAvatarPicker} onPress={chooseAvatar}>
            <KoalaAvatar avatarUri={draftAvatar} large />
            <Text style={styles.profileAvatarHint}>{t("photo")}</Text>
          </Pressable>
          <Text style={styles.profileLabel}>PIN</Text>
          <TextInput
            keyboardType="number-pad"
            maxLength={6}
            placeholder={`Current length ${pinLength ?? 4}`}
            style={styles.profileInput}
            value={draftPin}
            onChangeText={(value) => setDraftPin(value.replace(/\D/g, ""))}
          />
          <View style={styles.profileActions}>
            <Pressable style={styles.profileSecondaryButton} onPress={onClose}>
              <Text style={styles.profileSecondaryText}>{t("close")}</Text>
            </Pressable>
            <Pressable style={styles.profilePrimaryButton} onPress={saveProfile}>
              <Text style={styles.profilePrimaryText}>{isChinese ? "保存" : "Save"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function HomeActionMenu({
  language,
  setLanguage,
  t
}: {
  language: "en" | "zh";
  setLanguage: (language: "en" | "zh") => void;
  t: (key: string) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  function navigateTo(path: "/parent" | "/auth/child-pin") {
    setIsOpen(false);
    router.push(path);
  }

  function selectLanguage(nextLanguage: "en" | "zh") {
    setLanguage(nextLanguage);
    setIsOpen(false);
  }

  return (
    <View style={styles.homeMenuAnchor}>
      <Pressable accessibilityLabel="Open app menu" style={styles.homeMenuButton} onPress={() => setIsOpen(true)}>
        <Text style={styles.homeMenuIcon}>☰</Text>
      </Pressable>
      <Modal
        transparent
        animationType="fade"
        supportedOrientations={["landscape-left", "landscape-right"]}
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.menuOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsOpen(false)} />
          <View style={styles.homeMenuPanel}>
            <Pressable style={styles.homeMenuItem} onPress={() => navigateTo("/parent")}>
              <Text style={styles.homeMenuItemIcon}>👪</Text>
              <Text style={styles.homeMenuItemText}>{t("parent")}</Text>
            </Pressable>
            <Pressable style={styles.homeMenuItem} onPress={() => navigateTo("/auth/child-pin")}>
              <Text style={styles.homeMenuItemIcon}>🔁</Text>
              <Text style={styles.homeMenuItemText}>{t("switchChild")}</Text>
            </Pressable>
            <View style={styles.homeMenuDivider} />
            <Text style={styles.homeMenuLabel}>{t("language")}</Text>
            <View style={styles.languageMenuRow}>
              <Pressable style={StyleSheet.flatten([styles.languageMenuButton, language === "en" && styles.languageMenuButtonActive])} onPress={() => selectLanguage("en")}>
                <Text style={StyleSheet.flatten([styles.languageMenuText, language === "en" && styles.languageMenuTextActive])}>EN</Text>
              </Pressable>
              <Pressable style={StyleSheet.flatten([styles.languageMenuButton, language === "zh" && styles.languageMenuButtonActive])} onPress={() => selectLanguage("zh")}>
                <Text style={StyleSheet.flatten([styles.languageMenuText, language === "zh" && styles.languageMenuTextActive])}>中文</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TaskViewSwitch({ onChange, t, value }: { onChange: (value: TaskViewMode) => void; t: (key: string) => string; value: TaskViewMode }) {
  return (
    <View style={styles.viewSwitch}>
      {(["day", "week"] as TaskViewMode[]).map((mode) => (
        <Pressable
          key={mode}
          onPress={() => onChange(mode)}
          style={StyleSheet.flatten([styles.viewSwitchButton, value === mode && styles.viewSwitchButtonActive])}
        >
          <Text style={StyleSheet.flatten([styles.viewSwitchText, value === mode && styles.viewSwitchTextActive])}>{t(mode)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function TaskSchedule({
  calendarDays,
  isLoading,
  missions,
  t,
  today,
  viewMode
}: {
  calendarDays: CalendarDay[];
  isLoading: boolean;
  missions: Mission[];
  t: (key: string) => string;
  today: string;
  viewMode: TaskViewMode;
}) {
  if (isLoading) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>{t("loading")}</Text>
        <Text style={styles.emptyText}>{t("taskCalendar")}</Text>
      </View>
    );
  }

  if (missions.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>{t("noTasksYet")}</Text>
        <Text style={styles.emptyText}>{t("askParentAddTask")}</Text>
      </View>
    );
  }

  if (viewMode === "week") {
    return (
      <ScrollView style={styles.scheduleScroll} contentContainerStyle={styles.scheduleScrollContent}>
        <View style={styles.weekBoard}>
          {calendarDays.map((day) => {
            const dayMissions = missionsForDate(missions, day.key);
            const done = dayMissions.filter((mission) => mission.status === "done").length;
            return (
              <View key={day.key} style={StyleSheet.flatten([styles.weekColumn, day.key === today && styles.weekColumnToday])}>
                <Text style={styles.weekDay}>{day.label}</Text>
                <Text style={styles.weekMeta}>{day.dayNumber} · {done}/{dayMissions.length}</Text>
                {dayMissions.slice(0, 5).map((mission) => (
                  <View key={mission.id} style={styles.weekTaskPill}>
                    <Text style={styles.weekTaskIcon}>{mission.icon}</Text>
                    <Text numberOfLines={1} style={styles.weekTaskText}>{mission.title}</Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  const { primary, secondary } = splitDayMissions(missions);

  return (
    <ScrollView style={styles.scheduleScroll} contentContainerStyle={styles.scheduleScrollContent}>
      <View style={styles.dayBoard}>
        <View style={styles.dayColumn}>{primary.map((mission) => <MissionCard key={mission.id} mission={mission} t={t} />)}</View>
        <View style={styles.dayColumn}>{secondary.map((mission) => <MissionCard key={mission.id} mission={mission} t={t} />)}</View>
      </View>
    </ScrollView>
  );
}

function MissionCard({ mission, t }: { mission: Mission; t: (key: string) => string }) {
  const missionKind = kindForMission(mission);
  const percent = missionKind === "schedule" ? (mission.status === "done" ? 100 : 0) : Math.round((mission.progress / mission.total) * 100);

  return (
    <Link href={`/mission/${mission.id}`} asChild>
      <Pressable style={StyleSheet.flatten([styles.missionCard, missionKind === "schedule" && styles.scheduleMissionCard])}>
        <View style={styles.missionIconSlot}>
          <Text style={styles.missionIcon}>{mission.icon}</Text>
        </View>
        <View style={styles.missionBody}>
          <View style={styles.missionTitleRow}>
            <Text numberOfLines={1} style={styles.missionLabel}>{mission.title}</Text>
            <Text numberOfLines={1} style={styles.status}>{missionStatusText(mission.status, t)}</Text>
          </View>
          <View style={styles.missionMetaRow}>
            <Text numberOfLines={1} style={styles.missionDetail}>{missionDetailText(mission)}</Text>
            <View style={styles.missionPills}>
              {missionKind === "schedule" && mission.scheduledTime ? <Text numberOfLines={1} style={styles.timeLimitPill}>{mission.scheduledTime}</Text> : null}
              {missionKind === "timed" && mission.targetApp ? <Text numberOfLines={1} style={styles.timeLimitPill}>{mission.targetApp}</Text> : null}
              {missionKind === "timed" && mission.timeLimitMinutes ? <Text numberOfLines={1} style={styles.timeLimitPill}>{mission.timeLimitMinutes} min</Text> : null}
            </View>
          </View>
          <View style={styles.missionProgressRow}>
            {missionKind === "schedule" ? (
              <Text numberOfLines={1} style={styles.actionHint}>Done · Cancel · Edit</Text>
            ) : missionKind === "timed" ? (
              <Text numberOfLines={1} style={styles.actionHint}>{timedActionText(mission)}</Text>
            ) : (
              <View style={styles.progressTrack}>
                <View style={StyleSheet.flatten([styles.progressFill, { width: `${percent}%`, backgroundColor: mission.tone }])} />
              </View>
            )}
            <Text style={styles.missionCount}>
              {missionKind === "schedule" ? formatShortDate(mission.occurrenceDate) : formatPoints(mission.energy)}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

function splitDayMissions(missions: Mission[]) {
  const primary = missions.filter(isTimeSensitiveMission);
  const secondary = missions.filter((mission) => !isTimeSensitiveMission(mission));

  if (primary.length === 0 || secondary.length === 0) {
    return {
      primary: missions.filter((_, index) => index % 2 === 0),
      secondary: missions.filter((_, index) => index % 2 === 1)
    };
  }

  return { primary, secondary };
}

function isTimeSensitiveMission(mission: Mission) {
  return kindForMission(mission) !== "completion" || Boolean(mission.scheduledTime || mission.timeLimitMinutes || mission.targetApp);
}

function missionStatusText(status: Mission["status"], t: (key: string) => string) {
  return status === "done" ? t("done") : status === "in_progress" ? t("inProgress") : status === "cancelled" ? "Cancelled" : t("todo");
}

function kindForMission(mission: Mission) {
  if (mission.executionType === "schedule") {
    return "schedule";
  }

  if (mission.executionType === "timed" || mission.timeLimitMinutes || mission.targetApp) {
    return "timed";
  }

  return "completion";
}

function missionDetailText(mission: Mission) {
  const kind = kindForMission(mission);

  if (kind === "schedule") {
    return [mission.scheduledTime, mission.target || mission.detail].filter(Boolean).join(" · ");
  }

  if (kind === "timed") {
    return mission.activeRun ? `${mission.activeRun.status} · ${remainingRunText(mission.activeRun.endAt)}` : mission.target;
  }

  return mission.target;
}

function timedActionText(mission: Mission) {
  if (mission.activeRun?.status === "paused") {
    return "Resume";
  }

  if (mission.activeRun?.status === "running") {
    return remainingRunText(mission.activeRun.endAt);
  }

  return mission.status === "done" ? "Done" : "Start";
}

function remainingRunText(endAt: string) {
  const seconds = Math.max(0, Math.floor((new Date(endAt).getTime() - Date.now()) / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")} left`;
}

function formatPoints(points: number) {
  return points > 0 ? `+${points}` : `${points}`;
}

function missionsForDate(missions: Mission[], dateKey: string) {
  return missions.filter((mission) => mission.occurrenceDate.slice(0, 10) === dateKey);
}

function weekDaysForDate(date: Date): CalendarDay[] {
  const monday = new Date(date);
  const day = monday.getDay();
  const daysUntilNextMonday = ((8 - day) % 7) || 7;
  monday.setDate(monday.getDate() + daysUntilNextMonday);

  return weekDays.map((label, index) => {
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + index);

    return {
      dayNumber: nextDate.getDate(),
      key: dateKey(nextDate),
      label
    };
  });
}

function todayKey() {
  return dateKey(new Date());
}

function formatShortDate(dateKeyValue: string) {
  const [, month, day] = dateKeyValue.split("-");
  return `${month}/${day}`;
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function KoalaAvatar({ avatarUri, large = false }: { avatarUri?: string; large?: boolean }) {
  if (avatarUri && avatarUri !== "Koala") {
    return <Image source={{ uri: avatarUri }} style={StyleSheet.flatten([styles.avatarImage, large && styles.avatarImageLarge])} />;
  }

  return (
    <View style={StyleSheet.flatten([styles.avatar, large && styles.avatarLarge])}>
      <View style={styles.earLeft} />
      <View style={styles.earRight} />
      <View style={styles.face} />
    </View>
  );
}

function isLocalFileUri(uri: string) {
  return uri.startsWith("file://") || uri.startsWith("content://") || uri.startsWith("ph://");
}

function childProfileFileName(childId: string, mimeType: string) {
  const cleanChildId = childId.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "child";
  const extension = mimeType === "image/png" ? ".png" : ".jpg";
  return `${cleanChildId}-avatar-${Date.now()}${extension}`;
}

function LargeKoala() {
  return (
    <View style={styles.bigCompanion}>
      <View style={styles.bigEarLeft} />
      <View style={styles.bigEarRight} />
      <View style={styles.bigFace}>
        <View style={styles.eyeRow}>
          <View style={styles.eye} />
          <View style={styles.eye} />
        </View>
        <View style={styles.nose} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: palette.paper,
    padding: 28,
    gap: 24,
    minHeight: 0
  },
  sidebar: {
    width: 280,
    gap: 18
  },
  emptyDashboard: {
    ...shared.card,
    alignSelf: "center",
    width: "100%",
    maxWidth: 720
  },
  emptyActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 22
  },
  logo: {
    fontSize: 28,
    fontWeight: "800",
    color: palette.ink
  },
  childCard: {
    ...shared.card,
    alignItems: "center"
  },
  avatarButton: {
    borderRadius: 56
  },
  avatar: {
    width: 112,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  avatarLarge: {
    marginBottom: 0
  },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    marginBottom: 14,
    backgroundColor: "#E7F0E2"
  },
  avatarImageLarge: {
    marginBottom: 0
  },
  earLeft: {
    position: "absolute",
    left: 8,
    top: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#6C7C67"
  },
  earRight: {
    position: "absolute",
    right: 8,
    top: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#6C7C67"
  },
  face: {
    width: 86,
    height: 78,
    borderRadius: 43,
    backgroundColor: palette.leaf,
    borderWidth: 8,
    borderColor: "#526350"
  },
  childName: {
    fontSize: 22,
    fontWeight: "800",
    color: palette.ink
  },
  childSubtext: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: palette.muted,
    textAlign: "center"
  },
  energyCard: {
    backgroundColor: palette.deepGreen,
    borderRadius: 8,
    padding: 18
  },
  energyLabel: {
    color: "#DDE8DC",
    fontSize: 14,
    fontWeight: "800"
  },
  energyValue: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 8
  },
  energyMeta: {
    color: "#DDE8DC",
    fontSize: 14,
    marginTop: 8
  },
  main: {
    flex: 1,
    gap: 22,
    minHeight: 0
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18
  },
  headerCopy: {
    flex: 1
  },
  homeMenuAnchor: {
    position: "relative",
    flexShrink: 0,
    paddingTop: 2
  },
  homeMenuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.card
  },
  homeMenuIcon: {
    color: palette.ink,
    fontSize: 22,
    lineHeight: 24,
    fontWeight: "900"
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(32, 53, 43, 0.08)"
  },
  homeMenuPanel: {
    position: "absolute",
    top: 76,
    right: 28,
    width: 260,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.card,
    padding: 10,
    shadowColor: "#20352B",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 }
  },
  homeMenuItem: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    paddingHorizontal: 12
  },
  homeMenuItemIcon: {
    width: 28,
    fontSize: 18,
    textAlign: "center"
  },
  homeMenuItemText: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  homeMenuDivider: {
    height: 1,
    backgroundColor: palette.line,
    marginVertical: 8
  },
  homeMenuLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8,
    paddingHorizontal: 6,
    textTransform: "uppercase"
  },
  languageMenuRow: {
    flexDirection: "row",
    gap: 6,
    borderRadius: 8,
    backgroundColor: "#F2EDE5",
    padding: 4
  },
  languageMenuButton: {
    flex: 1,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6
  },
  languageMenuButtonActive: {
    backgroundColor: palette.deepGreen
  },
  languageMenuText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  languageMenuTextActive: {
    color: "#FFFFFF"
  },
  profileModalOverlay: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    backgroundColor: "rgba(32, 53, 43, 0.12)",
    paddingRight: 24,
    paddingTop: 88
  },
  profileModal: {
    width: 320,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.card,
    padding: 18,
    shadowColor: "#20352B",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 }
  },
  profileModalTitle: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 14
  },
  profileAvatarPicker: {
    alignItems: "center",
    alignSelf: "center",
    gap: 8,
    marginBottom: 14
  },
  profileAvatarHint: {
    color: palette.green,
    fontSize: 13,
    fontWeight: "900"
  },
  profileLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6
  },
  profileInput: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    color: palette.ink,
    fontSize: 18,
    fontWeight: "900",
    paddingHorizontal: 12
  },
  profileActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  profileSecondaryButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#EEF3EA"
  },
  profilePrimaryButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: palette.deepGreen
  },
  profileSecondaryText: {
    color: palette.green,
    fontSize: 14,
    fontWeight: "900"
  },
  profilePrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900"
  },
  contentGrid: {
    flex: 1,
    minHeight: 0
  },
  missionPanel: {
    ...shared.card,
    flex: 1,
    minHeight: 0,
    overflow: "hidden"
  },
  companionPanel: {
    width: "100%",
    minHeight: 188,
    alignSelf: "stretch",
    backgroundColor: "#E7F0E2",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#C9D9C1",
    alignItems: "center"
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: palette.ink,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    marginBottom: 16
  },
  viewSwitch: {
    flexDirection: "row",
    alignSelf: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FAF7F0",
    marginTop: 10,
    overflow: "hidden"
  },
  viewSwitchButton: {
    minHeight: 34,
    minWidth: 62,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10
  },
  viewSwitchButtonActive: {
    backgroundColor: palette.deepGreen
  },
  viewSwitchText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  viewSwitchTextActive: {
    color: "#FFFFFF"
  },
  panelActions: {
    flexDirection: "row",
    gap: 8
  },
  smallLink: {
    borderRadius: 18,
    backgroundColor: "#EEF3EA",
    paddingHorizontal: 14,
    paddingVertical: 8,
    textDecorationLine: "none"
  },
  smallLinkText: {
    color: palette.green,
    fontSize: 13,
    fontWeight: "900"
  },
  scheduleScroll: {
    flex: 1,
    minHeight: 0
  },
  scheduleScrollContent: {
    paddingBottom: 2
  },
  dayBoard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start"
  },
  dayColumn: {
    flex: 1,
    minWidth: 0
  },
  missionCard: {
    minHeight: 108,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E7DED0",
    backgroundColor: palette.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 16,
    textDecorationLine: "none"
  },
  scheduleMissionCard: {
    backgroundColor: "#F8FAFC"
  },
  missionIconSlot: {
    width: 54,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  missionIcon: {
    width: 54,
    fontSize: 30,
    lineHeight: 36,
    textAlign: "center"
  },
  missionBody: {
    flex: 1,
    minWidth: 0,
    gap: 6
  },
  missionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 24
  },
  missionLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    color: palette.ink
  },
  status: {
    width: 72,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800",
    color: palette.muted,
    textAlign: "left"
  },
  missionDetail: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    lineHeight: 20,
    color: palette.muted
  },
  missionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 24
  },
  missionPills: {
    width: 132,
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 6,
    flexShrink: 0
  },
  timeLimitPill: {
    borderRadius: 8,
    backgroundColor: "#EEF3EA",
    color: palette.green,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: 76,
    overflow: "hidden"
  },
  missionProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 20
  },
  progressTrack: {
    flex: 1,
    minWidth: 0,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#EEE8DD",
    overflow: "hidden"
  },
  progressFill: {
    height: 9,
    borderRadius: 5
  },
  missionCount: {
    width: 48,
    textAlign: "right",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    color: palette.ink
  },
  actionHint: {
    flex: 1,
    minWidth: 0,
    color: palette.green,
    fontSize: 13,
    fontWeight: "900"
  },
  emptyState: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E7DED0",
    padding: 20,
    backgroundColor: "#FAF7F0"
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
  },
  weekBoard: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 4
  },
  weekColumn: {
    flex: 1,
    minWidth: 0,
    minHeight: 260,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E7DED0",
    backgroundColor: "#FAF7F0",
    padding: 10
  },
  weekColumnToday: {
    borderColor: palette.green,
    backgroundColor: "#EEF3EA"
  },
  weekDay: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  weekMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 2,
    marginBottom: 10
  },
  weekTaskPill: {
    minHeight: 36,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7DED0",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    marginBottom: 8
  },
  weekTaskIcon: {
    fontSize: 16
  },
  weekTaskText: {
    flex: 1,
    color: palette.ink,
    fontSize: 12,
    fontWeight: "900"
  },
  bigCompanion: {
    width: 112,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 10
  },
  bigEarLeft: {
    position: "absolute",
    left: 10,
    top: 4,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#526350"
  },
  bigEarRight: {
    position: "absolute",
    right: 10,
    top: 4,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#526350"
  },
  bigFace: {
    width: 84,
    height: 76,
    borderRadius: 42,
    backgroundColor: palette.leaf,
    borderWidth: 6,
    borderColor: "#526350",
    alignItems: "center",
    justifyContent: "center"
  },
  eyeRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 7
  },
  eye: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.ink
  },
  nose: {
    width: 16,
    height: 11,
    borderRadius: 6,
    backgroundColor: palette.ink
  },
  companionName: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    color: palette.ink,
    textAlign: "center"
  },
  companionText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 18,
    color: "#526350",
    textAlign: "center"
  },
  growthTrack: {
    width: "100%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D1DECB",
    marginTop: 10,
    overflow: "hidden"
  },
  growthFill: {
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.green
  },
  reminderLink: {
    marginTop: 10,
    minHeight: 34,
    borderRadius: 17,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C9D9C1",
    textDecorationLine: "none"
  },
  reminderText: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900"
  }
});
