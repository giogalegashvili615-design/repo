import SwiftUI

struct RootView: View {
    @State private var tab: AppTab = .today

    var body: some View {
        ZStack(alignment: .bottom) {
            Palette.background.ignoresSafeArea()

            content
                .animation(.easeInOut(duration: 0.25), value: tab)

            FloatingTabBar(selection: $tab)
                .padding(.horizontal, 14)
                .padding(.bottom, 10)
        }
        .ignoresSafeArea(.keyboard)
    }

    @ViewBuilder
    private var content: some View {
        switch tab {
        case .today:
            NavigationStack { TodayScreen() }
        case .progress:
            NavigationStack { ProgressScreen() }
        case .workouts:
            NavigationStack { WorkoutsScreen() }
        }
    }
}

#Preview {
    RootView()
        .preferredColorScheme(.dark)
}
