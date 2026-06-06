import { Link, Redirect, router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useKoalaStore } from "../../data/store";
import { palette, shared } from "../../ui/styles";

export default function ChildPinScreen() {
  const { activeChild, children, isSessionReady, loginChild, parent, t } = useKoalaStore();
  const { width } = useWindowDimensions();
  const firstChildId = activeChild?.id ?? children[0]?.id ?? "";
  const [selectedChildId, setSelectedChildId] = useState(firstChildId);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const child = children.find((item) => item.id === selectedChildId) ?? children[0];
  const isCompact = width < 900;

  if (!isSessionReady) {
    return (
      <View style={styles.screen}>
        <Text style={shared.title}>Koala Habit</Text>
      </View>
    );
  }

  if (!parent) {
    return <Redirect href="/auth" />;
  }

  async function handleUnlock() {
    if (!/^\d{4,6}$/.test(pin)) {
      setError(t("numericPin"));
      return;
    }

    if (await loginChild(selectedChildId, pin)) {
      setError("");
      router.push("/");
      return;
    }

    setError(t("numericPin"));
  }

  return (
    <ScrollView style={styles.scroller} contentContainerStyle={StyleSheet.flatten([styles.screen, isCompact && styles.screenCompact])}>
      <View style={[styles.loginPanel, isCompact && styles.loginPanelCompact]}>
        <Text style={shared.kicker}>{t("childLogin")}</Text>
        <Text style={[shared.title, isCompact && styles.titleCompact]}>{t("hi")} {child?.name ?? ""}</Text>
        <Text style={shared.subtitle}>{t("unlockMissions")}</Text>

        <View style={styles.childList}>
          {children.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setSelectedChildId(item.id)}
              style={[styles.childChoice, item.id === selectedChildId && styles.childChoiceActive]}
            >
              <Text style={[styles.childChoiceText, item.id === selectedChildId && styles.childChoiceTextActive]}>
                {item.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.pinRow}>
          <TextInput
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={(value) => setPin(value.replace(/\D/g, ""))}
            onSubmitEditing={handleUnlock}
            placeholder="1234"
            returnKeyType="done"
            secureTextEntry
            style={styles.pinInput}
            submitBehavior="submit"
            value={pin}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.actions}>
          <Pressable style={shared.navButtonAlt} onPress={handleUnlock}>
            <Text style={shared.navButtonAltText}>{t("unlockMissions")}</Text>
          </Pressable>
          <Link href="/auth" style={shared.navButton}>
            <Text style={shared.navButtonText}>{t("switchAccount")}</Text>
          </Link>
        </View>
      </View>

      <View style={[styles.companionPanel, isCompact && styles.companionPanelCompact]}>
        <ChildAvatar avatarUri={child?.avatar} isCompact={isCompact} />
        <Text style={[styles.companionTitle, isCompact && styles.companionTitleCompact]}>{t("kokoWaiting")}</Text>
        <Text style={[styles.companionText, isCompact && styles.companionTextCompact]}>{t("childPrivatePin")}</Text>
      </View>
    </ScrollView>
  );
}

function ChildAvatar({ avatarUri, isCompact }: { avatarUri?: string; isCompact: boolean }) {
  if (avatarUri && avatarUri !== "Koala") {
    return <Image source={{ uri: avatarUri }} style={StyleSheet.flatten([styles.childAvatarImage, isCompact && styles.childAvatarImageCompact])} />;
  }

  return (
    <View style={[styles.koala, isCompact && styles.koalaCompact]}>
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
    padding: 28,
    backgroundColor: palette.paper
  },
  screenCompact: {
    flexDirection: "column",
    paddingHorizontal: 22,
    paddingTop: 72,
    paddingBottom: 28
  },
  loginPanel: {
    ...shared.card,
    flex: 1.2,
    justifyContent: "center"
  },
  loginPanelCompact: {
    flex: 0,
    justifyContent: "flex-start"
  },
  titleCompact: {
    fontSize: 36,
    lineHeight: 40
  },
  childList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 22
  },
  childChoice: {
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FAF7F0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  childChoiceActive: {
    backgroundColor: palette.deepGreen,
    borderColor: palette.deepGreen
  },
  childChoiceText: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  childChoiceTextActive: {
    color: "#FFFFFF"
  },
  pinRow: {
    width: "100%",
    maxWidth: 330,
    marginTop: 34,
    marginBottom: 14
  },
  pinInput: {
    height: 88,
    borderRadius: 8,
    backgroundColor: "#FAF7F0",
    borderWidth: 1,
    borderColor: palette.line,
    color: palette.ink,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 8,
    paddingHorizontal: 22,
    textAlign: "center"
  },
  errorText: {
    color: "#B75F4A",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 14
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  companionPanelCompact: {
    flex: 0,
    minHeight: 360
  },
  koala: {
    width: 230,
    height: 210,
    alignItems: "center",
    justifyContent: "center"
  },
  koalaCompact: {
    transform: [{ scale: 0.82 }],
    marginVertical: -18
  },
  childAvatarImage: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#DDE8D6",
    borderWidth: 8,
    borderColor: "#526350"
  },
  childAvatarImageCompact: {
    width: 172,
    height: 172,
    borderRadius: 86
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
  companionTitleCompact: {
    fontSize: 26,
    marginTop: 4,
    textAlign: "center"
  },
  companionText: {
    color: palette.muted,
    fontSize: 18,
    lineHeight: 27,
    marginTop: 10,
    textAlign: "center"
  },
  companionTextCompact: {
    fontSize: 16,
    lineHeight: 23
  }
});
