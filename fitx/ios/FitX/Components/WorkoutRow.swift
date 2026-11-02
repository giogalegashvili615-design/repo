import SwiftUI

struct WorkoutIcon: View {
    let kind: WorkoutKind
    var size: CGFloat = 42

    var body: some View {
        RoundedRectangle(cornerRadius: size * 0.31, style: .continuous)
            .fill(kind.tint.opacity(0.16))
            .overlay {
                RoundedRectangle(cornerRadius: size * 0.31, style: .continuous)
                    .strokeBorder(Color.white.opacity(0.1), lineWidth: 0.5)
            }
            .overlay {
                Image(systemName: kind.symbol)
                    .font(.system(size: size * 0.46, weight: .semibold))
                    .foregroundStyle(kind.tint)
            }
            .frame(width: size, height: size)
    }
}

struct WorkoutRow: View {
    let workout: Workout
    var showsChevron = true

    var body: some View {
        HStack(spacing: 12) {
            WorkoutIcon(kind: workout.kind)

            VStack(alignment: .leading, spacing: 3) {
                Text(workout.name)
                    .font(.system(size: 14.5, weight: .semibold))
                    .foregroundStyle(.white)
                Text("\(workout.shortDate) · \(workout.time)")
                    .font(.system(size: 11.5))
                    .foregroundStyle(Palette.muted)
                    .lineLimit(1)
            }

            Spacer(minLength: 8)

            HStack(alignment: .firstTextBaseline, spacing: 2) {
                Text(workout.kind == .strength ? workout.time : workout.distanceText)
                    .font(.system(size: 16, weight: .bold).monospacedDigit())
                    .foregroundStyle(.white)
                if workout.kind != .strength {
                    Text("km")
                        .font(.system(size: 11))
                        .foregroundStyle(Palette.muted)
                }
            }

            if showsChevron {
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(Color.white.opacity(0.26))
            }
        }
        .cardSurface(padding: 14)
        .contentShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

struct StatTile: View {
    let symbol: String
    let label: String
    let value: String
    var unit: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 9) {
            HStack(spacing: 6) {
                Image(systemName: symbol)
                    .font(.system(size: 11, weight: .semibold))
                Text(label.uppercased())
                    .font(.system(size: 10, weight: .bold))
                    .tracking(1)
            }
            .foregroundStyle(Palette.muted)

            HStack(alignment: .firstTextBaseline, spacing: 3) {
                Text(value)
                    .font(.system(size: 23, weight: .bold).monospacedDigit())
                    .foregroundStyle(.white)
                if let unit {
                    Text(unit)
                        .font(.system(size: 11.5, weight: .semibold))
                        .foregroundStyle(Palette.muted)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardSurface(padding: 15)
    }
}

struct ActivityRing: View {
    let progress: Double
    let color: Color
    let lineWidth: CGFloat
    @State private var drawn: Double = 0

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.white.opacity(0.07), style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
            Circle()
                .trim(from: 0, to: min(max(drawn, 0), 1))
                .stroke(color, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .shadow(color: color.opacity(0.5), radius: 6)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 1.1)) { drawn = progress }
        }
    }
}

struct ActivityRingsCard: View {
    private struct RingRow {
        let label: String
        let value: String
        let goal: String
        let color: Color
    }

    private let rows: [RingRow] = [
        RingRow(label: "Move", value: "520", goal: "/600 kcal", color: Palette.pink),
        RingRow(label: "Exercise", value: "42", goal: "/30 min", color: Palette.gold),
        RingRow(label: "Stand", value: "9", goal: "/12 hr", color: Palette.mint),
    ]

    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                ActivityRing(progress: 0.86, color: Palette.pink, lineWidth: 9)
                ActivityRing(progress: 1.0, color: Palette.gold, lineWidth: 9)
                    .padding(15)
                ActivityRing(progress: 0.75, color: Palette.mint, lineWidth: 9)
                    .padding(30)
            }
            .padding(5)
            .frame(width: 136, height: 136)

            VStack(alignment: .leading, spacing: 13) {
                ForEach(rows, id: \.label) { row in
                    HStack(spacing: 8) {
                        Circle()
                            .fill(row.color)
                            .frame(width: 8, height: 8)
                            .shadow(color: row.color.opacity(0.8), radius: 5)

                        Text(row.value)
                            .font(.system(size: 15, weight: .bold).monospacedDigit())
                            .foregroundStyle(.white)

                        Text(row.goal)
                            .font(.system(size: 10.5, weight: .semibold))
                            .foregroundStyle(Palette.muted)

                        Spacer(minLength: 4)

                        Text(row.label.uppercased())
                            .font(.system(size: 10, weight: .bold))
                            .tracking(0.9)
                            .foregroundStyle(Palette.muted)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .cardSurface(padding: 18)
    }
}
