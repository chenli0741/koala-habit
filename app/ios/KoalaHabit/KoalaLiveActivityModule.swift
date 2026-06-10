import ActivityKit
import Foundation

@objc(KoalaLiveActivityModule)
class KoalaLiveActivityModule: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc(start:resolver:rejecter:)
  func start(_ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 16.1, *) else {
      resolve(nil)
      return
    }

    guard ActivityAuthorizationInfo().areActivitiesEnabled else {
      resolve(nil)
      return
    }

    guard let missionId = options["missionId"] as? String,
          let title = options["title"] as? String,
          let startAtValue = options["startAt"] as? String,
          let endAtValue = options["endAt"] as? String,
          let startAt = KoalaLiveActivityModule.date(from: startAtValue),
          let endAt = KoalaLiveActivityModule.date(from: endAtValue)
    else {
      reject("invalid_options", "Live Activity timer options are missing required fields.", nil)
      return
    }

    let attributes = KoalaTimerLiveActivityAttributes(
      missionId: missionId,
      startAt: startAt,
      targetApp: (options["targetApp"] as? String) ?? "Timer",
      title: title
    )
    let state = KoalaTimerLiveActivityAttributes.ContentState(
      endAt: endAt,
      isPaused: false,
      pausedAt: nil,
      status: "running"
    )

    do {
      let activity = try Activity.request(attributes: attributes, contentState: state, pushType: nil)
      resolve(activity.id)
    } catch {
      reject("activity_start_failed", error.localizedDescription, error)
    }
  }

  @objc(update:update:resolver:rejecter:)
  func update(_ activityId: String, update payload: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 16.1, *) else {
      resolve(nil)
      return
    }

    guard let activity = KoalaLiveActivityModule.activity(with: activityId) else {
      resolve(nil)
      return
    }

    KoalaLiveActivityModule.update(activity, with: payload, resolve: resolve)
  }

  @objc(updateMission:update:resolver:rejecter:)
  func updateMission(_ missionId: String, update payload: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 16.1, *) else {
      resolve(nil)
      return
    }

    guard let activity = KoalaLiveActivityModule.activity(missionId: missionId) else {
      resolve(nil)
      return
    }

    KoalaLiveActivityModule.update(activity, with: payload, resolve: resolve)
  }

  @objc(endMission:resolver:rejecter:)
  func endMission(_ missionId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 16.1, *) else {
      resolve(nil)
      return
    }

    Task {
      let activities = KoalaLiveActivityModule.activities(missionId: missionId)

      for activity in activities {
        var finalState = activity.contentState
        finalState.status = "ended"
        await activity.end(using: finalState, dismissalPolicy: .immediate)
      }

      resolve(nil)
    }
  }

  @objc(end:resolver:rejecter:)
  func end(_ activityId: String?, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 16.1, *) else {
      resolve(nil)
      return
    }

    Task {
      let activities = KoalaLiveActivityModule.activities(matching: activityId)

      for activity in activities {
        var finalState = activity.contentState
        finalState.status = "ended"
        await activity.end(using: finalState, dismissalPolicy: .immediate)
      }

      resolve(nil)
    }
  }

  @available(iOS 16.1, *)
  private static func activity(with id: String) -> Activity<KoalaTimerLiveActivityAttributes>? {
    Activity<KoalaTimerLiveActivityAttributes>.activities.first { $0.id == id }
  }

  @available(iOS 16.1, *)
  private static func activity(missionId: String) -> Activity<KoalaTimerLiveActivityAttributes>? {
    Activity<KoalaTimerLiveActivityAttributes>.activities.first { $0.attributes.missionId == missionId }
  }

  @available(iOS 16.1, *)
  private static func activities(matching id: String?) -> [Activity<KoalaTimerLiveActivityAttributes>] {
    guard let id else {
      return Array(Activity<KoalaTimerLiveActivityAttributes>.activities)
    }

    return Activity<KoalaTimerLiveActivityAttributes>.activities.filter { $0.id == id }
  }

  @available(iOS 16.1, *)
  private static func activities(missionId: String) -> [Activity<KoalaTimerLiveActivityAttributes>] {
    Activity<KoalaTimerLiveActivityAttributes>.activities.filter { $0.attributes.missionId == missionId }
  }

  @available(iOS 16.1, *)
  private static func update(
    _ activity: Activity<KoalaTimerLiveActivityAttributes>,
    with payload: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock
  ) {
    let current = activity.contentState
    let endAt = (payload["endAt"] as? String).flatMap(KoalaLiveActivityModule.date(from:)) ?? current.endAt
    let isPaused = (payload["isPaused"] as? Bool) ?? current.isPaused
    let pausedAt = (payload["pausedAt"] as? String).flatMap(KoalaLiveActivityModule.date(from:)) ?? current.pausedAt
    let status = (payload["status"] as? String) ?? current.status
    let nextState = KoalaTimerLiveActivityAttributes.ContentState(
      endAt: endAt,
      isPaused: isPaused,
      pausedAt: pausedAt,
      status: status
    )

    Task {
      await activity.update(using: nextState)
      resolve(nil)
    }
  }

  private static func date(from value: String) -> Date? {
    ISO8601DateFormatter.liveActivityFormatter.date(from: value)
  }
}

private extension ISO8601DateFormatter {
  static let liveActivityFormatter: ISO8601DateFormatter = {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return formatter
  }()
}
