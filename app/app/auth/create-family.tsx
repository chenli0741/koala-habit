import { Redirect, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useKoalaStore } from "../../data/store";
import { palette, shared } from "../../ui/styles";

export default function CreateFamilyScreen() {
  const { createFamily, family, parent, t } = useKoalaStore();
  const { width } = useWindowDimensions();
  const [familyName, setFamilyName] = useState(family?.name ?? (parent ? `${parent.name}'s Family` : ""));
  const [timeZone, setTimeZone] = useState(family?.timeZone ?? "America/Los_Angeles");
  const [language, setLanguage] = useState(family?.language ?? "English");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isCompact = width < 900;

  if (!parent) {
    return <Redirect href="/auth/register" />;
  }

  async function handleCreateFamily() {
    if (!familyName.trim()) {
      setError(t("familyNameRequired"));
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await createFamily(familyName, timeZone || "America/Los_Angeles", language || "English");
      router.replace("/auth/create-child");
    } catch {
      setError(t("familyCreateFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView style={styles.scroller} contentContainerStyle={[styles.screen, isCompact && styles.screenCompact]}>
      <View style={[styles.copy, isCompact && styles.copyCompact]}>
        <Text style={shared.kicker}>{t("familySpace")}</Text>
        <Text style={[shared.title, isCompact && styles.titleCompact]}>{t("createFamilySpace")}</Text>
        <Text style={[shared.subtitle, isCompact && styles.subtitleCompact]}>{t("familySetupHint")}</Text>
      </View>

      <View style={[shared.card, styles.form]}>
        <Text style={styles.formTitle}>{t("currentFamily")}</Text>
        <Text style={styles.label}>{t("familyName")}</Text>
        <TextInput style={styles.input} value={familyName} onChangeText={setFamilyName} placeholder={t("familyName")} />
        <Text style={styles.label}>{t("timeZone")}</Text>
        <TextInput
          autoCapitalize="none"
          style={styles.input}
          value={timeZone}
          onChangeText={setTimeZone}
          placeholder="America/Los_Angeles"
        />
        <Text style={styles.label}>{t("language")}</Text>
        <TextInput style={styles.input} value={language} onChangeText={setLanguage} placeholder="English" />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Pressable disabled={isLoading} style={[shared.navButtonAlt, isLoading && styles.buttonDisabled]} onPress={handleCreateFamily}>
          {isLoading ? <ActivityIndicator color="#392D12" /> : <Text style={shared.navButtonAltText}>{t("nextStep")}</Text>}
        </Pressable>
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
  }
});
