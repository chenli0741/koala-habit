import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { encouragements, historyStats } from "../data/demo";
import { profileForChild, useKoalaStore } from "../data/store";
import { palette, shared } from "../ui/styles";

export default function RewardsScreen() {
  const { activeChild, missions, t, todayEnergy } = useKoalaStore();
  const profile = profileForChild(activeChild);
  const possibleEnergy = missions.reduce((sum, mission) => sum + mission.energy, 0);
  const percent = possibleEnergy ? Math.round((todayEnergy / possibleEnergy) * 100) : 0;
  const rewardCards = [
    { id: "today", label: t("todayEnergy"), value: `${todayEnergy}`, detail: t("energyEarned") },
    { id: "week", label: t("week"), value: `${historyStats.energyThisWeek}`, detail: t("weeklyRate") },
    { id: "encourage", label: t("goodMorning"), value: "TTS", detail: encouragements[1] }
  ];

  return (
    <View style={shared.screen}>
      <View style={shared.pageHeader}>
        <View>
          <Text style={shared.kicker}>{t("rewards")}</Text>
          <Text style={shared.title}>{t("playTimeGrows")}</Text>
          <Text style={shared.subtitle}>{t("entertainmentUnlocked")}</Text>
        </View>
        <Link href="/" style={shared.navButton}>
          <Text style={shared.navButtonText}>{t("backHome")}</Text>
        </Link>
      </View>

      <View style={styles.grid}>
        <View style={[shared.card, styles.summary]}>
          <Text style={styles.summaryLabel}>{t("energyEarned")}</Text>
          <Text style={styles.summaryValue}>
            {todayEnergy}/{possibleEnergy}
          </Text>
          <View style={styles.leafTrack}>
            <View style={[styles.leafFill, { width: `${percent}%` }]} />
          </View>
          <Text style={styles.summaryText}>
            {profile.companionName}'s growth tree gets brighter with each finished task.
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
