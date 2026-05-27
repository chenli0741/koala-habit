import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { authSteps, demoParent } from "../../data/auth";
import { palette, shared } from "../../ui/styles";

export default function AuthStartScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={shared.kicker}>Account Setup</Text>
        <Text style={shared.title}>Parents start with Apple</Text>
        <Text style={shared.subtitle}>
          A parent owns the family account. Children do not need email; they get a profile and numeric PIN created by the parent.
        </Text>
        <View style={styles.actions}>
          <Link href="/auth/parent-apple" style={shared.navButton}>
            <Text style={shared.navButtonText}>Continue with Apple</Text>
          </Link>
          <Link href="/auth/child-pin" style={shared.navButtonAlt}>
            <Text style={shared.navButtonAltText}>Child PIN Login</Text>
          </Link>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Login model</Text>
        {authSteps.map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
        <View style={styles.demoBox}>
          <Text style={styles.demoLabel}>Demo parent</Text>
          <Text style={styles.demoValue}>{demoParent.name}</Text>
          <Text style={styles.demoEmail}>{demoParent.email}</Text>
          <Text style={styles.provider}>First version: Apple Sign In · Google later</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: "row",
    gap: 24,
    backgroundColor: palette.paper,
    padding: 28
  },
  hero: {
    flex: 1.25,
    justifyContent: "center"
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28
  },
  panel: {
    ...shared.card,
    flex: 1,
    justifyContent: "center"
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: palette.ink,
    marginBottom: 18
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 58
  },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.green,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 34,
    fontWeight: "900"
  },
  stepText: {
    flex: 1,
    color: palette.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  demoBox: {
    backgroundColor: "#EEF3EA",
    borderRadius: 8,
    padding: 18,
    marginTop: 26
  },
  demoLabel: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: "800"
  },
  demoValue: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 6
  },
  demoEmail: {
    color: palette.muted,
    fontSize: 16,
    marginTop: 4
  },
  provider: {
    color: palette.green,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 10
  }
});
