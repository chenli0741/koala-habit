import { Link, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { encouragements, getMission, missionStatusLabel } from "../../data/demo";
import { palette, shared } from "../../ui/styles";

export default function MissionDetailScreen() {
  const { id } = useLocalSearchParams();
  const mission = getMission(id);

  if (!mission) {
    return (
      <View style={shared.screen}>
        <View style={shared.pageHeader}>
          <View>
            <Text style={shared.kicker}>Mission</Text>
            <Text style={shared.title}>Not found</Text>
          </View>
          <Link href="/" style={shared.navButton}>
            <Text style={shared.navButtonText}>Back Home</Text>
          </Link>
        </View>
      </View>
    );
  }

  const percent = Math.round((mission.progress / mission.total) * 100);

  return (
    <View style={shared.screen}>
      <View style={shared.pageHeader}>
        <View style={styles.heading}>
          <Text style={shared.kicker}>{mission.category}</Text>
          <Text style={shared.title}>
            {mission.icon} {mission.title}
          </Text>
          <Text style={shared.subtitle}>{mission.detail}</Text>
        </View>
        <Link href="/" style={shared.navButton}>
          <Text style={shared.navButtonText}>Back Home</Text>
        </Link>
      </View>

      <View style={styles.grid}>
        <View style={[shared.card, styles.primaryCard]}>
          <View>
            <Text style={styles.cardTitle}>Goals</Text>
            {mission.goals.map((goal) => (
              <View key={goal} style={styles.goalRow}>
                <Text style={styles.goalCheck}>✓</Text>
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>

          <View>
            <View style={styles.bigNumberRow}>
              <Text style={[styles.bigNumber, { color: mission.tone }]}>{percent}%</Text>
              <Text style={styles.status}>{missionStatusLabel(mission.status)}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: mission.tone }]} />
            </View>
          </View>
        </View>

        <View style={[shared.card, styles.secondaryCard]}>
          <Text style={styles.cardTitle}>Submit Result</Text>
          <View style={styles.actionGrid}>
            <View style={styles.actionButton}>
              <Text style={styles.actionIcon}>✅</Text>
              <Text style={styles.actionText}>Complete</Text>
            </View>
            <View style={styles.actionButton}>
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionText}>Photo</Text>
            </View>
            <View style={styles.actionButton}>
              <Text style={styles.actionIcon}>🎤</Text>
              <Text style={styles.actionText}>Audio</Text>
            </View>
          </View>
          <View style={styles.encouragement}>
            <Text style={styles.koala}>🐨</Text>
            <View style={styles.encouragementCopy}>
              <Text style={styles.encouragementTitle}>AI encouragement</Text>
              <Text style={styles.bodyText}>{encouragements[0]}</Text>
            </View>
          </View>
          <View style={styles.rewardStrip}>
            <View>
              <Text style={styles.rewardLabel}>Reward</Text>
              <Text style={styles.rewardValue}>+{mission.energy}</Text>
            </View>
            <View>
              <Text style={styles.rewardLabel}>Target</Text>
              <Text style={styles.rewardTarget}>{mission.target}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flex: 1,
    maxWidth: 780
  },
  grid: {
    flex: 1,
    flexDirection: "row",
    gap: 22
  },
  primaryCard: {
    flex: 1.15,
    justifyContent: "space-between"
  },
  secondaryCard: {
    flex: 1
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: palette.ink,
    marginBottom: 16
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 48
  },
  goalCheck: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EEF3EA",
    color: palette.green,
    textAlign: "center",
    lineHeight: 30,
    fontWeight: "900"
  },
  goalText: {
    flex: 1,
    color: palette.ink,
    fontSize: 19,
    fontWeight: "800"
  },
  bigNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20
  },
  bigNumber: {
    fontSize: 92,
    lineHeight: 100,
    fontWeight: "900"
  },
  status: {
    borderRadius: 20,
    backgroundColor: "#EEF3EA",
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  progressTrack: {
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EEE8DD",
    overflow: "hidden"
  },
  progressFill: {
    height: 16,
    borderRadius: 8
  },
  actionGrid: {
    flexDirection: "row",
    gap: 12
  },
  actionButton: {
    flex: 1,
    minHeight: 108,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FAF7F0",
    alignItems: "center",
    justifyContent: "center"
  },
  actionIcon: {
    fontSize: 32
  },
  actionText: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 8
  },
  encouragement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 8,
    backgroundColor: "#E7F0E2",
    padding: 16,
    marginTop: 22
  },
  koala: {
    fontSize: 46
  },
  encouragementCopy: {
    flex: 1
  },
  encouragementTitle: {
    color: palette.green,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4
  },
  bodyText: {
    fontSize: 19,
    lineHeight: 29,
    color: palette.muted
  },
  rewardStrip: {
    marginTop: 26,
    flexDirection: "row",
    gap: 26
  },
  rewardLabel: {
    color: palette.muted,
    fontSize: 15,
    fontWeight: "800"
  },
  rewardValue: {
    marginTop: 6,
    color: palette.ink,
    fontSize: 40,
    fontWeight: "900"
  },
  rewardTarget: {
    marginTop: 10,
    color: palette.ink,
    fontSize: 20,
    fontWeight: "900"
  }
});
