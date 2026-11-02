import SwiftUI

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(isSelected ? Color(hex: 0x0B0B0E) : Palette.muted)
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background {
                    Capsule()
                        .fill(isSelected ? Color.white : Color.white.opacity(0.035))
                        .overlay {
                            Capsule()
                                .strokeBorder(Color.white.opacity(isSelected ? 0 : 0.1), lineWidth: 0.5)
                        }
                }
        }
        .buttonStyle(.plain)
    }
}
