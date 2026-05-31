import { Pressable, StyleSheet, Text, View } from "react-native";
import { useKoalaStore } from "../data/store";
import { palette } from "./styles";

export function LanguageSwitch() {
  const { language, setLanguage } = useKoalaStore();

  return (
    <View style={styles.switcher}>
      {[
        ["en", "EN"],
        ["zh", "中文"]
      ].map(([value, label]) => (
        <Pressable
          key={value}
          onPress={() => setLanguage(value as "en" | "zh")}
          style={[styles.button, language === value && styles.buttonActive]}
        >
          <Text style={[styles.text, language === value && styles.textActive]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  switcher: {
    flexDirection: "row",
    gap: 2,
    alignSelf: "flex-end",
    borderRadius: 6,
    backgroundColor: "rgba(239, 232, 221, 0.72)",
    padding: 2
  },
  button: {
    minHeight: 26,
    borderRadius: 5,
    justifyContent: "center",
    paddingHorizontal: 7
  },
  buttonActive: {
    backgroundColor: palette.deepGreen
  },
  text: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: "900"
  },
  textActive: {
    color: "#FFFFFF"
  }
});
