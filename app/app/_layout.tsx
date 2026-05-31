import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { KoalaStoreProvider } from "../data/store";
import { LanguageSwitch } from "../ui/LanguageSwitch";

export default function RootLayout() {
  return (
    <KoalaStoreProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      <View pointerEvents="box-none" style={styles.languageCorner}>
        <LanguageSwitch />
      </View>
    </KoalaStoreProvider>
  );
}

const styles = StyleSheet.create({
  languageCorner: {
    position: "absolute",
    right: 18,
    top: 18,
    zIndex: 20
  }
});
