import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useKoalaStore } from "../../data/store";
import { palette, shared } from "../../ui/styles";

export default function RegisterScreen() {
  const { registerParent, t } = useKoalaStore();
  const { width } = useWindowDimensions();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isCompact = width < 900;

  async function handleRegister() {
    const nextError = validateRegisterForm(name, email, password, confirmPassword, t);

    if (nextError) {
      setError(nextError);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await registerParent(name, email, password);
      router.replace("/auth/create-family");
    } catch {
      setError(t("registrationFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView style={styles.scroller} contentContainerStyle={StyleSheet.flatten([styles.screen, isCompact && styles.screenCompact])}>
      <View style={[styles.copy, isCompact && styles.copyCompact]}>
        <Text style={shared.kicker}>{t("parentOnlyRegistration")}</Text>
        <Text style={[shared.title, isCompact && styles.titleCompact]}>{t("registerParentAccount")}</Text>
        <Text style={[shared.subtitle, isCompact && styles.subtitleCompact]}>{t("kidsNoEmail")}</Text>
      </View>

      <View style={[shared.card, styles.form]}>
        <Text style={styles.formTitle}>{t("createAccount")}</Text>
        <Text style={styles.label}>{t("parentName")}</Text>
        <TextInput
          autoCapitalize="words"
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t("parentName")}
        />
        <Text style={styles.label}>{t("email")}</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="parent@example.com"
        />
        <Text style={styles.label}>{t("password")}</Text>
        <TextInput
          autoComplete="new-password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder={t("password")}
        />
        <Text style={styles.label}>{t("confirmPassword")}</Text>
        <TextInput
          autoComplete="new-password"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t("confirmPassword")}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Pressable disabled={isLoading} style={[shared.navButtonAlt, isLoading && styles.buttonDisabled]} onPress={handleRegister}>
          {isLoading ? <ActivityIndicator color="#392D12" /> : <Text style={shared.navButtonAltText}>{t("register")}</Text>}
        </Pressable>
        <Link href="/auth" style={styles.loginLink}>
          <Text style={styles.loginLinkText}>{t("signIn")}</Text>
        </Link>
      </View>
    </ScrollView>
  );
}

function validateRegisterForm(name: string, email: string, password: string, confirmPassword: string, t: (key: string) => string) {
  if (!name.trim()) {
    return t("parentNameRequired");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return t("emailInvalid");
  }

  if (password.length < 8) {
    return t("passwordTooShort");
  }

  if (password !== confirmPassword) {
    return t("passwordsDoNotMatch");
  }

  return "";
}

const styles = StyleSheet.create({
  scroller: {
    flex: 1,
    backgroundColor: palette.paper
  },
  screen: {
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 28,
    padding: 28
  },
  screenCompact: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingTop: 72
  },
  copy: {
    flex: 1.1
  },
  copyCompact: {
    flex: 0
  },
  titleCompact: {
    fontSize: 36,
    lineHeight: 40
  },
  subtitleCompact: {
    fontSize: 16,
    lineHeight: 23
  },
  form: {
    flex: 1,
    maxWidth: 560
  },
  formTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 14
  },
  label: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 7,
    marginTop: 10
  },
  input: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FAF7F0",
    color: palette.ink,
    fontSize: 16,
    fontWeight: "800",
    paddingHorizontal: 14
  },
  errorText: {
    color: "#B75F4A",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 12,
    marginTop: 14
  },
  buttonDisabled: {
    opacity: 0.7
  },
  loginLink: {
    alignSelf: "center",
    marginTop: 16
  },
  loginLinkText: {
    color: palette.green,
    fontSize: 15,
    fontWeight: "900"
  }
});
