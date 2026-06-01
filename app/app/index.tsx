import { Link, Redirect } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { fetchMissions } from "../data/api";
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
  const { activeChild, completedCount, isSessionReady, missions, parent, t, todayEnergy } = useKoalaStore();
  const [taskViewMode, setTaskViewMode] = useState<TaskViewMode>("day");
  const [calendarMissions, setCalendarMissions] = useState<Mission[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const profile = profileForChild(activeChild);
  const totalTasks = missions.length;
  const today = useMemo(() => todayKey(), []);
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

  if (!activeChild) {
    return <Redirect href="/auth/child-pin" />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.sidebar}>
        <Text style={styles.logo}>Koala Habit</Text>
        <View style={styles.childCard}>
          <KoalaAvatar />
          <Text style={styles.childName}>{profile.name}</Text>
          <Text style={styles.childSubtext}>{t("growthTree")}</Text>
        </View>
        <View style={styles.energyCard}>
          <Text style={styles.energyLabel}>{t("todayEnergy")}</Text>
          <Text style={styles.energyValue}>⭐ {todayEnergy}</Text>
          <Text style={styles.energyMeta}>{t("readingStreak")}: {profile.readingStreakDays}</Text>
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={shared.kicker}>{t("today")}</Text>
            <Text style={shared.title}>🌞 {t("goodMorning")}, {profile.name}!</Text>
            <Text style={shared.subtitle}>{t("summerHabits")}</Text>
          </View>
          <View style={styles.headerActions}>
            <Link href="/parent" style={shared.navButtonAlt}>
              <Text style={shared.navButtonAltText}>{t("parent")}</Text>
            </Link>
            <Link href="/auth/child-pin" style={shared.navButtonAlt}>
              <Text style={shared.navButtonAltText}>{t("switchChild")}</Text>
            </Link>
            <Link href="/growth-tree" style={shared.navButton}>
              <Text style={shared.navButtonText}>{t("growthTree")}</Text>
            </Link>
          </View>
        </View>

        <View style={styles.contentGrid}>
          <View style={styles.missionPanel}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelTitle}>{taskViewMode === "day" ? t("todayTasks") : t("taskCalendar")}</Text>
                <TaskViewSwitch value={taskViewMode} onChange={setTaskViewMode} t={t} />
              </View>
              <View style={styles.panelActions}>
                <Link href="/parent" style={styles.smallLink}>
                  <Text style={styles.smallLinkText}>{t("manage")}</Text>
                </Link>
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

          <View style={styles.companionPanel}>
            <Text style={styles.panelTitle}>{t("growthTree")}</Text>
            <LargeKoala />
            <Text style={styles.companionName}>Lv{childProfile.treeLevel} {t("youngTree")}</Text>
            <Text style={styles.companionText}>
              {completedCount}/{totalTasks} {t("todayComplete")}
            </Text>
            <View style={styles.growthTrack}>
              <View style={[styles.growthFill, { width: `${childProfile.treeGrowth}%` }]} />
            </View>
            <Link href="/reminders" style={styles.reminderLink}>
              <Text style={styles.reminderText}>{t("reminders")}</Text>
            </Link>
          </View>
        </View>
      </View>
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
          style={[styles.viewSwitchButton, value === mode && styles.viewSwitchButtonActive]}
        >
          <Text style={[styles.viewSwitchText, value === mode && styles.viewSwitchTextActive]}>{t(mode)}</Text>
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekBoard}>
        {calendarDays.map((day) => {
          const dayMissions = missionsForDate(missions, day.key);
          const done = dayMissions.filter((mission) => mission.status === "done").length;
          return (
            <View key={day.key} style={[styles.weekColumn, day.key === today && styles.weekColumnToday]}>
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
      </ScrollView>
    );
  }

  return (
    <>
      {missions.map((mission) => {
        const percent = Math.round((mission.progress / mission.total) * 100);
        return (
          <Link key={mission.id} href={`/mission/${mission.id}`} style={styles.missionCard}>
            <Text style={styles.missionIcon}>{mission.icon}</Text>
            <View style={styles.missionBody}>
              <View style={styles.missionTitleRow}>
                <Text style={styles.missionLabel}>{mission.title}</Text>
                <Text style={styles.status}>{missionStatusText(mission.status, t)}</Text>
              </View>
              <View style={styles.missionMetaRow}>
                <Text style={styles.missionDetail}>{mission.target}</Text>
                {mission.timeLimitMinutes ? (
                  <Text style={styles.timeLimitPill}>{mission.timeLimitMinutes} min</Text>
                ) : null}
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: mission.tone }]} />
              </View>
            </View>
            <Text style={styles.missionCount}>
              +{mission.energy}
            </Text>
          </Link>
        );
      })}
    </>
  );
}

