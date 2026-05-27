import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { childProfile, growthStages } from "../data/demo";
import { palette, shared } from "../ui/styles";

export default function GrowthTreeScreen() {
  return (
    <View style={shared.screen}>
      <View style={shared.pageHeader}>
        <View>
          <Text style={shared.kicker}>Growth Tree</Text>
          <Text style={shared.title}>Every task grows the tree</Text>
          <Text style={shared.subtitle}>Complete tasks to glow, grow leaves, and collect stars.</Text>
        </View>
        <Link href="/" style={shared.navButton}>
          <Text style={shared.navButtonText}>Back Today</Text>
        </Link>
      </View>

      <View style={styles.grid}>
        <View style={[shared.card, styles.treePanel]}>
          <View style={styles.stars}>
            <Text style={styles.star}>✦</Text>
            <Text style={styles.starSmall}>✧</Text>
            <Text style={styles.star}>✦</Text>
          </View>
          <View style={styles.tree}>
            <View style={styles.leafCloud}>
              <View style={[styles.leaf, styles.leafOne]} />
              <View style={[styles.leaf, styles.leafTwo]} />
              <View style={[styles.leaf, styles.leafThree]} />
              <View style={[styles.leaf, styles.leafFour]} />
            </View>
            <View style={styles.trunk} />
            <View style={styles.ground} />
          </View>
          <Text style={styles.level}>Lv{childProfile.treeLevel} Young Tree</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${childProfile.treeGrowth}%` }]} />
          </View>
        </View>

        <View style={styles.stageList}>
          {growthStages.map((stage) => (
            <View key={stage.level} style={[shared.card, stage.level === childProfile.treeLevel && styles.activeStage]}>
              <Text style={styles.stageLevel}>Lv{stage.level}</Text>
              <Text style={styles.stageTitle}>{stage.title}</Text>
              <Text style={styles.stageDescription}>{stage.description}</Text>
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
  treePanel: {
    flex: 1.1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F0E2"
  },
  stars: {
    position: "absolute",
    top: 34,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  star: {
    color: palette.gold,
    fontSize: 46
  },
  starSmall: {
    color: palette.gold,
    fontSize: 28,
    marginTop: 22
  },
  tree: {
    width: 320,
    height: 320,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  leafCloud: {
    position: "absolute",
    top: 18,
    width: 250,
    height: 190
  },
  leaf: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: palette.green
  },
  leafOne: {
    left: 60,
    top: 20,
    width: 120,
    height: 100
  },
  leafTwo: {
    left: 10,
    top: 84,
    width: 120,
    height: 92
  },
  leafThree: {
    right: 8,
    top: 82,
    width: 120,
    height: 96
  },
  leafFour: {
    left: 78,
    top: 102,
    width: 110,
    height: 98
  },
  trunk: {
    width: 54,
    height: 150,
    borderRadius: 24,
    backgroundColor: "#8A5A35"
  },
  ground: {
    width: 220,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#D8C8A6",
    marginTop: -6
  },
  level: {
    color: palette.ink,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 18
  },
  progressTrack: {
    width: "80%",
    height: 14,
    borderRadius: 7,
    backgroundColor: "#D1DECB",
    marginTop: 18,
    overflow: "hidden"
  },
  progressFill: {
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.gold
  },
  stageList: {
    flex: 1,
    gap: 12
  },
  activeStage: {
    borderColor: palette.green,
    backgroundColor: "#EEF7EA"
  },
  stageLevel: {
    color: palette.green,
    fontSize: 14,
    fontWeight: "900"
  },
  stageTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 4
  },
  stageDescription: {
    color: palette.muted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 6
  }
});
