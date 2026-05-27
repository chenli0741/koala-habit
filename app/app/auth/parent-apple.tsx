import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { demoParent } from "../../data/auth";
import { palette, shared } from "../../ui/styles";

export default function ParentAppleScreen() {
  return (
    <View style={shared.screen}>
      <View style={shared.pageHeader}>
        <View>
          <Text style={shared.kicker}>Parent Login</Text>
          <Text style={shared.title}>Apple creates the family account</Text>
          <Text style={shared.subtitle}>
            This is a product-flow placeholder for Apple Sign In. The backend exposes a mock parent Apple session endpoint.
          </Text>
        </View>
        <Link href="/auth" style={shared.navButton}>
          <Text style={shared.navButtonText}>Back</Text>
        </Link>
      </View>

      <View style={styles.grid}>
        <View style={[shared.card, styles.appleCard]}>
          <Text style={styles.appleIcon}></Text>
          <Text style={styles.cardTitle}>Continue with Apple</Text>
          <Text style={styles.bodyText}>
            Real Apple Sign In will exchange an identity token with `/auth/apple/parent`.
          </Text>
          <View style={styles.profilePreview}>
            <Text style={styles.label}>Demo signed-in parent</Text>
            <Text style={styles.parentName}>{demoParent.name}</Text>
            <Text style={styles.parentEmail}>{demoParent.email}</Text>
          </View>
        </View>

        <View style={[shared.card, styles.nextCard]}>
          <Text style={styles.cardTitle}>Next step</Text>
          <Text style={styles.bodyText}>
            After the parent session is created, the parent creates child accounts and assigns each child a numeric PIN.
          </Text>
          <Link href="/auth/create-child" style={shared.navButtonAlt}>
            <Text style={shared.navButtonAltText}>Create Child Account</Text>
          </Link>
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
  appleCard: {
    flex: 1
  },
  nextCard: {
    flex: 1,
    backgroundColor: "#E7F0E2",
    justifyContent: "space-between"
  },
  appleIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#111111",
    color: "#FFFFFF",
    fontSize: 42,
    lineHeight: 72,
    textAlign: "center",
    fontWeight: "900",
    marginBottom: 22
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 14
  },
  bodyText: {
    color: palette.muted,
    fontSize: 18,
    lineHeight: 28
  },
  profilePreview: {
    backgroundColor: "#F6F1E8",
    borderRadius: 8,
    padding: 18,
    marginTop: 28
  },
  label: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: "800"
  },
  parentName: {
    color: palette.ink,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 8
  },
  parentEmail: {
    color: palette.muted,
    fontSize: 16,
    marginTop: 4
  }
});
