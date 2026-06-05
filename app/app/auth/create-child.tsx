import { Link, Redirect, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useKoalaStore } from "../../data/store";
import { palette, shared } from "../../ui/styles";

export default function CreateChildScreen() {
  const { children, createChild, family, parent, t } = useKoalaStore();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!parent) {
    return <Redirect href="/auth/register" />;
  }

  if (!family) {
    return <Redirect href="/auth/create-family" />;
  }

  async function handleCreateChild() {
    if (!name.trim()) {
      setError(t("childNameRequired"));
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await createChild({
        name,
        age: Number(age) || 0,
        avatar: "Koala",
        grade: Number(grade) || 0,
        pin: generatedPin()
      });
      router.replace("/");
    } catch {
      setError(t("childCreateFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={shared.screen}>
      <View style={shared.pageHeader}>
        <View>
          <Text style={shared.kicker}>{t("childAccount")}</Text>
          <Text style={shared.title}>{t("parentCreatesChildLogin")}</Text>
          <Text style={shared.subtitle}>{t("childrenNoEmail")}</Text>
        </View>
        <Link href="/auth/create-family" style={shared.navButton}>
          <Text style={shared.navButtonText}>{t("back")}</Text>
        </Link>
      </View>

      <View style={styles.grid}>
        <View style={[shared.card, styles.form]}>
          <Text style={styles.cardTitle}>{t("newChildProfile")}</Text>
          <Text style={styles.label}>{t("childName")}</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t("childName")} />
          <Text style={styles.label}>{t("age")}</Text>
          <TextInput style={styles.input} value={age} onChangeText={(value) => setAge(value.replace(/\D/g, ""))} keyboardType="number-pad" placeholder={t("optional")} />
          <Text style={styles.label}>{t("grade")}</Text>
          <TextInput style={styles.input} value={grade} onChangeText={(value) => setGrade(value.replace(/\D/g, ""))} keyboardType="number-pad" placeholder={t("optional")} />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Pressable disabled={isLoading} style={[shared.navButtonAlt, isLoading && styles.buttonDisabled]} onPress={handleCreateChild}>
            {isLoading ? <ActivityIndicator color="#392D12" /> : <Text style={shared.navButtonAltText}>{t("addChild")}</Text>}
          </Pressable>
          <Pressable style={styles.skipButton} onPress={() => router.replace("/")}>
            <Text style={styles.skipText}>{t("skipForNow")}</Text>
          </Pressable>
        </View>

        <View style={[shared.card, styles.list]}>
          <Text style={styles.cardTitle}>{t("familyChildren")}</Text>
          {children.map((child) => (
            <View key={child.id} style={styles.childRow}>
              <View style={styles.childAvatar}>
                <Text style={styles.childInitial}>{child.name[0]}</Text>
              </View>
              <View>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childMeta}>
                  {child.grade ? `${t("grade")} ${child.grade}` : t("gradeOptional")} · {child.pin ? `PIN ${child.pin}` : `PIN length ${child.pinLength ?? 4}`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function generatedPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
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
  },
  errorText: {
    color: "#B75F4A",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 10
  },
  buttonDisabled: {
    opacity: 0.7
  },
  skipButton: {
    alignSelf: "center",
    marginTop: 14,
    padding: 8
  },
  skipText: {
    color: palette.green,
    fontSize: 15,
    fontWeight: "900"
  }
});
