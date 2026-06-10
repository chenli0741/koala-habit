import { NativeModules, Platform } from "react-native";

type TimerLiveActivityOptions = {
  endAt: string;
  missionId: string;
  startAt: string;
  targetApp?: string;
  title: string;
};

type TimerLiveActivityUpdate = {
  endAt?: string;
  isPaused?: boolean;
  pausedAt?: string;
  status?: "running" | "paused" | "overdue" | "ended";
};

type KoalaLiveActivityModule = {
  end: (activityId?: string | null) => Promise<void>;
  endMission: (missionId: string) => Promise<void>;
  start: (options: TimerLiveActivityOptions) => Promise<string | undefined>;
  update: (activityId: string, update: TimerLiveActivityUpdate) => Promise<void>;
  updateMission: (missionId: string, update: TimerLiveActivityUpdate) => Promise<void>;
};

const nativeModule = NativeModules.KoalaLiveActivityModule as KoalaLiveActivityModule | undefined;

export async function startTimerLiveActivity(options: TimerLiveActivityOptions) {
  if (Platform.OS !== "ios" || !nativeModule?.start) {
    return undefined;
  }

  return nativeModule.start(options);
}

export async function updateTimerLiveActivity(activityId: string | undefined, update: TimerLiveActivityUpdate) {
  if (Platform.OS !== "ios" || !activityId || !nativeModule?.update) {
    return;
  }

  await nativeModule.update(activityId, update);
}

export async function updateTimerLiveActivityForMission(missionId: string | undefined, update: TimerLiveActivityUpdate) {
  if (Platform.OS !== "ios" || !missionId || !nativeModule?.updateMission) {
    return;
  }

  await nativeModule.updateMission(missionId, update);
}

export async function endTimerLiveActivity(activityId?: string | null) {
  if (Platform.OS !== "ios" || !nativeModule?.end) {
    return;
  }

  await nativeModule.end(activityId);
}

export async function endTimerLiveActivityForMission(missionId: string | undefined) {
  if (Platform.OS !== "ios" || !missionId || !nativeModule?.endMission) {
    return;
  }

  await nativeModule.endMission(missionId);
}
