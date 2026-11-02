import SwiftUI

enum AppTab: String, CaseIterable, Identifiable {
    case today
    case progress
    case workouts

    var id: String { rawValue }

    var title: String {
        switch self {
        case .today: return "Today"
        case .progress: return "Progress"
        case .workouts: return "Workouts"
        }
    }

    var symbol: String {
        switch self {
        case .today: return "list.bullet.rectangle.portrait"
        case .progress: return "chart.bar.xaxis"
        case .workouts: return "figure.run"
        }
    }
}

/// Floating glass taskbar: blurred surface, pink pill that springs between tabs,
/// and a slow vertical drift so it feels alive.
struct FloatingTabBar: View {
    @Binding var selection: AppTab
    @Namespace private var pill
    @State private var floating = false

    var body: some View {
        HStack(spacing: 6) {
            ForEach(AppTab.allCases) { tab in
                tabButton(tab)
            }
        }
        .padding(6)
        .frame(height: 68)
        .glassSurface(cornerRadius: 27, sheen: true)
        .offset(y: floating ? -4 : 0)
        .animation(.easeInOut(duration: 3.6).repeatForever(autoreverses: true), value: floating)
        .onAppear { floating = true }
    }

    private func tabButton(_ tab: AppTab) -> some View {
        let active = selection == tab

        return Button {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.74)) {
                selection = tab
            }
        } label: {
            VStack(spacing: 4) {
                Image(systemName: tab.symbol)
                    .font(.system(size: 19, weight: .semibold))
                    .foregroundStyle(active ? Palette.pink : Color.white.opacity(0.55))
                    .shadow(color: active ? Palette.pink.opacity(0.55) : .clear, radius: 8)
                    .scaleEffect(active ? 1.06 : 1)

                Text(tab.title)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(active ? Color.white : Color.white.opacity(0.58))
            }
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background {
                if active {
                    RoundedRectangle(cornerRadius: 21, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [Palette.pink.opacity(0.30), Palette.pink.opacity(0.10)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .overlay {
                            RoundedRectangle(cornerRadius: 21, style: .continuous)
                                .strokeBorder(Palette.pink.opacity(0.38), lineWidth: 0.5)
                        }
                        .shadow(color: Palette.pink.opacity(0.35), radius: 14, y: 6)
                        .matchedGeometryEffect(id: "tab-pill", in: pill)
                }
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}
