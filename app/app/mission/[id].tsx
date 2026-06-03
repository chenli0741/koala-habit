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
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { encouragements, Mission } from "../../data/demo";
import { useKoalaStore } from "../../data/store";
import { palette, shared } from "../../ui/styles";

const TIMER_NOTIFICATION_SOUND = "task-time-up.wav";
const TIMER_NOTIFICATION_INTERRUPTION_LEVEL = "timeSensitive";

export default function MissionDetailScreen() {
  const { id } = useLocalSearchParams();
  const { completeMission, finishEntertainmentRun, getMission, pauseEntertainmentRun, recordMissionTimerEvent, resumeEntertainmentRun, startEntertainmentRun, t } = useKoalaStore();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [isPlanExpanded, setIsPlanExpanded] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [timerState, setTimerState] = useState<"idle" | "running" | "paused" | "ended">("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [nowMs, setNowMs] = useState(Date.now());
  const [selectedTargetApp, setSelectedTargetApp] = useState<string | undefined>();
  const [isTargetAppMenuOpen, setIsTargetAppMenuOpen] = useState(false);
  const timerStartedAtRef = useRef<string | undefined>(undefined);
  const notifiedRunIdsRef = useRef<Set<string>>(new Set());
  const mission = getMission(id);
  const executionType = mission?.executionType ?? "completion";
  const isTimedTask = executionType === "timed";
  const isSubmissionTask = executionType === "submission";
  const timerMinutes = useMemo(() => mission?.timeLimitMinutes ?? 10, [mission?.timeLimitMinutes]);
  const timeLimitSeconds = timerMinutes * 60;
  const targetAppOptions = useMemo(() => targetAppOptionsForMission(mission?.targetApp), [mission?.targetApp]);
  const activeEntertainmentRun = isTimedTask && mission?.activeRun && mission.activeRun.status !== "completed" ? mission.activeRun : undefined;
  const activeTargetApp = activeTargetAppForMission(activeEntertainmentRun?.targetApp, selectedTargetApp, targetAppOptions);
  const isEntertainmentPaused = activeEntertainmentRun?.status === "paused";
  const hasFinishedEntertainmentRun = Boolean(
    isTimedTask && mission && (
      mission.status === "done" ||
      mission.status === "expired" ||
      Boolean(mission.completionRecord) ||
      mission.activeRun?.status === "completed" ||
      hasLockedTimedRun(mission.eventRecords)
    )
  );
  const entertainmentSeconds = activeEntertainmentRun
    ? Math.ceil((new Date(activeEntertainmentRun.endAt).getTime() - (isEntertainmentPaused ? new Date(activeEntertainmentRun.completedAt ?? Date.now()).getTime() : nowMs)) / 1000)
    : undefined;
  const displaySeconds = activeEntertainmentRun
    ? entertainmentSeconds ?? 0
    : hasFinishedEntertainmentRun
      ? 0
    : remainingSeconds;
  const isEntertainmentOverdue = Boolean(activeEntertainmentRun && !isEntertainmentPaused && (entertainmentSeconds ?? 0) <= 0);
  const canPauseEntertainment = Boolean(activeEntertainmentRun && !isEntertainmentPaused);

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

  useEffect(() => {
    setRemainingSeconds(timeLimitSeconds);
    setTimerState("idle");
    timerStartedAtRef.current = mission?.actualStartAt;
  }, [mission?.id, timeLimitSeconds]);

  useEffect(() => {
    setSelectedTargetApp(targetAppOptions[0]);
    setIsTargetAppMenuOpen(false);
  }, [mission?.id, mission?.targetApp, targetAppOptions]);

  useEffect(() => {
    if (timerState !== "running") {
      return;
    }

    const tick = setInterval(() => {
      setRemainingSeconds((current) => current - 1);
    }, 1000);

    return () => clearInterval(tick);
  }, [remainingSeconds, timerState]);

  useEffect(() => {
    if (!activeEntertainmentRun) {
      return;
    }

    setNowMs(Date.now());
    const tick = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(tick);
  }, [activeEntertainmentRun?.id]);

  useEffect(() => {
    if (!activeEntertainmentRun || isEntertainmentPaused || entertainmentSeconds === undefined || entertainmentSeconds > 0) {
      return;
    }

    if (notifiedRunIdsRef.current.has(activeEntertainmentRun.id)) {
      return;
    }

    notifiedRunIdsRef.current.add(activeEntertainmentRun.id);
    setSubmitMessage(t("timerFinished"));
    speakTimerFinished(t("timerFinishedVoice"));
  }, [activeEntertainmentRun, entertainmentSeconds, isEntertainmentPaused, t]);

  useEffect(() => {
    if (!mission) {
      return;
    }

    debugTargetApp("mission loaded", {
      executionType,
      hasActiveRun: Boolean(activeEntertainmentRun),
      hasFinishedEntertainmentRun,
      missionId: mission.id,
      targetApp: activeTargetApp,
      title: mission.title
    });
  }, [activeEntertainmentRun, activeTargetApp, executionType, hasFinishedEntertainmentRun, mission]);

  useEffect(() => {
    if (!mission || timerState !== "running" || remainingSeconds !== 0) {
      return;
    }

    speakTimerFinished(t("timerFinishedVoice"));
    setSubmitMessage(t("timerFinished"));
  }, [mission, remainingSeconds, t, timerState]);

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
    const endedAt = new Date().toISOString();
    const startedAt = timerStartedAtRef.current ?? mission?.actualStartAt;
    const actualMinutes = startedAt ? Math.max(1, Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000)) : undefined;

    await completeMission(missionId, {
      actualMinutes,
      audioUri,
      endedAt,
      photoUri,
      startedAt
    });
    setSubmitMessage(photoUri || audioUri ? t("proofAttached") : t("complete"));
  }

  async function startTimer() {
    if (!mission) {
      debugTargetApp("regular timer ignored: missing mission", { routeId: id });
      return;
    }

    debugTargetApp("regular timer started", {
      missionId: mission.id,
      targetApp: mission.targetApp,
      title: mission.title
    });
    const startedAt = new Date().toISOString();
    timerStartedAtRef.current = timerStartedAtRef.current ?? startedAt;
    const nextRemaining = remainingSeconds > 0 ? remainingSeconds : timeLimitSeconds;
    setRemainingSeconds(nextRemaining);
    setTimerState("running");
    await recordMissionTimerEvent(mission.id, { eventType: "timer_start", remainingSeconds: nextRemaining });
  }

  async function pauseTimer() {
    if (!mission || hasFinishedEntertainmentRun) {
      return;
    }

    setTimerState("paused");
    await recordMissionTimerEvent(mission.id, { eventType: "timer_pause", remainingSeconds });
  }

  async function resumeTimer() {
    if (!mission) {
      return;
    }

    setTimerState("running");
    await recordMissionTimerEvent(mission.id, { eventType: "timer_resume", remainingSeconds });
  }

  async function startEntertainmentTimer() {
    if (!mission) {
      debugTargetApp("start ignored: missing mission", { routeId: id });
      return;
    }

    if (hasFinishedEntertainmentRun || mission.completionRecord) {
      debugTargetApp("start ignored: timed task already ended", {
        hasCompletionRecord: Boolean(mission.completionRecord),
        hasFinishedEntertainmentRun,
        missionId: mission.id,
        status: mission.status
      });
      setSubmitMessage(t("timerResetRequired"));
      return;
    }

    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + timerMinutes * 60 * 1000);
    const targetApp = activeTargetApp;
    const targetUrl = targetAppUrl(targetApp);
    debugTargetApp("start pressed", {
      endAt: endAt.toISOString(),
      hasFinishedEntertainmentRun,
      missionId: mission.id,
      targetApp,
      targetUrl,
      timerMinutes
    });
    debugTargetApp("start flow v3: scheduling notification before opening target app", {
      missionId: mission.id
    });
    const notificationId = await scheduleTimerNotification(targetApp ?? t("targetApp"), endAt, t);
    debugTargetApp("notification scheduled", { notificationId });

    const runPromise = startEntertainmentRun(mission.id, {
      endAt: endAt.toISOString(),
      notificationId,
      plannedDurationMinutes: timerMinutes,
      startAt: startAt.toISOString(),
      targetApp
    }).then(
      () => debugTargetApp("run created", { missionId: mission.id }),
      (error) => debugTargetApp("run create failed", { error: readableError(error), missionId: mission.id })
    );

    await Promise.allSettled([
      runPromise
    ]);
    await openTargetApp(targetApp);
  }

  async function finishEntertainmentTimer() {
    if (!mission || !activeEntertainmentRun) {
      return;
    }

    const stoppedAt = isEntertainmentPaused && activeEntertainmentRun.completedAt
      ? new Date(activeEntertainmentRun.completedAt)
      : new Date();
    const remainingAtStop = Math.ceil((new Date(activeEntertainmentRun.endAt).getTime() - stoppedAt.getTime()) / 1000);
    const actualDurationMinutes = Math.max(0, Math.ceil((timerMinutes * 60 - remainingAtStop) / 60));
    const overdueMinutes = Math.max(0, Math.ceil(-remainingAtStop / 60));

    await cancelTimerNotification(activeEntertainmentRun.notificationId);
    await finishEntertainmentRun(mission.id, activeEntertainmentRun.id, {
      actualDurationMinutes,
      completedAt: stoppedAt.toISOString(),
      overdue: overdueMinutes > 0,
      overdueMinutes
    });
    setSubmitMessage(
      overdueMinutes > 0
        ? `${t("entertainmentDoneOverdue")} ${t("planned")} ${timerMinutes} min · ${t("actual")} ${actualDurationMinutes} min · +${overdueMinutes} min`
        : `${t("entertainmentDone")} ${t("planned")} ${timerMinutes} min · ${t("actual")} ${actualDurationMinutes} min`
    );
  }

  async function pauseEntertainmentTimer() {
    if (!mission || !activeEntertainmentRun || isEntertainmentPaused) {
      return;
    }

    const pausedAt = new Date();
    const remainingAtPause = Math.ceil((new Date(activeEntertainmentRun.endAt).getTime() - pausedAt.getTime()) / 1000);
    const actualDurationMinutes = Math.max(0, Math.round((timerMinutes * 60 - remainingAtPause) / 60));
    const overdueMinutes = Math.max(0, Math.ceil(-remainingAtPause / 60));

    await cancelTimerNotification(activeEntertainmentRun.notificationId);
    await pauseEntertainmentRun(mission.id, activeEntertainmentRun.id, {
      actualDurationMinutes,
      overdue: overdueMinutes > 0,
      overdueMinutes,
      pausedAt: pausedAt.toISOString()
    });
    setSubmitMessage(`${t("entertainmentPaused")} ${t("actual")} ${actualDurationMinutes} min`);
  }

  async function resumeEntertainmentTimer() {
    if (!mission || !activeEntertainmentRun || !isEntertainmentPaused || !activeEntertainmentRun.completedAt) {
      return;
    }

    const resumedAt = new Date();
    const pausedAt = new Date(activeEntertainmentRun.completedAt);
    const pauseDurationMs = Math.max(0, resumedAt.getTime() - pausedAt.getTime());
    const nextEndAt = new Date(new Date(activeEntertainmentRun.endAt).getTime() + pauseDurationMs);
    const notificationId = await scheduleTimerNotification(activeEntertainmentRun.targetApp ?? activeTargetApp ?? t("targetApp"), nextEndAt, t);

    await resumeEntertainmentRun(mission.id, activeEntertainmentRun.id, {
      endAt: nextEndAt.toISOString(),
      notificationId,
      resumedAt: resumedAt.toISOString()
    });
    setSubmitMessage(t("timerResumed"));
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

  const isVisiblyComplete = isMissionVisiblyComplete(mission, isTimedTask, hasFinishedEntertainmentRun);
  const displayProgress = isVisiblyComplete ? mission.total : mission.progress;
  const displayStatus = isVisiblyComplete ? "done" : mission.status;
  const percent = Math.round((displayProgress / mission.total) * 100);
  const planLongText = [mission.planDetail.summary, mission.planDetail.notes, mission.detail].filter(Boolean).join("\n\n");
  const shouldShowMore = planLongText.length > 120;

  return (
    <View style={shared.screen}>
      <View style={shared.pageHeader}>
        <View style={styles.heading}>
          <Text style={shared.kicker}>{missionCategoryLabel(mission.category)}</Text>
          <Text style={shared.title}>
            {mission.icon} {mission.title}
          </Text>
          <Text numberOfLines={2} style={[shared.subtitle, styles.headerSubtitle]}>{mission.detail}</Text>
        </View>
        <Link href="/" style={shared.navButton}>
          <Text style={shared.navButtonText}>{t("backHome")}</Text>
        </Link>
      </View>

      <View style={styles.grid}>
        <View style={[shared.card, styles.primaryCard]}>
          <ScrollView style={styles.cardScroll} contentContainerStyle={styles.primaryCardContent}>
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
                <Text style={styles.status}>{missionStatusText(displayStatus, t)}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: mission.tone }]} />
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={[shared.card, styles.secondaryCard]}>
          <ScrollView style={styles.cardScroll} contentContainerStyle={styles.secondaryCardContent}>
            {isTimedTask ? (
              <View style={styles.timerPanel}>
                <View style={styles.timerCopy}>
                  <Text style={styles.sectionLabel}>
                    {activeTargetApp ? `${activeTargetApp} · ` : ""}{isEntertainmentPaused ? t("paused") : isEntertainmentOverdue ? t("overdue") : t("countdown")} · {timerMinutes} min
                  </Text>
                  <Text style={[styles.timerValue, { color: mission.tone }]}>{formatDuration(displaySeconds)}</Text>
                  {targetAppOptions.length > 1 && !activeEntertainmentRun && !hasFinishedEntertainmentRun ? (
                    <View style={styles.targetAppPicker}>
                      <Pressable style={styles.targetAppPickerButton} onPress={() => setIsTargetAppMenuOpen((current) => !current)}>
                        <Text style={styles.targetAppPickerText}>{activeTargetApp ?? t("targetApp")}</Text>
                        <Text style={styles.targetAppPickerChevron}>{isTargetAppMenuOpen ? "▲" : "▼"}</Text>
                      </Pressable>
                      {isTargetAppMenuOpen ? (
                        <View style={styles.targetAppMenu}>
                          {targetAppOptions.map((option) => (
                            <Pressable
                              key={option}
                              style={[styles.targetAppMenuItem, option === activeTargetApp && styles.targetAppMenuItemActive]}
                              onPress={() => {
                                setSelectedTargetApp(option);
                                setIsTargetAppMenuOpen(false);
                              }}
                            >
                              <Text style={[styles.targetAppMenuText, option === activeTargetApp && styles.targetAppMenuTextActive]}>{option}</Text>
                            </Pressable>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                  {activeEntertainmentRun ? <Text style={styles.timerHint}>{t("returnAfterTime")}</Text> : null}
                </View>
                {activeEntertainmentRun ? (
                  <View style={styles.timerActions}>
                    <View style={styles.timerActionColumn}>
                      {isEntertainmentPaused ? (
                        <Pressable style={styles.timerButton} onPress={resumeEntertainmentTimer}>
                          <Text style={styles.timerButtonText}>{t("resume")}</Text>
                        </Pressable>
                      ) : canPauseEntertainment ? (
                        <Pressable style={styles.timerButton} onPress={pauseEntertainmentTimer}>
                          <Text style={styles.timerButtonText}>{t("pause")}</Text>
                        </Pressable>
                      ) : null}
                      <Pressable style={styles.timerButton} onPress={finishEntertainmentTimer}>
                        <Text style={styles.timerButtonText}>{t("finishTimer")}</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : hasFinishedEntertainmentRun ? (
                  <Text style={styles.timerDoneText}>{t("timerResetRequired")}</Text>
                ) : (
                  <View style={styles.timerActions}>
                    <Pressable style={styles.timerButton} onPress={startEntertainmentTimer}>
                      <Text style={styles.timerButtonText}>{`${activeTargetApp ? t("startTargetApp") : t("startTimer")} ${timerMinutes} min`}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.executionPanel}>
                <Text style={styles.sectionLabel}>{isSubmissionTask ? t("submissionTask") : t("completionTask")}</Text>
                <Text style={styles.executionTitle}>{mission.status === "done" ? t("done") : t("pendingChildSubmission")}</Text>
                <Text style={styles.timerHint}>{isSubmissionTask ? t("submissionTaskHint") : t("completionTaskHint")}</Text>
              </View>
            )}
            {!isTimedTask ? (
              <>
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
              </>
            ) : null}
            {(!isTimedTask && (photoUri || audioUri || submitMessage)) ? (
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
                <Text style={styles.rewardValue}>{formatPoints(mission.energy)}</Text>
              </View>
              <View style={styles.rewardTargetWrap}>
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
              {mission.actualStartAt || mission.actualEndAt ? (
                <Text style={styles.recordMeta}>
                  {mission.actualStartAt ? `${t("startedAt")} ${formatClock(mission.actualStartAt)}` : ""}
                  {mission.actualEndAt ? ` · ${t("endedAt")} ${formatClock(mission.actualEndAt)}` : ""}
                </Text>
              ) : null}
              {mission.eventRecords.length > 0 ? (
                <View style={styles.timerLedger}>
                  {mission.eventRecords.slice(-4).map((event) => (
                    <Text key={event.id} style={styles.ledgerItem}>
                      {event.title || taskEventText(event.eventType, t)} · {formatClock(event.recordedAt)}
                    </Text>
                  ))}
                </View>
              ) : null}
              {mission.rewardRecords.length > 0 ? (
                <View style={styles.rewardLedger}>
                  {mission.rewardRecords.map((reward) => (
                    <Text key={reward.id} style={styles.ledgerItem}>
                      {formatPoints(reward.points)} {reward.reason}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          </ScrollView>
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

function isMissionVisiblyComplete(mission: Mission, isTimedTask: boolean, hasFinishedTimedRun: boolean) {
  return Boolean(
    mission.status === "done" ||
    mission.completionRecord ||
    (isTimedTask && hasFinishedTimedRun)
  );
}

function missionCategoryLabel(category: Mission["category"]) {
  switch (category) {
    case "Math":
    case "math":
      return "数学 Math";
    case "Chinese":
    case "chinese":
    case "language":
      return "中文 Chinese";
    case "Eng":
    case "english":
    case "reading":
      return "英文 Eng";
    case "Sports":
    case "sport":
      return "运动 Sports";
    case "Game":
    case "Movies":
    case "entertainment":
      return "娱乐 Game";
    default:
      return "其他 Other";
  }
}

function formatPoints(points: number) {
  return points > 0 ? `+${points}` : `${points}`;
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

function formatDuration(totalSeconds: number) {
  const sign = totalSeconds < 0 ? "-" : "";
  const absoluteSeconds = Math.abs(totalSeconds);
  const minutes = Math.floor(absoluteSeconds / 60);
  const seconds = absoluteSeconds % 60;
  return `${sign}${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatClock(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function taskEventText(eventType: Mission["eventRecords"][number]["eventType"], t: (key: string) => string) {
  switch (eventType) {
    case "created":
      return t("taskCreated");
    case "updated":
      return t("taskUpdated");
    case "status_change":
      return t("statusChanged");
    case "timer_start":
      return t("timerStarted");
    case "timer_pause":
      return t("timerPaused");
    case "timer_resume":
      return t("timerResumed");
    case "timer_end":
      return t("timerEnded");
    case "completion":
      return t("completedAt");
    case "attachment_added":
      return t("attachmentAdded");
  }
}

function hasLockedTimedRun(events: Mission["eventRecords"]) {
  return eventsSinceLastTimedReset(events).some(
    (event) => event.eventType === "timer_end" || isAppRunFinishedEvent(event)
  );
}

function eventsSinceLastTimedReset(events: Mission["eventRecords"]) {
  const lastResetIndex = events.findLastIndex((event) => event.metadata?.reset === "timed_task" || event.title === "Timed task reset");
  return lastResetIndex === -1 ? events : events.slice(lastResetIndex + 1);
}

function isAppRunFinishedEvent(event: Mission["eventRecords"][number]) {
  return event.title === "App run finished" || event.title === "Entertainment finished";
}

function targetAppOptionsForMission(targetApp?: string) {
  return (targetApp ?? "")
    .split(";")
    .map((option) => option.trim())
    .filter(Boolean);
}

function activeTargetAppForMission(activeRunTargetApp: string | undefined, selectedTargetApp: string | undefined, targetAppOptions: string[]) {
  return activeRunTargetApp ?? selectedTargetApp ?? targetAppOptions[0];
}

function speakTimerFinished(message: string) {
  try {
    const Speech = require("expo-speech") as {
      speak: (text: string, options?: { language?: string; rate?: number }) => void;
      stop: () => void;
    };

    Speech.stop();
    Speech.speak(message, {
      language: "zh-CN",
      rate: 0.9
    });
  } catch {
    // The current development client may not include ExpoSpeech yet.
  }
}

async function scheduleTimerNotification(targetApp: string, endAt: Date, t: (key: string) => string) {
  try {
    debugTargetApp("notification schedule entered", {
      endAt: endAt.toISOString(),
      targetApp
    });
    const Notifications = require("expo-notifications") as {
      SchedulableTriggerInputTypes: { TIME_INTERVAL: string };
      requestPermissionsAsync: (permissions?: {
        ios?: {
          allowAlert?: boolean;
          allowBadge?: boolean;
          allowSound?: boolean;
        };
      }) => Promise<{
        granted: boolean;
        ios?: {
          allowsSound?: boolean;
          status?: number | string;
        };
        status?: string;
      }>;
      setNotificationHandler: (handler: {
        handleNotification: () => Promise<{
          shouldPlaySound: boolean;
          shouldSetBadge: boolean;
          shouldShowBanner: boolean;
          shouldShowList: boolean;
        }>;
      }) => void;
      getAllScheduledNotificationsAsync?: () => Promise<Array<{ identifier: string }>>;
      scheduleNotificationAsync: (request: {
        content: {
          body: string;
          data?: Record<string, string>;
          interruptionLevel?: "active" | "timeSensitive";
          sound?: boolean | string;
          title: string;
        };
        trigger: { seconds: number; type: string };
      }) => Promise<string>;
    };
    if (!isExpoNotificationsAvailable(Notifications)) {
      debugTargetApp("notification skipped: API unavailable", {});
      return undefined;
    }
    debugTargetApp("notification module ready", {});

    ensureNotificationHandler(Notifications);
    const permission = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true
      }
    });
    debugTargetApp("notification permission", {
      granted: permission.granted,
      iosAllowsSound: permission.ios?.allowsSound,
      iosStatus: permission.ios?.status,
      status: permission.status
    });

    if (!permission.granted) {
      debugTargetApp("notification permission not granted", {});
      return undefined;
    }

    const seconds = Math.max(1, Math.ceil((endAt.getTime() - Date.now()) / 1000));
    debugTargetApp("notification scheduling", {
      endAt: endAt.toISOString(),
      interruptionLevel: TIMER_NOTIFICATION_INTERRUPTION_LEVEL,
      seconds,
      sound: TIMER_NOTIFICATION_SOUND,
      targetApp
    });

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: t("timerFinished"),
        body: `${targetApp}: ${t("timerFinishedVoice")}`,
        data: {
          endAt: endAt.toISOString(),
          expectedSound: TIMER_NOTIFICATION_SOUND,
          screen: "mission",
          targetApp
        },
        interruptionLevel: TIMER_NOTIFICATION_INTERRUPTION_LEVEL,
        sound: TIMER_NOTIFICATION_SOUND
      },
      trigger: {
        seconds,
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL
      }
    });

    if (Notifications.getAllScheduledNotificationsAsync) {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      debugTargetApp("notification scheduled count", {
        count: scheduled.length,
        notificationId,
        sound: TIMER_NOTIFICATION_SOUND
      });
    }

    return notificationId;
  } catch (error) {
    debugTargetApp("notification schedule failed", { error: readableError(error) });
    return undefined;
  }
}

let notificationHandlerConfigured = false;

function ensureNotificationHandler(Notifications: {
  setNotificationHandler: (handler: {
    handleNotification: () => Promise<{
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
      shouldShowBanner: boolean;
      shouldShowList: boolean;
    }>;
  }) => void;
}) {
  if (notificationHandlerConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => {
      debugTargetApp("foreground notification handler invoked: sound disabled for foreground", {
        sound: TIMER_NOTIFICATION_SOUND
      });

      return {
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
      };
    }
  });
  notificationHandlerConfigured = true;
}

function isExpoNotificationsAvailable(Notifications: {
  requestPermissionsAsync?: unknown;
  scheduleNotificationAsync?: unknown;
  setNotificationHandler?: unknown;
}) {
  return (
    typeof Notifications.requestPermissionsAsync === "function" &&
    typeof Notifications.scheduleNotificationAsync === "function" &&
    typeof Notifications.setNotificationHandler === "function"
  );
}

async function cancelTimerNotification(notificationId?: string) {
  if (!notificationId) {
    return;
  }

  try {
    const Notifications = require("expo-notifications") as {
      cancelScheduledNotificationAsync: (identifier: string) => Promise<void>;
    };
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // The current development client may not include ExpoNotifications yet.
  }
}

async function openTargetApp(targetApp?: string) {
  const launch = targetAppLaunch(targetApp);

  debugTargetApp("open requested", { launch, platform: Platform.OS, targetApp });

  if (!launch.url) {
    debugTargetApp("open skipped: no url", { targetApp });
    return;
  }

  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const webUrl = launch.fallbackUrl ?? launch.url;
      debugTargetApp("web redirect", { webUrl });
      window.location.href = webUrl;
      return;
    }

    if (launch.mode === "browser") {
      debugTargetApp("browser url open", { url: launch.url });
      await Linking.openURL(launch.url);
      return;
    }

    const canOpen = await Linking.canOpenURL(launch.url);
    debugTargetApp("canOpenURL result", { canOpen, url: launch.url });
    if (!canOpen) {
      const fallbackUrl = launch.fallbackUrl;
      if (!fallbackUrl) {
        debugTargetApp("open skipped: no fallback url", { targetApp });
        return;
      }
      debugTargetApp("using fallback url", { fallbackUrl, targetApp });
      await Linking.openURL(fallbackUrl);
      debugTargetApp("fallback openURL succeeded", { fallbackUrl });
      return;
    }

    await Linking.openURL(launch.url);
    debugTargetApp("openURL succeeded", { url: launch.url });
  } catch {
    const fallbackUrl = launch.fallbackUrl;
    if (!fallbackUrl || fallbackUrl === launch.url) {
      return;
    }
    debugTargetApp("openURL failed, trying fallback", { fallbackUrl, targetApp });
    try {
      await Linking.openURL(fallbackUrl);
      debugTargetApp("fallback openURL succeeded", { fallbackUrl });
    } catch (error) {
      debugTargetApp("fallback openURL failed", { error: readableError(error), fallbackUrl });
    }
  }
}

type TargetAppLaunch = {
  fallbackUrl?: string;
  mode: "app" | "browser";
  url?: string;
};

function targetAppLaunch(targetApp?: string): TargetAppLaunch {
  const config = parseTargetAppConfig(targetApp);
  const browserUrl = browserTargetAppUrl(config.value);

  if (config.mode === "browser") {
    return {
      fallbackUrl: browserUrl,
      mode: "browser",
      url: browserUrl
    };
  }

  return {
    fallbackUrl: browserUrl,
    mode: "app",
    url: nativeTargetAppUrl(config.value)
  };
}

function parseTargetAppConfig(targetApp?: string) {
  const value = targetApp?.trim() ?? "";
  const urlPrefix = /^url\s*:/i;

  if (urlPrefix.test(value)) {
    return {
      mode: "browser" as const,
      value: value.replace(urlPrefix, "").trim()
    };
  }

  return {
    mode: "app" as const,
    value
  };
}

function browserTargetAppUrl(targetApp?: string) {
  const trimmed = targetApp?.trim();
  const normalized = trimmed?.toLowerCase();

  if (!normalized) {
    return undefined;
  }

  if (isHttpUrl(trimmed)) {
    return trimmed;
  }

  if (normalized?.includes("youtube") || normalized?.includes("youtobe")) {
    return "https://www.youtube.com/";
  }

  if (normalized.includes("map") || normalized.includes("地图")) {
    return "https://maps.apple.com/";
  }

  if (normalized.includes("apple music") || normalized === "music") {
    return "https://music.apple.com/";
  }

  return isUrlLike(trimmed) ? trimmed : undefined;
}

function isHttpUrl(value?: string) {
  return /^https?:\/\//i.test(value?.trim() ?? "");
}

function isUrlLike(value?: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(value?.trim() ?? "");
}

function fallbackTargetAppUrl(targetApp?: string) {
  const browserUrl = browserTargetAppUrl(parseTargetAppConfig(targetApp).value);

  if (browserUrl) {
    return browserUrl;
  }

  return "https://maps.apple.com/";
}

function debugTargetApp(message: string, data?: Record<string, unknown>) {
  console.log(`[TargetApp] ${message}`, data ?? {});
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function targetAppUrl(targetApp?: string) {
  return targetAppLaunch(targetApp).url;
}

function nativeTargetAppUrl(targetApp?: string) {
  const normalized = targetApp?.trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  if (normalized.includes("youtube") || normalized.includes("youtobe")) {
    return "youtube://";
  }

  if (normalized.includes("map") || normalized.includes("地图")) {
    return Platform.OS === "android" ? "geo:0,0?q=" : "maps://?q=";
  }

  if (normalized.includes("apple music") || normalized === "music") {
    return "music://";
  }

  return undefined;
}

const styles = StyleSheet.create({
  heading: {
    flex: 1,
    maxWidth: 780
  },
  headerSubtitle: {
    maxHeight: 52
  },
  grid: {
    flex: 1,
    flexDirection: "row",
    gap: 22,
    minHeight: 0
  },
  primaryCard: {
    flex: 1.15,
    minHeight: 0,
    overflow: "hidden"
  },
  secondaryCard: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden"
  },
  cardScroll: {
    flex: 1,
    minHeight: 0
  },
  primaryCardContent: {
    flexGrow: 1,
    justifyContent: "space-between"
  },
  secondaryCardContent: {
    paddingBottom: 2
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
  timerPanel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16
  },
  timerCopy: {
    flex: 1,
    minWidth: 0
  },
  executionPanel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 12
  },
  executionTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 28,
    marginTop: 8
  },
  timerValue: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    marginTop: 4,
    minWidth: 150
  },
  timerActions: {
    flexShrink: 0,
    minWidth: 140
  },
  timerActionColumn: {
    gap: 8
  },
  timerButton: {
    borderRadius: 8,
    backgroundColor: palette.ink,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: "center"
  },
  timerButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900"
  },
  timerHint: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4
  },
  timerDoneText: {
    color: palette.muted,
    flexShrink: 0,
    fontSize: 15,
    fontWeight: "900"
  },
  targetAppPicker: {
    marginTop: 10,
    maxWidth: 220,
    position: "relative"
  },
  targetAppPickerButton: {
    alignItems: "center",
    backgroundColor: "#F7F4ED",
    borderColor: palette.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  targetAppPickerText: {
    color: palette.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: "900"
  },
  targetAppPickerChevron: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  targetAppMenu: {
    backgroundColor: "#FFFFFF",
    borderColor: palette.line,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
    overflow: "hidden"
  },
  targetAppMenuItem: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  targetAppMenuItemActive: {
    backgroundColor: "#EEF3EA"
  },
  targetAppMenuText: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  targetAppMenuTextActive: {
    color: palette.green,
    fontWeight: "900"
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
    marginTop: 8,
    textAlign: "center"
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
  rewardTargetWrap: {
    flex: 1,
    minWidth: 0
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
    fontWeight: "900",
    flexShrink: 1
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
  recordMeta: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8
  },
  timerLedger: {
    gap: 4,
    marginTop: 10
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
