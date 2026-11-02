import SwiftUI

struct WorkoutSummaryScreen: View {
    let workout: Workout
    @Environment(\.dismiss) private var dismiss

    private let columns = [
        GridItem(.flexible(), spacing: 10, alignment: .leading),
        GridItem(.flexible(), spacing: 10, alignment: .leading),
    ]

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                RouteMapView()
                    .frame(height: 356)
                    .overlay(alignment: .top) {
                        LinearGradient(
                            colors: [Color(hex: 0x08080A).opacity(0.85), .clear],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                        .frame(height: 140)
                        .allowsHitTesting(false)
                    }
                    .overlay(alignment: .top) {
                        topBar
                            .padding(.horizontal, 16)
                            .padding(.top, 58)
                    }

                summaryCard
                    .padding(.top, -30)
            }
        }
        .background(Palette.background)
        .ignoresSafeArea(edges: .top)
        .toolbar(.hidden, for: .navigationBar)
    }

    private var topBar: some View {
        HStack {
            Button {
                dismiss()
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.white)
            }
            .buttonStyle(GlassCircleButtonStyle())

            Spacer()

            Button {
                // More actions (share, export, edit) live here.
            } label: {
                Image(systemName: "ellipsis")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(.white)
            }
            .buttonStyle(GlassCircleButtonStyle())
        }
    }

    private var summaryCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            Capsule()
                .fill(Color.white.opacity(0.14))
                .frame(width: 36, height: 4)
                .frame(maxWidth: .infinity)
                .padding(.top, 8)

            HStack(alignment: .top, spacing: 13) {
                RoundedRectangle(cornerRadius: 15, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [Palette.pink, Palette.pink.opacity(0.42)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay {
                        Image(systemName: workout.kind.symbol)
                            .font(.system(size: 21, weight: .semibold))
                            .foregroundStyle(.white)
                    }
                    .frame(width: 44, height: 44)
                    .shadow(color: Palette.pink.opacity(0.45), radius: 14, y: 6)

                VStack(alignment: .leading, spacing: 5) {
                    Text(workout.name)
                        .font(.system(size: 25, weight: .heavy))
                        .tracking(-0.9)
                        .foregroundStyle(.white)

                    Text(workout.date)
                        .font(.system(size: 11.5))
                        .foregroundStyle(Palette.muted)

                    HStack(spacing: 4) {
                        Text("Tracked with Andrej's")
                        Image(systemName: "applewatch")
                            .font(.system(size: 11))
                        Text("Watch")
                    }
                    .font(.system(size: 11.5))
                    .foregroundStyle(Palette.muted)
                }

                Spacer(minLength: 0)
            }
            .padding(.top, 18)

            badges
                .padding(.top, 14)

            Rectangle()
                .fill(Color.white.opacity(0.08))
                .frame(height: 0.5)
                .padding(.top, 18)

            HStack(alignment: .firstTextBaseline) {
                Text("Key Stats")
                    .font(.system(size: 16, weight: .bold))
                    .tracking(-0.2)
                    .foregroundStyle(.white)

                Spacer(minLength: 10)

                Text("vs 30-day \(workout.comparisonName) avg")
                    .font(.system(size: 10))
                    .foregroundStyle(Palette.muted)
                    .multilineTextAlignment(.trailing)
                    .frame(maxWidth: 132, alignment: .trailing)
            }
            .padding(.top, 16)
            .padding(.bottom, 4)

            LazyVGrid(columns: columns, alignment: .leading, spacing: 2) {
                keyStat("Total Time", workout.time, "", workout.avgTime)
                keyStat("Training Load", "\(workout.trainingLoad)", "", "\(workout.avgLoad)")
                keyStat("Distance", workout.distanceText, "km", workout.avgDistanceText)
                keyStat("Elevation Gain", workout.elevationText, "m", nil)
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 22)
        .padding(.bottom, 104)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background {
            UnevenRoundedRectangle(
                topLeadingRadius: 30,
                bottomLeadingRadius: 0,
                bottomTrailingRadius: 0,
                topTrailingRadius: 30,
                style: .continuous
            )
            .fill(
                LinearGradient(
                    colors: [Color(hex: 0x101012), Palette.background],
                    startPoint: .top,
                    endPoint: .center
                )
            )
            .overlay {
                UnevenRoundedRectangle(
                    topLeadingRadius: 30,
                    bottomLeadingRadius: 0,
                    bottomTrailingRadius: 0,
                    topTrailingRadius: 30,
                    style: .continuous
                )
                .strokeBorder(Color.white.opacity(0.09), lineWidth: 0.5)
            }
        }
    }

    private var badges: some View {
        HStack(spacing: 8) {
            if let weather = workout.weather {
                HStack(spacing: 6) {
                    Image(systemName: "sun.max.fill")
                        .font(.system(size: 12))
                        .foregroundStyle(Palette.gold)
                    Text(weather.temperature)

                    Rectangle()
                        .fill(Color.white.opacity(0.16))
                        .frame(width: 1, height: 11)

                    Image(systemName: "drop.fill")
                        .font(.system(size: 11))
                        .foregroundStyle(Palette.gold)
                    Text(weather.humidity)
                }
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Color.white.opacity(0.88))
                .padding(.horizontal, 12)
                .padding(.vertical, 7)
                .glassSurface(cornerRadius: 999)
            }

            if workout.isFavorite {
                HStack(spacing: 5) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 9))
                    Text("FAVORITE")
                        .font(.system(size: 9.5, weight: .heavy))
                        .tracking(1)
                }
                .foregroundStyle(Palette.gold)
                .padding(.horizontal, 11)
                .padding(.vertical, 7)
                .background { Capsule().fill(Palette.gold.opacity(0.13)) }
                .overlay { Capsule().strokeBorder(Palette.gold.opacity(0.38), lineWidth: 0.5) }
                .shadow(color: Palette.gold.opacity(0.25), radius: 12)
            }

            Spacer(minLength: 0)
        }
    }

    private func keyStat(_ label: String, _ value: String, _ unit: String, _ delta: String?) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(label.uppercased())
                .font(.system(size: 10, weight: .bold))
                .tracking(1)
                .foregroundStyle(Palette.muted)

            HStack(alignment: .firstTextBaseline, spacing: 3) {
                Text(value)
                    .font(.system(size: 25, weight: .bold).monospacedDigit())
                    .tracking(-1)
                    .foregroundStyle(.white)
                if !unit.isEmpty {
                    Text(unit)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Palette.muted)
                }
            }
            .padding(.top, 7)

            Group {
                if let delta {
                    HStack(spacing: 3) {
                        Image(systemName: "arrow.up")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundStyle(Palette.mint)
                        Text(delta)
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(Color.white.opacity(0.5))
                            .monospacedDigit()
                    }
                } else {
                    Color.clear
                }
            }
            .frame(height: 14)
            .padding(.top, 4)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, 10)
    }
}

#Preview {
    NavigationStack {
        WorkoutSummaryScreen(workout: Workout.samples[0])
    }
    .preferredColorScheme(.dark)
}
