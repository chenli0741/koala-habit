import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { childProfile, encouragements, historyStats, missions } from "../data/demo";
import { palette, shared } from "../ui/styles";

const earnedEnergy = missions.reduce((sum, mission) => sum + (mission.status === "done" ? mission.energy : 0), 0);
const possibleEnergy = missions.reduce((sum, mission) => sum + mission.energy, 0);
const rewardCards = [
  { id: "today", label: "Today Energy", value: `${childProfile.todayEnergy}`, detail: "Energy grows when tasks are completed." },
  { id: "week", label: "Weekly Energy", value: `${historyStats.energyThisWeek}`, detail: "Family progress across the week." },
  { id: "encourage", label: "Encouragement", value: "TTS later", detail: encouragements[1] }
];

export default function RewardsScreen() {
  return (
    <View style={shared.screen}>
      <View style={shared.pageHeader}>
        <View>
          <Text style={shared.kicker}>Rewards</Text>
          <Text style={shared.title}>Play time grows from effort</Text>
          <Text style={shared.subtitle}>Entertainment is unlocked by balanced learning, movement, and life habits.</Text>
        </View>
        <Link href="/" style={shared.navButton}>
          <Text style={shared.navButtonText}>Back Home</Text>
        </Link>
      </View>

      <View style={styles.grid}>
        <View style={[shared.card, styles.summary]}>
          <Text style={styles.summaryLabel}>Energy earned</Text>
          <Text style={styles.summaryValue}>
            {earnedEnergy}/{possibleEnergy}
          </Text>
          <View style={styles.leafTrack}>
            <View style={[styles.leafFill, { width: `${Math.round((earnedEnergy / possibleEnergy) * 100)}%` }]} />
          </View>
          <Text style={styles.summaryText}>
            {childProfile.companionName}'s growth tree gets brighter with each finished task.
          </Text>
        </View>

        <View style={styles.rewardList}>
          {rewardCards.map((reward) => (
            <View key={reward.id} style={shared.card}>
              <Text style={styles.rewardLabel}>{reward.label}</Text>
              <Text style={styles.rewardValue}>{reward.value}</Text>
              <Text style={styles.rewardDetail}>{reward.detail}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    flexDirection: "row",
    gap: 22
  },
  summary: {
    flex: 1,
    backgroundColor: palette.deepGreen
  },
  summaryLabel: {
    color: "#CFE0CF",
    fontSize: 18,
    fontWeight: "800"
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 96,
    lineHeight: 110,
    fontWeight: "900",
    marginTop: 18
  },
  leafTrack: {
    height: 16,
    borderRadius: 8,
    backgroundColor: "#50675A",
    overflow: "hidden"
  },
  leafFill: {
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.gold
  },
  summaryText: {
    color: "#DDE8DC",
    fontSize: 19,
    lineHeight: 29,
    marginTop: 28
  },
  rewardList: {
    flex: 1.25,
    gap: 16
  },
  rewardLabel: {
    color: palette.muted,
    fontSize: 16,
    fontWeight: "800"
  },
  rewardValue: {
    color: palette.ink,
    fontSize: 42,
    lineHeight: 50,
    fontWeight: "900",
    marginTop: 8
  },
  rewardDetail: {
    color: palette.muted,
    fontSize: 17,
    lineHeight: 25,
    marginTop: 10
  }
});
