import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState
} from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { encouragements, Mission } from "../../data/demo";
import { useKoalaStore } from "../../data/store";
import { palette, shared } from "../../ui/styles";

export default function MissionDetailScreen() {
  const { id } = useLocalSearchParams();
  const { completeMission, getMission, t } = useKoalaStore();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [isPlanExpanded, setIsPlanExpanded] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const mission = getMission(id);

  useEffect(() => {
    async function prepareAudio() {
      const status = await AudioModule.requestRecordingPermissionsAsync();

      if (status.granted) {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true
        });
      }
    }

    void prepareAudio();
  }, []);

  async function capturePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(t("cameraPermissionTitle"), t("cameraPermissionBody"));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: ["images"],
      quality: 0.8
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setSubmitMessage(t("photoSaved"));
    }
  }

  async function toggleRecording() {
    if (recorderState.isRecording) {
      await audioRecorder.stop();
      setAudioUri(audioRecorder.uri ?? undefined);
      setSubmitMessage(t("audioReady"));
      return;
    }

    const permission = await AudioModule.requestRecordingPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(t("microphonePermissionTitle"), t("microphonePermissionBody"));
      return;
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true
    });
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setSubmitMessage(t("recordingAudio"));
  }

  async function submitCompletion(missionId: string) {
    await completeMission(missionId, {
      audioUri,
      photoUri
    });
    setSubmitMessage(photoUri || audioUri ? t("proofAttached") : t("complete"));
  }

  async function openAttachment(uri: string) {
    try {
      await Linking.openURL(uri);
    } catch {
      Alert.alert(t("cannotOpenFileTitle"), t("cannotOpenFileBody"));
    }
  }

  if (!mission) {
    return (
      <View style={shared.screen}>
        <View style={shared.pageHeader}>
          <View>
            <Text style={shared.kicker}>{t("mission")}</Text>
            <Text style={shared.title}>{t("notFound")}</Text>
          </View>
          <Link href="/" style={shared.navButton}>
            <Text style={shared.navButtonText}>{t("backHome")}</Text>
          </Link>
        </View>
      </View>
    );
  }

  const percent = Math.round((mission.progress / mission.total) * 100);
  const planLongText = [mission.planDetail.summary, mission.planDetail.notes, mission.detail].filter(Boolean).join("\n\n");
  const shouldShowMore = planLongText.length > 120;

  return (
    <View style={shared.screen}>
      <View style={shared.pageHeader}>
        <View style={styles.heading}>
          <Text style={shared.kicker}>{mission.category}</Text>
          <Text style={shared.title}>
            {mission.icon} {mission.title}
          </Text>
          <Text style={shared.subtitle}>{mission.detail}</Text>
        </View>
        <Link href="/" style={shared.navButton}>
          <Text style={shared.navButtonText}>{t("backHome")}</Text>
        </Link>
      </View>

      <View style={styles.grid}>
        <View style={[shared.card, styles.primaryCard]}>
          <View>
            <Text style={styles.cardTitle}>{t("goals")}</Text>
            {mission.goals.map((goal) => (
              <View key={goal} style={styles.goalRow}>
                <Text style={styles.goalCheck}>✓</Text>
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>

          <View style={styles.planPanel}>
            <Text style={styles.sectionLabel}>{t("todayPlan")}</Text>
            <Text style={styles.planTitle}>{mission.planDetail.summary}</Text>
            {mission.planDetail.vocabulary.length > 0 ? (
              <View style={styles.tokenRow}>
                {mission.planDetail.vocabulary.map((word) => (
                  <Text key={word} style={styles.token}>{word}</Text>
                ))}
              </View>
            ) : null}
            {mission.planDetail.notes ? (
              <Text numberOfLines={3} style={styles.planNotes}>{mission.planDetail.notes}</Text>
            ) : null}
            <View style={styles.planActions}>
              {shouldShowMore ? (
                <Pressable style={styles.inlineButton} onPress={() => setIsPlanExpanded(true)}>
                  <Text style={styles.inlineButtonText}>{t("more")}</Text>
                </Pressable>
              ) : null}
            </View>
            {mission.planDetail.attachments.length > 0 ? (
              <View style={styles.attachmentList}>
                {mission.planDetail.attachments.map((attachment) => (
                  <Pressable key={attachment.id} style={styles.attachmentRow} onPress={() => openAttachment(attachment.uri)}>
                    <Text style={styles.attachmentIcon}>{fileIcon(attachment.name, attachment.mimeType)}</Text>
                    <View style={styles.attachmentCopy}>
                      <Text numberOfLines={1} style={styles.attachmentName}>{attachment.name}</Text>
                      <Text style={styles.attachmentMeta}>{attachmentLabel(attachment.mimeType, attachment.size)}</Text>
                    </View>
                    <Text style={styles.attachmentOpen}>{t("view")}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View>
            <View style={styles.bigNumberRow}>
              <Text style={[styles.bigNumber, { color: mission.tone }]}>{percent}%</Text>
              <Text style={styles.status}>{missionStatusText(mission.status, t)}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: mission.tone }]} />
            </View>
          </View>
        </View>

        <View style={[shared.card, styles.secondaryCard]}>
          <Text style={styles.cardTitle}>{t("submitResult")}</Text>
          <View style={styles.actionGrid}>
            <Pressable style={styles.actionButton} onPress={() => submitCompletion(mission.id)}>
              <Text style={styles.actionIcon}>✅</Text>
              <Text style={styles.actionText}>{t("complete")}</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, photoUri && styles.actionButtonActive]} onPress={capturePhoto}>
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionText}>{t("photo")}</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, audioUri && styles.actionButtonActive]} onPress={toggleRecording}>
              <Text style={styles.actionIcon}>🎤</Text>
              <Text style={styles.actionText}>{t("audio")}</Text>
            </Pressable>
          </View>
          {(photoUri || audioUri || submitMessage) ? (
            <View style={styles.proofPanel}>
              {photoUri ? <Image source={{ uri: photoUri }} style={styles.photoPreview} /> : null}
              <View style={styles.proofCopy}>
                <Text style={styles.proofTitle}>{t("proofAttached")}</Text>
                <Text style={styles.proofText}>
                  {photoUri ? t("photoReady") : t("noPhoto")} · {audioUri ? t("audioReady") : recorderState.isRecording ? t("recording") : t("noAudio")}
                </Text>
                {submitMessage ? <Text style={styles.proofMeta}>{submitMessage}</Text> : null}
              </View>
            </View>
          ) : null}
          <View style={styles.encouragement}>
            <Text style={styles.koala}>🐨</Text>
            <View style={styles.encouragementCopy}>
              <Text style={styles.encouragementTitle}>{t("aiEncouragement")}</Text>
              <Text style={styles.bodyText}>{encouragements[0]}</Text>
            </View>
          </View>
          <View style={styles.rewardStrip}>
            <View>
              <Text style={styles.rewardLabel}>{t("reward")}</Text>
              <Text style={styles.rewardValue}>+{mission.energy}</Text>
            </View>
            <View>
              <Text style={styles.rewardLabel}>{t("target")}</Text>
              <Text style={styles.rewardTarget}>{mission.target}</Text>
            </View>
          </View>
          <View style={styles.recordPanel}>
            <Text style={styles.sectionLabel}>{t("completionRecord")}</Text>
            <Text style={styles.recordText}>
              {mission.completionRecord
                ? `${mission.completionRecord.actualMinutes ?? t("done")} min · ${mission.completionRecord.parentConfirmed ? t("confirm") : t("open")}${mission.completionRecord.aiScore ? ` · AI ${mission.completionRecord.aiScore}` : ""}`
                : t("pendingChildSubmission")}
            </Text>
            {mission.rewardRecords.length > 0 ? (
              <View style={styles.rewardLedger}>
                {mission.rewardRecords.map((reward) => (
                  <Text key={reward.id} style={styles.ledgerItem}>
                    +{reward.points} {reward.reason}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </View>
      <Modal transparent animationType="fade" visible={isPlanExpanded} onRequestClose={() => setIsPlanExpanded(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("todayPlan")}</Text>
              <Pressable style={styles.closeButton} onPress={() => setIsPlanExpanded(false)}>
                <Text style={styles.closeButtonText}>{t("close")}</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalBody}>{planLongText}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function missionStatusText(status: Mission["status"], t: (key: string) => string) {
  return status === "done" ? t("done") : status === "in_progress" ? t("inProgress") : t("todo");
}

function attachmentLabel(mimeType?: string, size?: number) {
  const typeLabel = mimeType?.split("/").pop()?.toUpperCase() ?? "FILE";

  if (!size) {
    return typeLabel;
  }

  if (size < 1024 * 1024) {
    return `${typeLabel} · ${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${typeLabel} · ${(size / 1024 / 1024).toFixed(1)} MB`;
}

function fileIcon(name: string, mimeType?: string) {
  const lowerName = name.toLowerCase();

  if (mimeType === "application/pdf" || lowerName.endsWith(".pdf")) {
    return "PDF";
  }

  if (lowerName.endsWith(".doc") || lowerName.endsWith(".docx")) {
    return "DOC";
  }

  if (lowerName.endsWith(".xls") || lowerName.endsWith(".xlsx")) {
    return "XLS";
  }

  if (lowerName.endsWith(".ppt") || lowerName.endsWith(".pptx")) {
    return "PPT";
  }

  return "FILE";
}

const styles = StyleSheet.create({
  heading: {
    flex: 1,
    maxWidth: 780
  },
  grid: {
    flex: 1,
    flexDirection: "row",
    gap: 22
  },
  primaryCard: {
    flex: 1.15,
    justifyContent: "space-between"
  },
  secondaryCard: {
    flex: 1
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: palette.ink,
    marginBottom: 16
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 48
  },
  goalCheck: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EEF3EA",
    color: palette.green,
    textAlign: "center",
    lineHeight: 30,
    fontWeight: "900"
  },
  goalText: {
    flex: 1,
    color: palette.ink,
    fontSize: 19,
    fontWeight: "800"
  },
  bigNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20
  },
  bigNumber: {
    fontSize: 92,
    lineHeight: 100,
    fontWeight: "900"
  },
  status: {
    borderRadius: 20,
    backgroundColor: "#EEF3EA",
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  progressTrack: {
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EEE8DD",
    overflow: "hidden"
  },
  progressFill: {
    height: 16,
    borderRadius: 8
  },
  planPanel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FAF7F0",
    padding: 16,
    marginVertical: 22
  },
  sectionLabel: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  planTitle: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 8
  },
  planNotes: {
    color: palette.muted,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    marginTop: 10
  },
  tokenRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12
  },
  token: {
    borderRadius: 8,
    backgroundColor: "#EEF3EA",
    color: palette.green,
    fontSize: 15,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  planActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14
  },
  inlineButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.green,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  inlineButtonText: {
    color: palette.green,
    fontSize: 14,
    fontWeight: "900"
  },
  attachmentList: {
    gap: 10,
    marginTop: 14
  },
  attachmentRow: {
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10
  },
  attachmentIcon: {
    width: 44,
    borderRadius: 8,
    backgroundColor: "#EEF3EA",
    color: palette.green,
    fontSize: 12,
    fontWeight: "900",
    paddingVertical: 8,
    textAlign: "center"
  },
  attachmentCopy: {
    flex: 1
  },
  attachmentName: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  attachmentMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3
  },
  attachmentOpen: {
    color: palette.green,
    fontSize: 13,
    fontWeight: "900"
  },
  actionGrid: {
    flexDirection: "row",
    gap: 12
  },
  actionButton: {
    flex: 1,
    minHeight: 108,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FAF7F0",
    alignItems: "center",
    justifyContent: "center"
  },
  actionButtonActive: {
    borderColor: palette.green,
    backgroundColor: "#EEF3EA"
  },
  actionIcon: {
    fontSize: 32
  },
  actionText: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 8
  },
  proofPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C9D9C1",
    backgroundColor: "#F4F8F0",
    padding: 14,
    marginTop: 16
  },
  photoPreview: {
    width: 86,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#E7DED0"
  },
  proofCopy: {
    flex: 1
  },
  proofTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  proofText: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4
  },
  proofMeta: {
    color: palette.green,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 6
  },
  encouragement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 8,
    backgroundColor: "#E7F0E2",
    padding: 16,
    marginTop: 22
  },
  koala: {
    fontSize: 46
  },
  encouragementCopy: {
    flex: 1
  },
  encouragementTitle: {
    color: palette.green,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4
  },
  bodyText: {
    fontSize: 19,
    lineHeight: 29,
    color: palette.muted
  },
  rewardStrip: {
    marginTop: 26,
    flexDirection: "row",
    gap: 26
  },
  rewardLabel: {
    color: palette.muted,
    fontSize: 15,
    fontWeight: "800"
  },
  rewardValue: {
    marginTop: 6,
    color: palette.ink,
    fontSize: 40,
    fontWeight: "900"
  },
  rewardTarget: {
    marginTop: 10,
    color: palette.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  recordPanel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
    marginTop: 20
  },
  recordText: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 24,
    marginTop: 8
  },
  rewardLedger: {
    gap: 6,
    marginTop: 12
  },
  ledgerItem: {
    color: palette.green,
    fontSize: 15,
    fontWeight: "900"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(28, 33, 28, 0.38)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28
  },
  modalBox: {
    width: "100%",
    maxWidth: 760,
    maxHeight: "82%",
    borderRadius: 8,
    backgroundColor: palette.paper,
    padding: 22
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 14
  },
  modalTitle: {
    color: palette.ink,
    fontSize: 26,
    fontWeight: "900"
  },
  closeButton: {
    borderRadius: 8,
    backgroundColor: palette.ink,
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900"
  },
  modalScroll: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FFFFFF",
    padding: 16
  },
  modalBody: {
    color: palette.ink,
    fontSize: 19,
    fontWeight: "700",
    lineHeight: 30
  }
});
