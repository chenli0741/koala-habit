import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { authSteps } from "../../data/auth";
import { useKoalaStore } from "../../data/store";
import { palette, shared } from "../../ui/styles";

type AuthMode = "login" | "register";

export default function AuthStartScreen() {
  const { activeChild, children, loginParent, parent, registerParent, t } = useKoalaStore();
  const { width } = useWindowDimensions();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [name, setName] = useState(parent?.name ?? "Chen");
  const [email, setEmail] = useState(parent?.email ?? "parent@example.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!email.trim() || password.length < 6 || (authMode === "register" && !name.trim())) {
      setMessage(t("nameEmailPasswordRequired"));
      return;
    }

    if (authMode === "login") {
      if (await loginParent(email, password)) {
        setMessage(t("signedIn"));
        router.replace("/auth/child-pin");
        return;
      }

      setMessage(t("loginFailed"));
      return;
    }

    await registerParent(name, email, password);
    setMessage(t("registeredParent"));
    router.replace("/auth/child-pin");
  }

  const isCompact = width < 900;

  return (
    <ScrollView style={styles.scroller} contentContainerStyle={[styles.screen, isCompact && styles.screenCompact]}>
      <View style={[styles.hero, isCompact && styles.heroCompact]}>
        <Text style={shared.kicker}>{t("parentLogin")}</Text>
        <Text style={[shared.title, isCompact && styles.titleCompact]}>
          {authMode === "login" ? t("signIn") : t("createAccount")}
        </Text>
        <Text style={[shared.subtitle, isCompact && styles.subtitleCompact]}>{t("kidsNoEmail")}</Text>
        <View style={styles.registerBox}>
          <View style={styles.modeSwitch}>
            {(["login", "register"] as AuthMode[]).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => {
                  setAuthMode(mode);
                  setMessage("");
                }}
                style={[styles.modeButton, authMode === mode && styles.modeButtonActive]}
              >
                <Text style={[styles.modeText, authMode === mode && styles.modeTextActive]}>
                  {mode === "login" ? t("signIn") : t("register")}
                </Text>
              </Pressable>
            ))}
          </View>
          {authMode === "register" ? (
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t("parentName")} />
          ) : null}
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="parent@example.com"
          />
          <TextInput
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={t("password")}
          />
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Pressable style={shared.navButtonAlt} onPress={handleSubmit}>
            <Text style={shared.navButtonAltText}>{authMode === "login" ? t("signIn") : t("register")}</Text>
          </Pressable>
        </View>
        <View style={styles.actions}>
          {parent ? <Link href="/auth/child-pin" style={shared.navButtonAlt}>
            <Text style={shared.navButtonAltText}>{t("childPinLogin")}</Text>
          </Link> : null}
        </View>
      </View>

      <View style={[styles.panel, isCompact && styles.panelCompact]}>
        <Text style={[styles.panelTitle, isCompact && styles.panelTitleCompact]}>{t("loginModel")}</Text>
        {authSteps.map((step, index) => (
          <View key={step} style={[styles.stepRow, isCompact && styles.stepRowCompact]}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <Text style={[styles.stepText, isCompact && styles.stepTextCompact]}>{step}</Text>
          </View>
        ))}
        <View style={styles.demoBox}>
          <Text style={styles.demoLabel}>{t("currentFamily")}</Text>
          <Text style={styles.demoValue}>{parent?.name ?? t("noParentSignedIn")}</Text>
          <Text style={styles.demoEmail}>{parent?.email ?? "Create or login first"}</Text>
          <Text style={styles.provider}>
            {children.length} child profile{children.length === 1 ? "" : "s"} · {t("active")}: {activeChild?.name ?? "None"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: {
    flex: 1,
    backgroundColor: palette.paper
  },
  screen: {
    flexGrow: 1,
    flexDirection: "row",
    gap: 24,
    backgroundColor: palette.paper,
    padding: 28
  },
  screenCompact: {
    flexDirection: "column",
    paddingHorizontal: 22,
    paddingTop: 72,
    paddingBottom: 28
  },
  hero: {
    flex: 1.25,
    justifyContent: "center"
  },
  heroCompact: {
    flex: 0,
    justifyContent: "flex-start"
  },
  titleCompact: {
    fontSize: 36,
    lineHeight: 40
  },
  subtitleCompact: {
    fontSize: 16,
    lineHeight: 23
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 28
  },
  registerBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 16,
    marginTop: 24,
    width: "100%",
    maxWidth: 560
  },
  formTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12
  },
  modeSwitch: {
    flexDirection: "row",
    alignSelf: "stretch",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FAF7F0",
    marginBottom: 14,
    overflow: "hidden"
  },
  modeButton: {
    flex: 1,
    minHeight: 38,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12
  },
  modeButtonActive: {
    backgroundColor: palette.deepGreen
  },
  modeText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  modeTextActive: {
    color: "#FFFFFF"
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FAF7F0",
    color: palette.ink,
    fontSize: 16,
    fontWeight: "800",
    paddingHorizontal: 14,
    marginBottom: 10
  },
  message: {
    color: palette.green,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 10
  },
  panel: {
    ...shared.card,
    flex: 1,
    justifyContent: "center"
  },
  panelCompact: {
    flex: 0,
    justifyContent: "flex-start"
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: palette.ink,
    marginBottom: 18
  },
  panelTitleCompact: {
    fontSize: 22
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 58
  },
  stepRowCompact: {
    alignItems: "flex-start",
    minHeight: 0,
    marginBottom: 14
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
  stepTextCompact: {
    fontSize: 16,
    lineHeight: 21
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
