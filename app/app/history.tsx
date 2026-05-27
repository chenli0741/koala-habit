import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { historyStats, missions } from "../data/demo";
import { palette, shared } from "../ui/styles";

export default function HistoryScreen() {
  return (
    <View style={shared.screen}>
      <View style={shared.pageHeader}>
        <View>
          <Text style={shared.kicker}>History</Text>
          <Text style={shared.title}>Summer habit record</Text>
          <Text style={shared.subtitle}>Track today, this week, and reading streaks.</Text>
        </View>
        <Link href="/" style={shared.navButton}>
          <Text style={shared.navButtonText}>Back Today</Text>
        </Link>
      </View>

      <View style={styles.metrics}>
        <View style={[shared.card, styles.metric]}>
          <Text style={styles.metricLabel}>Today completed</Text>
          <Text style={styles.metricValue}>
            {historyStats.todayCompleted}/{historyStats.totalToday}
          </Text>
        </View>
        <View style={[shared.card, styles.metric]}>
          <Text style={styles.metricLabel}>Weekly rate</Text>
          <Text style={styles.metricValue}>{historyStats.weeklyCompletionRate}%</Text>
        </View>
        <View style={[shared.card, styles.metric]}>
          <Text style={styles.metricLabel}>🔥 Reading Streak</Text>
          <Text style={styles.metricValue}>{historyStats.readingStreakDays} days</Text>
        </View>
      </View>

      <View style={[shared.card, styles.timeline]}>
        <Text style={styles.sectionTitle}>Today</Text>
        {missions.map((mission) => (
          <View key={mission.id} style={styles.row}>
            <Text style={styles.icon}>{mission.icon}</Text>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{mission.title}</Text>
              <Text style={styles.rowMeta}>{mission.target}</Text>
            </View>
            <Text style={styles.rowStatus}>{mission.status === "done" ? "Done" : "Open"}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20
  },
  metric: {
    flex: 1
  },
  metricLabel: {
    color: palette.muted,
    fontSize: 15,
    fontWeight: "900"
  },
  metricValue: {
    color: palette.ink,
    fontSize: 42,
    lineHeight: 52,
    fontWeight: "900",
    marginTop: 10
  },
  timeline: {
    flex: 1
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 12
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 68,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE8DD",
    gap: 14
  },
  icon: {
    width: 42,
    fontSize: 28,
    textAlign: "center"
  },
  rowCopy: {
    flex: 1
  },
  rowTitle: {
    color: palette.ink,
    fontSize: 19,
    fontWeight: "900"
  },
  rowMeta: {
    color: palette.muted,
    fontSize: 15,
    marginTop: 3
  },
  rowStatus: {
    color: palette.green,
    fontSize: 15,
    fontWeight: "900"
  }
});
