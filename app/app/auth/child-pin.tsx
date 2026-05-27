import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { demoChildren } from "../../data/auth";
import { palette, shared } from "../../ui/styles";

const pinDigits = ["1", "2", "3", "4"];

export default function ChildPinScreen() {
  const child = demoChildren[0];

  return (
    <View style={styles.screen}>
      <View style={styles.loginPanel}>
        <Text style={shared.kicker}>Child Login</Text>
        <Text style={shared.title}>Hi {child.name}</Text>
        <Text style={shared.subtitle}>Enter your number code to start today's missions.</Text>

        <View style={styles.pinRow}>
          {pinDigits.map((digit, index) => (
            <View key={`${digit}-${index}`} style={styles.pinBox}>
              <Text style={styles.pinDigit}>{digit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Link href="/" style={shared.navButtonAlt}>
            <Text style={shared.navButtonAltText}>Unlock Missions</Text>
          </Link>
          <Link href="/auth" style={shared.navButton}>
            <Text style={shared.navButtonText}>Switch Account</Text>
          </Link>
        </View>
      </View>

      <View style={styles.companionPanel}>
        <View style={styles.koala}>
          <View style={styles.earLeft} />
          <View style={styles.earRight} />
          <View style={styles.face}>
            <View style={styles.eyeRow}>
              <View style={styles.eye} />
              <View style={styles.eye} />
            </View>
            <View style={styles.nose} />
          </View>
        </View>
        <Text style={styles.companionTitle}>Koko is waiting</Text>
        <Text style={styles.companionText}>Kids get a private PIN created by a parent. No email required.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: "row",
    gap: 24,
    padding: 28,
    backgroundColor: palette.paper
  },
  loginPanel: {
    ...shared.card,
    flex: 1.2,
    justifyContent: "center"
  },
  pinRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 34,
    marginBottom: 28
  },
  pinBox: {
    width: 76,
    height: 88,
    borderRadius: 8,
    backgroundColor: "#FAF7F0",
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: "center",
    justifyContent: "center"
  },
  pinDigit: {
    color: palette.ink,
    fontSize: 42,
    fontWeight: "900"
  },
  actions: {
    flexDirection: "row",
    gap: 12
  },
  companionPanel: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: "#E7F0E2",
    borderWidth: 1,
    borderColor: "#C9D9C1",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  koala: {
    width: 230,
    height: 210,
    alignItems: "center",
    justifyContent: "center"
  },
  earLeft: {
    position: "absolute",
    left: 18,
    top: 12,
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#526350"
  },
  earRight: {
    position: "absolute",
    right: 18,
    top: 12,
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#526350"
  },
  face: {
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
  companionTitle: {
    color: palette.ink,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 18
  },
  companionText: {
    color: palette.muted,
    fontSize: 18,
    lineHeight: 27,
    marginTop: 10,
    textAlign: "center"
  }
});
