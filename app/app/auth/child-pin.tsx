import { Link, Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useKoalaStore } from "../../data/store";
import { palette, shared } from "../../ui/styles";

export default function ChildPinScreen() {
  const { activeChild, children, isSessionReady, loginChild, parent, t } = useKoalaStore();
  const { width } = useWindowDimensions();
  const firstChildId = activeChild?.id ?? children[0]?.id ?? "";
  const [selectedChildId, setSelectedChildId] = useState(firstChildId);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const child = children.find((item) => item.id === selectedChildId) ?? children[0];
  const isCompact = width < 900;

  useEffect(() => {
    if (!selectedChildId && firstChildId) {
      setSelectedChildId(firstChildId);
    }
  }, [firstChildId, selectedChildId]);

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
    if (isUnlocking) {
      return;
    }

    const childId = selectedChildId || child?.id || "";

    if (!childId) {
      setError(t("noTasksYet"));
      return;
    }

    if (!/^\d{4,6}$/.test(pin)) {
      setError(t("numericPin"));
      return;
    }

    setIsUnlocking(true);

    try {
      if (await loginChild(childId, pin)) {
        setError("");
        router.push("/");
        return;
      }

      setError(t("numericPin"));
    } finally {
      setIsUnlocking(false);
    }
  }

  function appendPinDigit(digit: string) {
    if (isUnlocking) {
      return;
    }

    setError("");
    setPin((current) => (current.length < 6 ? `${current}${digit}` : current));
  }

  function deletePinDigit() {
    if (isUnlocking) {
      return;
    }

    setError("");
    setPin((current) => current.slice(0, -1));
  }

  return (
    <ScrollView
      contentContainerStyle={StyleSheet.flatten([styles.screen, isCompact && styles.screenCompact])}
      contentInsetAdjustmentBehavior="automatic"
      style={styles.scroller}
    >
      <View style={[styles.loginPanel, isCompact && styles.loginPanelCompact]}>
        <Text style={shared.kicker}>{t("childLogin")}</Text>
        <Text style={[shared.title, isCompact && styles.titleCompact]}>{t("hi")} {child?.name ?? ""}</Text>
        <Text style={shared.subtitle}>{t("unlockMissions")}</Text>

        <View style={styles.childList}>
          {children.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                setSelectedChildId(item.id);
                setPin("");
                setError("");
              }}
              style={[styles.childChoice, item.id === selectedChildId && styles.childChoiceActive]}
            >
              <Text style={[styles.childChoiceText, item.id === selectedChildId && styles.childChoiceTextActive]}>
                {item.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.pinRow}>
          <View style={styles.pinDisplay} accessibilityLabel={`PIN length ${pin.length}`}>
            <Text style={[styles.pinDisplayText, !pin && styles.pinDisplayPlaceholder]}>{pin || "1234"}</Text>
          </View>
        </View>
        <View style={styles.pinPad}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <Pressable
              accessibilityLabel={`PIN ${digit}`}
              disabled={isUnlocking}
              key={digit}
              onPress={() => appendPinDigit(digit)}
              style={styles.pinKey}
            >
              <Text style={styles.pinKeyText}>{digit}</Text>
            </Pressable>
          ))}
          <View style={styles.pinKeySpacer} />
          <Pressable
            accessibilityLabel="PIN 0"
            disabled={isUnlocking}
            onPress={() => appendPinDigit("0")}
            style={styles.pinKey}
          >
            <Text style={styles.pinKeyText}>0</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Delete PIN digit"
            disabled={isUnlocking}
            onPress={deletePinDigit}
            style={styles.pinKey}
          >
            <Text style={styles.pinKeyText}>⌫</Text>
          </Pressable>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityState={{ busy: isUnlocking, disabled: isUnlocking }}
            disabled={isUnlocking}
            style={[shared.navButtonAlt, isUnlocking && styles.unlockButtonDisabled]}
            onPress={handleUnlock}
          >
            <Text style={shared.navButtonAltText}>{isUnlocking ? t("loading") : t("unlockMissions")}</Text>
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
    marginTop: 26,
    marginBottom: 14
  },
  pinDisplay: {
    height: 88,
    borderRadius: 8,
    backgroundColor: "#FAF7F0",
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  pinDisplayText: {
    color: palette.ink,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 8,
    lineHeight: 50,
    textAlign: "center"
  },
  pinDisplayPlaceholder: {
    color: "#C9C2B7"
  },
  pinPad: {
    width: "100%",
    maxWidth: 330,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16
  },
  pinKey: {
    width: 96,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  pinKeySpacer: {
    width: 96,
    height: 54
  },
  pinKeyText: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "900"
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
  unlockButtonDisabled: {
    opacity: 0.65
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
