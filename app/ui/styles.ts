import { StyleSheet } from "react-native";

export const palette = {
  paper: "#F6F1E8",
  card: "#FFFFFF",
  ink: "#20352B",
  muted: "#617064",
  line: "#E0D5C2",
  green: "#3F7D58",
  deepGreen: "#22382F",
  leaf: "#A8B79A",
  gold: "#F9D16B",
  lavender: "#E9E1EE"
};

export const shared = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.paper,
    padding: 28
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
    gap: 16
  },
  kicker: {
    fontSize: 15,
    fontWeight: "800",
    color: palette.muted,
    textTransform: "uppercase"
  },
  title: {
    marginTop: 4,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    color: palette.ink
  },
  subtitle: {
    marginTop: 8,
    fontSize: 17,
    lineHeight: 24,
    color: palette.muted
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 20
  },
  navButton: {
    display: "flex",
    height: 48,
    flexDirection: "row",
    borderRadius: 24,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.deepGreen
  },
  navButtonAlt: {
    display: "flex",
    height: 48,
    flexDirection: "row",
    borderRadius: 24,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.gold
  },
  navButtonText: {
    height: 48,
    fontSize: 15,
    lineHeight: 48,
    fontWeight: "900",
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
    color: "#FFFFFF"
  },
  navButtonAltText: {
    height: 48,
    fontSize: 15,
    lineHeight: 48,
    fontWeight: "900",
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
    color: "#392D12"
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  }
});
