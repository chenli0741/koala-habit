import ActivityKit
import SwiftUI
import WidgetKit

@available(iOSApplicationExtension 16.1, *)
struct KoalaTimerLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: KoalaTimerLiveActivityAttributes.self) { context in
      TimerLockScreenView(context: context)
        .activityBackgroundTint(Color(red: 0.02, green: 0.03, blue: 0.03))
        .activitySystemActionForegroundColor(.white)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          TimerTitleView(context: context)
        }
        DynamicIslandExpandedRegion(.trailing) {
          TimerCountdownText(context: context, font: .title2.monospacedDigit().weight(.black))
        }
        DynamicIslandExpandedRegion(.bottom) {
          Text(context.attributes.targetApp)
            .font(.caption.weight(.bold))
            .foregroundStyle(.white.opacity(0.72))
            .lineLimit(1)
        }
      } compactLeading: {
        Circle()
          .fill(Color(red: 0.37, green: 0.82, blue: 0.45))
          .frame(width: 12, height: 12)
      } compactTrailing: {
        TimerCountdownText(context: context, font: .caption.monospacedDigit().weight(.black))
      } minimal: {
        Image(systemName: "timer")
      }
      .keylineTint(Color(red: 0.37, green: 0.82, blue: 0.45))
    }
  }
}

@available(iOSApplicationExtension 16.1, *)
private struct TimerLockScreenView: View {
  let context: ActivityViewContext<KoalaTimerLiveActivityAttributes>

  var body: some View {
    HStack(spacing: 12) {
      Circle()
        .fill(Color(red: 0.37, green: 0.82, blue: 0.45))
        .frame(width: 14, height: 14)
      TimerTitleView(context: context)
      Spacer(minLength: 8)
      TimerCountdownText(context: context, font: .title3.monospacedDigit().weight(.black))
    }
    .padding(.horizontal, 16)
    .padding(.vertical, 12)
  }
}

@available(iOSApplicationExtension 16.1, *)
private struct TimerTitleView: View {
  let context: ActivityViewContext<KoalaTimerLiveActivityAttributes>

  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text(statusText)
        .font(.caption2.weight(.black))
        .foregroundStyle(.white.opacity(0.68))
      Text(context.attributes.title)
        .font(.caption.weight(.black))
        .foregroundStyle(.white)
        .lineLimit(1)
    }
  }

  private var statusText: String {
    if context.state.isPaused {
      return "Paused"
    }

    if context.state.status == "overdue" {
      return "Overdue"
    }

    return "Counting"
  }
}

@available(iOSApplicationExtension 16.1, *)
private struct TimerCountdownText: View {
  let context: ActivityViewContext<KoalaTimerLiveActivityAttributes>
  let font: Font

  var body: some View {
    if context.state.isPaused {
      Text(context.state.pausedAt ?? Date(), style: .timer)
        .hidden()
        .overlay(Text("Paused"))
        .font(font)
        .foregroundStyle(.white)
        .lineLimit(1)
    } else {
      Text(timerInterval: Date()...context.state.endAt, countsDown: true)
        .font(font)
        .foregroundStyle(.white)
        .lineLimit(1)
    }
  }
}