function missionStatusText(status: Mission["status"], t: (key: string) => string) {
  return status === "done" ? t("done") : status === "in_progress" ? t("inProgress") : t("todo");
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

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function KoalaAvatar() {
  return (
    <View style={styles.avatar}>
      <View style={styles.earLeft} />
      <View style={styles.earRight} />
      <View style={styles.face} />
    </View>
  );
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
    gap: 24
  },
  sidebar: {
    width: 280,
    gap: 18
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
  avatar: {
    width: 112,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
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
    gap: 22
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
  headerActions: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 6
  },
  contentGrid: {
    flex: 1,
    flexDirection: "row",
    gap: 22
  },
  missionPanel: {
    ...shared.card,
    flex: 1.45
  },
  companionPanel: {
    flex: 1,
    backgroundColor: "#E7F0E2",
    borderRadius: 8,
    padding: 20,
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
  missionCard: {
    minHeight: 112,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E7DED0",
    padding: 16,
    marginBottom: 14,
    gap: 14,
    textDecorationLine: "none"
  },
  missionIcon: {
    width: 54,
    fontSize: 34,
    textAlign: "center"
  },
  missionBody: {
    flex: 1
  },
  missionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  missionLabel: {
    fontSize: 20,
    fontWeight: "900",
    color: palette.ink
  },
  status: {
    fontSize: 13,
    fontWeight: "800",
    color: palette.muted
  },
  missionDetail: {
    flex: 1,
    fontSize: 15,
    color: palette.muted
  },
  missionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4
  },
  timeLimitPill: {
    borderRadius: 8,
    backgroundColor: "#EEF3EA",
    color: palette.green,
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  progressTrack: {
    height: 9,
    borderRadius: 5,
    backgroundColor: "#EEE8DD",
    marginTop: 14,
    overflow: "hidden"
  },
  progressFill: {
    height: 9,
    borderRadius: 5
  },
  missionCount: {
    width: 58,
    textAlign: "right",
    fontSize: 18,
    fontWeight: "900",
    color: palette.ink
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
    gap: 10,
    paddingBottom: 4
  },
  weekColumn: {
    width: 132,
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
    width: 230,
    height: 210,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    marginBottom: 22
  },
  bigEarLeft: {
    position: "absolute",
    left: 18,
    top: 12,
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#526350"
  },
  bigEarRight: {
    position: "absolute",
    right: 18,
    top: 12,
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#526350"
  },
  bigFace: {
    width: 178,
    height: 160,
    borderRadius: 89,
    backgroundColor: palette.leaf,
    borderWidth: 12,
    borderColor: "#526350",
    alignItems: "center",
    justifyContent: "center"
  },
  eyeRow: {
    flexDirection: "row",
    gap: 44,
    marginBottom: 14
  },
  eye: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: palette.ink
  },
  nose: {
    width: 28,
    height: 20,
    borderRadius: 12,
    backgroundColor: palette.ink
  },
  companionName: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    color: palette.ink,
    textAlign: "center"
  },
  companionText: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 23,
    color: "#526350",
    textAlign: "center"
  },
  growthTrack: {
    width: "100%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D1DECB",
    marginTop: 22,
    overflow: "hidden"
  },
  growthFill: {
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.green
  },
  reminderLink: {
    marginTop: 18,
    minHeight: 42,
    borderRadius: 21,
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
