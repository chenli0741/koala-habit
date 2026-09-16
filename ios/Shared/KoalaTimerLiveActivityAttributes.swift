import ActivityKit
import Foundation

@available(iOS 16.1, *)
struct KoalaTimerLiveActivityAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var endAt: Date
    var isPaused: Bool
    var pausedAt: Date?
    var status: String
  }

  var missionId: String
  var startAt: Date
  var targetApp: String
  var title: String
}
