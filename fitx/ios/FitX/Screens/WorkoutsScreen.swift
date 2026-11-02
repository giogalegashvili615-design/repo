import SwiftUI

struct WorkoutsScreen: View {
    @State private var filter = "All"

    private let filters = ["All", "Run", "Ride", "Strength"]

    private var visibleWorkouts: [Workout] {
        filter == "All"
            ? Workout.samples
            : Workout.samples.filter { $0.kind.filter == filter }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                ScreenHeader(eyebrow: "5 activities logged", title: "Workouts", symbol: "calendar")

                summaryRow
                    .padding(.bottom, 14)

                HStack(spacing: 7) {
                    ForEach(filters, id: \.self) { item in
                        FilterChip(title: item, isSelected: filter == item) {
                            withAnimation(.easeInOut(duration: 0.2)) { filter = item }
                        }
                    }
                    Spacer()
                }
                .padding(.bottom, 14)

                VStack(spacing: 9) {
                    ForEach(visibleWorkouts) { workout in
                        NavigationLink(value: workout) {
                            WorkoutRow(workout: workout)
                        }
                        .buttonStyle(.plain)
                    }
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

    private var summaryRow: some View {
        HStack(spacing: 0) {
            summaryColumn(value: "5", unit: nil, label: "Workouts")
            divider
            summaryColumn(value: "86.4", unit: "km", label: "Distance")
            divider
            summaryColumn(value: "4h 24m", unit: nil, label: "Time")
        }
        .cardSurface(padding: 16)
    }

    private var divider: some View {
        Rectangle()
            .fill(Color.white.opacity(0.09))
            .frame(width: 0.5, height: 34)
    }

    private func summaryColumn(value: String, unit: String?, label: String) -> some View {
        VStack(spacing: 5) {
            HStack(alignment: .firstTextBaseline, spacing: 2) {
                Text(value)
                    .font(.system(size: 19, weight: .bold).monospacedDigit())
                    .tracking(-0.6)
                    .foregroundStyle(.white)
                if let unit {
                    Text(unit)
                        .font(.system(size: 10.5, weight: .semibold))
                        .foregroundStyle(Palette.muted)
                }
            }
            Text(label.uppercased())
                .font(.system(size: 10, weight: .bold))
                .tracking(0.9)
                .foregroundStyle(Palette.muted)
        }
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    NavigationStack { WorkoutsScreen() }
        .preferredColorScheme(.dark)
}
