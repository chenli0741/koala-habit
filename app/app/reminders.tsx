import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { reminders } from "../data/demo";
import { palette, shared } from "../ui/styles";

export default function RemindersScreen() {
  return (
    <View style={shared.screen}>
      <View style={shared.pageHeader}>
        <View>
          <Text style={shared.kicker}>Reminders</Text>
          <Text style={shared.title}>Gentle nudges, not yelling</Text>
          <Text style={shared.subtitle}>Local notification copy for the first version.</Text>
        </View>
        <Link href="/" style={shared.navButton}>
          <Text style={shared.navButtonText}>Back Today</Text>
        </Link>
      </View>

      <View style={styles.grid}>
        <View style={[shared.card, styles.messageCard]}>
          <Text style={styles.bell}>🔔</Text>
          <Text style={styles.messageTitle}>“阅读时间到了哦～”</Text>
          <Text style={styles.messageBody}>The first version will schedule local reminders on the device.</Text>
        </View>
        <View style={styles.list}>
          {reminders.map((reminder) => (
            <View key={reminder.id} style={shared.card}>
              <Text style={styles.time}>{reminder.time}</Text>
              <Text style={styles.title}>{reminder.title}</Text>
            </View>
          ))}
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
  messageCard: {
    flex: 1,
    backgroundColor: "#E7F0E2",
    justifyContent: "center"
  },
  bell: {
    fontSize: 64
  },
  messageTitle: {
    color: palette.ink,
    fontSize: 38,
    lineHeight: 48,
    fontWeight: "900",
    marginTop: 18
  },
  messageBody: {
    color: palette.muted,
    fontSize: 18,
    lineHeight: 27,
    marginTop: 14
  },
  list: {
    flex: 1,
    gap: 14
  },
  time: {
    color: palette.green,
    fontSize: 16,
    fontWeight: "900"
  },
  title: {
    color: palette.ink,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 8
  }
});
