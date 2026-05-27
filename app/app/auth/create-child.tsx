import { Link } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { demoChildren } from "../../data/auth";
import { palette, shared } from "../../ui/styles";

export default function CreateChildScreen() {
  return (
    <View style={shared.screen}>
      <View style={shared.pageHeader}>
        <View>
          <Text style={shared.kicker}>Child Account</Text>
          <Text style={shared.title}>Parent creates the child login</Text>
          <Text style={shared.subtitle}>Children use a simple numeric PIN instead of email or Google.</Text>
        </View>
        <Link href="/auth/parent-apple" style={shared.navButton}>
          <Text style={shared.navButtonText}>Back</Text>
        </Link>
      </View>

      <View style={styles.grid}>
        <View style={[shared.card, styles.form]}>
          <Text style={styles.cardTitle}>New child profile</Text>
          <Text style={styles.label}>Child name</Text>
          <TextInput style={styles.input} value="Caitlyn" editable={false} />
          <Text style={styles.label}>Age</Text>
          <TextInput style={styles.input} value="9" editable={false} keyboardType="number-pad" />
          <Text style={styles.label}>Avatar</Text>
          <TextInput style={styles.input} value="Koala avatar" editable={false} />
          <Text style={styles.label}>Grade</Text>
          <TextInput style={styles.input} value="3" editable={false} keyboardType="number-pad" />
          <Text style={styles.label}>Numeric PIN</Text>
          <TextInput style={styles.input} value="1234" editable={false} keyboardType="number-pad" secureTextEntry />
          <Link href="/auth/child-pin" style={shared.navButtonAlt}>
            <Text style={shared.navButtonAltText}>Try Child Login</Text>
          </Link>
        </View>

        <View style={[shared.card, styles.list]}>
          <Text style={styles.cardTitle}>Family children</Text>
          {demoChildren.map((child) => (
            <View key={child.id} style={styles.childRow}>
              <View style={styles.childAvatar}>
                <Text style={styles.childInitial}>{child.name[0]}</Text>
              </View>
              <View>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childMeta}>Grade {child.grade} · {child.pinHint}</Text>
              </View>
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
  form: {
    flex: 1
  },
  list: {
    flex: 1,
    backgroundColor: "#E7F0E2"
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 18
  },
  label: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8,
    marginTop: 12
  },
  input: {
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 16,
    color: palette.ink,
    backgroundColor: "#FAF7F0",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6
  },
  childRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    padding: 16
  },
  childAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.green,
    alignItems: "center",
    justifyContent: "center"
  },
  childInitial: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900"
  },
  childName: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: "900"
  },
  childMeta: {
    color: palette.muted,
    fontSize: 15,
    marginTop: 4
  }
});
