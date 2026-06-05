import { Link, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Mission } from "../data/demo";
import { profileForChild, useKoalaStore } from "../data/store";
import { palette, shared } from "../ui/styles";

export default function ParentScreen() {
  const { activeChild, completeMission, completedCount, logout, missions, t } = useKoalaStore();
  const profile = profileForChild(activeChild);
  const pendingMissions = missions.filter((mission) => mission.status !== "done");
  const completedMissions = missions.filter((mission) => mission.status === "done");
  const totalEnergy = completedMissions.reduce((sum, mission) => sum + mission.energy, 0);

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

      <View style={styles.grid}>
        <View style={[shared.card, styles.summaryCard]}>
          <Text style={styles.cardLabel}>{t("todayComplete")}</Text>
          <Text style={styles.bigMetric}>{completedCount}/{missions.length}</Text>
          <Text style={styles.summaryText}>{t("rewardEnergyEarned")}: {totalEnergy}</Text>
          <View style={styles.webNotice}>
            <Text style={styles.webNoticeTitle}>{t("webHandlesSetup")}</Text>
            <Text style={styles.webNoticeText}>{t("webHandlesSetupDetail")}</Text>
          </View>
        </View>

        <View style={[shared.card, styles.reviewCard]}>
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
                <Text style={styles.reviewMeta}>{mission.target} · {missionStatusText(mission.status, t)}</Text>
              </View>
              <Pressable style={styles.confirmButton} onPress={() => completeMission(mission.id, { note: "Parent quick confirmed on iPad" })}>
                <Text style={styles.confirmText}>{t("confirm")}</Text>
              </Pressable>
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
  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  summaryCard: {
    flex: 0.9,
    backgroundColor: palette.deepGreen
  },
  reviewCard: {
    flex: 1.3
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
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE8DD"
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
  confirmButton: {
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: palette.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
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
  return status === "done" ? t("done") : status === "in_progress" ? t("inProgress") : t("todo");
}
