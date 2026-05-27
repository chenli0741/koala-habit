import { Link } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { missions, taskTemplates } from "../data/demo";
import { palette, shared } from "../ui/styles";

export default function ParentScreen() {
  return (
    <View style={shared.screen}>
      <View style={shared.pageHeader}>
        <View>
          <Text style={shared.kicker}>Parent</Text>
          <Text style={shared.title}>Task management</Text>
          <Text style={shared.subtitle}>Start from summer templates so parents do not need to configure everything.</Text>
        </View>
        <Link href="/" style={shared.navButton}>
          <Text style={shared.navButtonText}>Back Today</Text>
        </Link>
      </View>

      <View style={styles.grid}>
        <View style={[shared.card, styles.templates]}>
          <Text style={styles.cardTitle}>Default Templates</Text>
          {taskTemplates.map((template) => (
            <View key={template.id} style={styles.templateRow}>
              <Text style={styles.templateIcon}>{template.icon}</Text>
              <View style={styles.templateCopy}>
                <Text style={styles.templateTitle}>{template.title}</Text>
                <Text style={styles.templateMeta}>
                  {template.target} · +{template.energy} Energy · {template.repeat}
                </Text>
              </View>
              <View style={styles.addButton}>
                <Text style={styles.addText}>Add</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[shared.card, styles.form]}>
          <Text style={styles.cardTitle}>Add Task</Text>
          <Field label="Name" value="Piano" />
          <Field label="Category" value="Music" />
          <Field label="Goal" value="20 min" />
          <Field label="Reward" value="10 Energy" />
          <Field label="Repeat" value="Daily" />
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>Active tasks</Text>
            <Text style={styles.summaryValue}>{missions.length}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} editable={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    flexDirection: "row",
    gap: 22
  },
  templates: {
    flex: 1.25
  },
  form: {
    flex: 1,
    backgroundColor: palette.lavender
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 16
  },
  templateRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 78,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE8DD",
    gap: 14
  },
  templateIcon: {
    width: 44,
    fontSize: 30,
    textAlign: "center"
  },
  templateCopy: {
    flex: 1
  },
  templateTitle: {
    color: palette.ink,
    fontSize: 19,
    fontWeight: "900"
  },
  templateMeta: {
    color: palette.muted,
    fontSize: 14,
    marginTop: 4
  },
  addButton: {
    minWidth: 72,
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: palette.green,
    alignItems: "center",
    justifyContent: "center"
  },
  addText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900"
  },
  field: {
    marginBottom: 12
  },
  label: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 7
  },
  input: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D3C5D8",
    backgroundColor: "#FFFFFF",
    color: palette.ink,
    fontSize: 18,
    fontWeight: "800",
    paddingHorizontal: 14
  },
  summary: {
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginTop: 12
  },
  summaryLabel: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: "900"
  },
  summaryValue: {
    color: palette.ink,
    fontSize: 42,
    fontWeight: "900",
    marginTop: 6
  }
});
