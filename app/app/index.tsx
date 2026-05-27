import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { childProfile, historyStats, missionStatusLabel, missions } from "../data/demo";
import { palette, shared } from "../ui/styles";

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.sidebar}>
        <Text style={styles.logo}>Koala Habit</Text>
        <View style={styles.childCard}>
          <KoalaAvatar />
          <Text style={styles.childName}>{childProfile.name}'s Day</Text>
          <Text style={styles.childSubtext}>Earn leaves, unlock play, grow together.</Text>
        </View>
        <View style={styles.energyCard}>
          <Text style={styles.energyLabel}>Today Energy</Text>
          <Text style={styles.energyValue}>⭐ {childProfile.todayEnergy}</Text>
          <Text style={styles.energyMeta}>Reading streak: {childProfile.readingStreakDays} days</Text>
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={shared.kicker}>Today</Text>
            <Text style={shared.title}>🌞 Good Morning, {childProfile.name}!</Text>
            <Text style={shared.subtitle}>Summer habits: reading, math, music, Chinese, and soccer.</Text>
          </View>
          <View style={styles.headerActions}>
            <Link href="/auth" style={styles.navButtonLight}>
              <Text style={styles.navButtonLightText}>Account Setup</Text>
            </Link>
            <Link href="/parent" style={shared.navButtonAlt}>
              <Text style={shared.navButtonAltText}>Parent</Text>
            </Link>
            <Link href="/growth-tree" style={shared.navButton}>
              <Text style={shared.navButtonText}>Growth Tree</Text>
            </Link>
          </View>
        </View>

        <View style={styles.contentGrid}>
          <View style={styles.missionPanel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Today Tasks</Text>
              <Link href="/history" style={styles.smallLink}>
                <Text style={styles.smallLinkText}>History</Text>
              </Link>
            </View>
            {missions.map((mission) => {
              const percent = Math.round((mission.progress / mission.total) * 100);
              return (
                <Link key={mission.id} href={`/mission/${mission.id}`} style={styles.missionCard}>
                  <Text style={styles.missionIcon}>{mission.icon}</Text>
                  <View style={styles.missionBody}>
                    <View style={styles.missionTitleRow}>
                      <Text style={styles.missionLabel}>{mission.title}</Text>
                      <Text style={styles.status}>{missionStatusLabel(mission.status)}</Text>
                    </View>
                    <Text style={styles.missionDetail}>{mission.target}</Text>
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
          </View>

          <View style={styles.companionPanel}>
            <Text style={styles.panelTitle}>Growth Tree</Text>
            <LargeKoala />
            <Text style={styles.companionName}>Lv{childProfile.treeLevel} Young Tree</Text>
            <Text style={styles.companionText}>
              {historyStats.todayCompleted}/{historyStats.totalToday} tasks finished today. Complete more tasks to grow leaves.
            </Text>
            <View style={styles.growthTrack}>
              <View style={[styles.growthFill, { width: `${childProfile.treeGrowth}%` }]} />
            </View>
            <Link href="/reminders" style={styles.reminderLink}>
              <Text style={styles.reminderText}>Reminders</Text>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
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
  navButtonLight: {
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: palette.line,
    textDecorationLine: "none"
  },
  navButtonLightText: {
    fontSize: 15,
    fontWeight: "900",
    color: palette.ink
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
    marginTop: 4,
    fontSize: 15,
    color: palette.muted
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
