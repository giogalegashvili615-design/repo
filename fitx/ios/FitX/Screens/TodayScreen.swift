import SwiftUI

struct TodayScreen: View {
    private let columns = [
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
    ]

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 14) {
                ScreenHeader(eyebrow: "Monday, 2 November", title: "Today", initial: "A")

                ActivityRingsCard()

                SectionTitle(title: "Quick stats", trailing: "Synced 2 min ago")

                LazyVGrid(columns: columns, spacing: 10) {
                    StatTile(symbol: "figure.walk", label: "Steps", value: "8,412")
                    StatTile(symbol: "location.fill", label: "Distance", value: "6.2", unit: "km")
                    StatTile(symbol: "flame.fill", label: "Active", value: "520", unit: "kcal")
                    StatTile(symbol: "heart.fill", label: "Resting HR", value: "54", unit: "bpm")
                }

                SectionTitle(title: "Latest workout", trailing: "Today")

                if let latest = Workout.samples.first {
                    NavigationLink(value: latest) {
                        WorkoutRow(workout: latest)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 18)
            .padding(.bottom, 126)
        }
        .background(Palette.background)
        .toolbar(.hidden, for: .navigationBar)
        .navigationDestination(for: Workout.self) { workout in
            WorkoutSummaryScreen(workout: workout)
        }
    }
}

#Preview {
    NavigationStack { TodayScreen() }
        .preferredColorScheme(.dark)
}
