import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useKoalaStore } from "../../data/store";
import { palette, shared } from "../../ui/styles";

export default function ParentAppleScreen() {
  const { parent, signInParent, t } = useKoalaStore();
  const [name, setName] = useState(parent?.name ?? "Chen");
  const [email, setEmail] = useState(parent?.email ?? "parent@example.com");

  async function handleSignIn() {
    const result = await signInParent(name, email);
    router.replace(result.hasChildren ? "/auth/child-pin" : "/auth/create-child");
  }

  return (
    <View style={shared.screen}>
      <View style={shared.pageHeader}>
        <View>
          <Text style={shared.kicker}>{t("parent")} {t("loginModel")}</Text>
          <Text style={shared.title}>{t("appleCreatesFamily")}</Text>
          <Text style={shared.subtitle}>
            This is a product-flow placeholder for Apple Sign In. The backend exposes a mock parent Apple session endpoint.
          </Text>
        </View>
        <Link href="/auth" style={shared.navButton}>
          <Text style={shared.navButtonText}>{t("back")}</Text>
        </Link>
      </View>

      <View style={styles.grid}>
        <View style={[shared.card, styles.appleCard]}>
          <Text style={styles.appleIcon}></Text>
          <Text style={styles.cardTitle}>{t("continueApple")}</Text>
          <Text style={styles.bodyText}>
            Enter parent details for this local demo account. Real Apple Sign In can exchange an identity token with the backend later.
          </Text>
          <View style={styles.profilePreview}>
            <Text style={styles.label}>{t("parentName")}</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t("parentName")} />
            <Text style={styles.label}>{t("email")}</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="parent@example.com"
              style={styles.input}
              value={email}
            />
          </View>
          <Pressable style={styles.primaryAction} onPress={handleSignIn}>
            <Text style={shared.navButtonText}>{t("signInCreateAccount")}</Text>
          </Pressable>
        </View>

        <View style={[shared.card, styles.nextCard]}>
          <Text style={styles.cardTitle}>{t("nextStep")}</Text>
          <Text style={styles.bodyText}>
            After the parent session is created, the parent creates child accounts and assigns each child a numeric PIN.
          </Text>
          <Link href="/auth/create-child" style={shared.navButtonAlt}>
          <Text style={shared.navButtonAltText}>{t("createChildAccount")}</Text>
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
  input: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FFFFFF",
    color: palette.ink,
    fontSize: 18,
    fontWeight: "800",
    paddingHorizontal: 14,
    marginTop: 8,
    marginBottom: 12
  },
  primaryAction: {
    ...shared.navButton,
    marginTop: 18
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
