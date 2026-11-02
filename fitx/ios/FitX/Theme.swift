import SwiftUI

/// FitX palette — near-black surfaces, pink accent, gold favorite.
enum Palette {
    static let background = Color(hex: 0x0A0A0A)
    static let cardTop = Color(hex: 0x17171A)
    static let cardBottom = Color(hex: 0x121214)
    static let muted = Color(hex: 0x8E8E93)
    static let pink = Color(hex: 0xFF2D55)
    static let gold = Color(hex: 0xFFC107)
    static let mint = Color(hex: 0x47E0B0)
    static let violet = Color(hex: 0x9D8CFF)
}

extension Color {
    init(hex: UInt32, opacity: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: opacity
        )
    }
}

extension View {
    /// Dark rounded card used for stats, lists and charts.
    func cardSurface(cornerRadius: CGFloat = 24, padding: CGFloat = 16) -> some View {
        self
            .padding(padding)
            .background {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [Palette.cardTop, Palette.cardBottom],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .overlay {
                        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                            .strokeBorder(Color.white.opacity(0.075), lineWidth: 0.5)
                    }
                    .shadow(color: .black.opacity(0.35), radius: 20, y: 12)
            }
    }

    /// Translucent, blurred surface used by the floating taskbar and map buttons.
    func glassSurface(cornerRadius: CGFloat, sheen: Bool = false) -> some View {
        self
            .background {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay {
                        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                            .fill(
                                LinearGradient(
                                    colors: [.white.opacity(0.13), .white.opacity(0.025)],
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                    }
                    .overlay {
                        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                            .strokeBorder(.white.opacity(0.16), lineWidth: 0.5)
                    }
                    .shadow(color: .black.opacity(0.55), radius: 24, y: 14)
            }
            .overlay {
                if sheen {
                    RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                        .fill(
                            LinearGradient(
                                stops: [
                                    .init(color: .clear, location: 0.18),
                                    .init(color: .white.opacity(0.16), location: 0.42),
                                    .init(color: .clear, location: 0.62),
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .allowsHitTesting(false)
                }
            }
    }
}

struct SectionTitle: View {
    let title: String
    var trailing: String?

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 8) {
            Text(title)
                .font(.system(size: 15, weight: .bold))
                .foregroundStyle(.white)
            Spacer(minLength: 8)
            if let trailing {
                Text(trailing)
                    .font(.system(size: 11.5))
                    .foregroundStyle(Palette.muted)
            }
        }
        .padding(.horizontal, 4)
        .padding(.top, 6)
    }
}

struct AvatarBadge: View {
    var initial: String = "A"
    var symbol: String?

    var body: some View {
        ZStack {
            Circle()
                .fill(
                    symbol == nil
                        ? AnyShapeStyle(
                            LinearGradient(
                                colors: [Color(hex: 0xFFD76E), Palette.gold],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        : AnyShapeStyle(Color.white.opacity(0.08))
                )
                .overlay(Circle().strokeBorder(Color.white.opacity(0.12), lineWidth: 0.5))
                .frame(width: 38, height: 38)

            if let symbol {
                Image(systemName: symbol)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(.white)
            } else {
                Text(initial)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(Color(hex: 0x14100A))
            }
        }
    }
}

struct GlassCircleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(width: 38, height: 38)
            .background {
                Circle()
                    .fill(.ultraThinMaterial)
                    .overlay(Circle().fill(Color(hex: 0x14141A).opacity(0.4)))
                    .overlay(Circle().strokeBorder(Color.white.opacity(0.16), lineWidth: 0.5))
                    .shadow(color: .black.opacity(0.5), radius: 12, y: 6)
            }
            .scaleEffect(configuration.isPressed ? 0.92 : 1)
            .animation(.easeOut(duration: 0.15), value: configuration.isPressed)
    }
}

struct ScreenHeader: View {
    let eyebrow: String
    let title: String
    var symbol: String?
    var initial: String?

    var body: some View {
        HStack(alignment: .bottom) {
            VStack(alignment: .leading, spacing: 4) {
                Text(eyebrow.uppercased())
                    .font(.system(size: 10.5, weight: .bold))
                    .tracking(1.4)
                    .foregroundStyle(Palette.muted)
                Text(title)
                    .font(.system(size: 32, weight: .heavy))
                    .tracking(-1)
                    .foregroundStyle(.white)
            }
            Spacer(minLength: 12)
            if let symbol {
                AvatarBadge(symbol: symbol)
            } else {
                AvatarBadge(initial: initial ?? "A")
            }
        }
        .padding(.horizontal, 4)
        .padding(.top, 12)
        .padding(.bottom, 14)
    }
}
