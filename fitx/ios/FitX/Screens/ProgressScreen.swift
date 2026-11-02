import SwiftUI

struct ChartBar: Equatable {
    let label: String
    let value: Double
}

enum ProgressRange: String, CaseIterable, Identifiable {
    case week = "Week"
    case month = "Month"
    case year = "Year"

    var id: String { rawValue }

    var caption: String {
        switch self {
        case .week: return "Last 7 days"
        case .month: return "Last 4 weeks"
        case .year: return "Last 12 months"
        }
    }

    var total: String {
        switch self {
        case .week: return "42.6"
        case .month: return "168.4"
        case .year: return "1,284"
        }
    }

    var trend: String {
        switch self {
        case .week: return "+12%"
        case .month: return "+8%"
        case .year: return "+21%"
        }
    }

    var peakIndex: Int {
        switch self {
        case .week: return 5
        case .month: return 3
        case .year: return 9
        }
    }

    var bars: [ChartBar] {
        switch self {
        case .week:
            return [
                ChartBar(label: "M", value: 0.46),
                ChartBar(label: "T", value: 0.74),
                ChartBar(label: "W", value: 0.32),
                ChartBar(label: "T", value: 0.88),
                ChartBar(label: "F", value: 0.52),
                ChartBar(label: "S", value: 1.0),
                ChartBar(label: "S", value: 0.61),
            ]
        case .month:
            return [
                ChartBar(label: "W1", value: 0.62),
                ChartBar(label: "W2", value: 0.78),
                ChartBar(label: "W3", value: 0.49),
                ChartBar(label: "W4", value: 1.0),
            ]
        case .year:
            let labels = ["D", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N"]
            let values: [Double] = [0.38, 0.55, 0.44, 0.66, 0.72, 0.58, 0.81, 0.69, 0.88, 1.0, 0.78, 0.61]
            return zip(labels, values).map { ChartBar(label: $0, value: $1) }
        }
    }
}

private struct DistanceBars: View {
    let range: ProgressRange

    var body: some View {
        let bars = range.bars

        HStack(alignment: .bottom, spacing: bars.count > 8 ? 5 : 9) {
            ForEach(Array(bars.enumerated()), id: \.offset) { index, bar in
                VStack(spacing: 8) {
                    RoundedRectangle(cornerRadius: 7, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: index == range.peakIndex
                                    ? [Color(hex: 0xFFD76E), Palette.gold.opacity(0.32)]
                                    : [Palette.pink, Palette.pink.opacity(0.28)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .frame(height: max(6, bar.value * 132))
                        .frame(maxWidth: .infinity)
                        .shadow(
                            color: (index == range.peakIndex ? Palette.gold : Palette.pink).opacity(0.32),
                            radius: 10,
                            y: 4
                        )

                    Text(bar.label)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundStyle(Palette.muted)
                }
                .frame(maxWidth: .infinity)
            }
        }
        .frame(height: 154, alignment: .bottom)
        .animation(.spring(response: 0.55, dampingFraction: 0.82), value: range)
    }
}

private struct MiniStatCard: View {
    let label: String
    let value: String
    let unit: String?
    let delta: String

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(label.uppercased())
                .font(.system(size: 10, weight: .bold))
                .tracking(1)
                .foregroundStyle(Palette.muted)

            HStack(alignment: .firstTextBaseline, spacing: 3) {
                Text(value)
                    .font(.system(size: 21, weight: .bold).monospacedDigit())
                    .tracking(-0.6)
                    .foregroundStyle(.white)
                if let unit {
                    Text(unit)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(Palette.muted)
                }
            }
            .padding(.top, 8)

            Text(delta)
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(Palette.mint)
                .padding(.top, 6)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardSurface(padding: 15)
    }
}

struct ProgressScreen: View {
    @State private var range: ProgressRange = .week

    private let bests: [(String, String, Color, String)] = [
        ("timer", "Fastest 5K", Palette.pink, "24:18"),
        ("location.fill", "Longest run", Palette.mint, "18.4 km"),
        ("mountain.2.fill", "Biggest climb", Palette.gold, "412 m"),
        ("bolt.fill", "Best training load", Palette.violet, "148"),
    ]

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                ScreenHeader(eyebrow: range.caption, title: "Progress", symbol: "chart.bar.xaxis")

                HStack(spacing: 7) {
                    ForEach(ProgressRange.allCases) { item in
                        FilterChip(title: item.rawValue, isSelected: range == item) {
                            withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
                                range = item
                            }
                        }
                    }
                    Spacer()
                }
                .padding(.bottom, 14)

                chartCard

                HStack(spacing: 10) {
                    MiniStatCard(label: "Avg pace", value: "5'32\"", unit: "/km", delta: "−8s vs last period")
                    MiniStatCard(label: "Training load", value: "612", unit: nil, delta: "+59 vs last period")
                }
                .padding(.top, 10)

                SectionTitle(title: "Personal bests")
                    .padding(.bottom, 10)

                VStack(spacing: 0) {
                    ForEach(Array(bests.enumerated()), id: \.offset) { index, best in
                        if index > 0 {
                            Rectangle()
                                .fill(Color.white.opacity(0.055))
                                .frame(height: 0.5)
                        }
                        bestRow(symbol: best.0, title: best.1, tint: best.2, value: best.3)
                    }
                }
                .cardSurface(padding: 14)
            }
            .padding(.horizontal, 18)
            .padding(.bottom, 126)
        }
        .background(Palette.background)
        .toolbar(.hidden, for: .navigationBar)
    }

    private var chartCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("DISTANCE")
                        .font(.system(size: 10, weight: .bold))
                        .tracking(1.1)
                        .foregroundStyle(Palette.muted)

                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text(range.total)
                            .font(.system(size: 27, weight: .bold).monospacedDigit())
                            .tracking(-1)
                            .foregroundStyle(.white)
                        Text("km")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(Palette.muted)
                    }
                }

                Spacer(minLength: 8)

                HStack(spacing: 4) {
                    Image(systemName: "arrow.up.right")
                        .font(.system(size: 10, weight: .bold))
                    Text(range.trend)
                        .font(.system(size: 11.5, weight: .semibold))
                }
                .foregroundStyle(Palette.mint)
                .padding(.horizontal, 9)
                .padding(.vertical, 5)
                .background { Capsule().fill(Palette.mint.opacity(0.11)) }
            }

            DistanceBars(range: range)
                .padding(.top, 18)
        }
        .cardSurface(padding: 16)
    }

    private func bestRow(symbol: String, title: String, tint: Color, value: String) -> some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 11, style: .continuous)
                .fill(tint.opacity(0.16))
                .overlay {
                    Image(systemName: symbol)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(tint)
                }
                .frame(width: 34, height: 34)

            Text(title)
                .font(.system(size: 13.5, weight: .semibold))
                .foregroundStyle(.white)

            Spacer(minLength: 8)

            Text(value)
                .font(.system(size: 13.5, weight: .bold).monospacedDigit())
                .foregroundStyle(.white)
        }
        .padding(.vertical, 11)
    }
}

#Preview {
    NavigationStack { ProgressScreen() }
        .preferredColorScheme(.dark)
}
