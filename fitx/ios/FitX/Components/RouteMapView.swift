import SwiftUI

/// Stylised dark route map used on the workout summary.
/// Drawn locally (no tiles, no network) so the design is identical in every build.
struct RouteMapView: View {
    @State private var progress: CGFloat = 0

    var body: some View {
        GeometryReader { geo in
            let size = geo.size

            ZStack {
                MapBase()

                RouteShape()
                    .trim(from: 0, to: progress)
                    .stroke(Color.white.opacity(0.22), style: StrokeStyle(lineWidth: 13, lineCap: .round, lineJoin: .round))
                    .blur(radius: 7)

                RouteShape()
                    .trim(from: 0, to: progress)
                    .stroke(Color.white, style: StrokeStyle(lineWidth: 3.6, lineCap: .round, lineJoin: .round))
                    .shadow(color: Color.white.opacity(0.4), radius: 6)

                Circle()
                    .fill(Color(hex: 0x0C0F13))
                    .frame(width: 13, height: 13)
                    .overlay(Circle().fill(.white).frame(width: 7, height: 7))
                    .position(x: size.width * 40 / 393, y: size.height * 300 / 356)

                flag
                    .position(x: size.width * 300 / 393, y: size.height * 150 / 356)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 1.7)) { progress = 1 }
        }
    }

    private var flag: some View {
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: 1.2)
                .fill(.white)
                .frame(width: 2.4, height: 24)
                .offset(x: -1.2, y: -16)

            ZStack(alignment: .topLeading) {
                Color(hex: 0x0C0F13)
                VStack(spacing: 0) {
                    HStack(spacing: 0) {
                        Color.white.frame(width: 4.7, height: 5.5)
                        Color.clear.frame(width: 4.7, height: 5.5)
                        Color.white.frame(width: 4.7, height: 5.5)
                        Color.clear.frame(width: 4.7, height: 5.5)
                    }
                    HStack(spacing: 0) {
                        Color.clear.frame(width: 4.7, height: 5.5)
                        Color.white.frame(width: 4.7, height: 5.5)
                        Color.clear.frame(width: 4.7, height: 5.5)
                        Color.white.frame(width: 4.7, height: 5.5)
                    }
                }
            }
            .frame(width: 19, height: 11)
            .offset(x: 1, y: -16)
        }
        .frame(width: 24, height: 26, alignment: .topLeading)
    }
}

private struct MapBase: View {
    var body: some View {
        Canvas { context, size in
            context.scaleBy(x: size.width / 393, y: size.height / 356)

            context.fill(
                Path(CGRect(x: 0, y: 0, width: 393, height: 356)),
                with: .linearGradient(
                    Gradient(colors: [Color(hex: 0x171B21), Color(hex: 0x0B0E12)]),
                    startPoint: .zero,
                    endPoint: CGPoint(x: 0, y: 356)
                )
            )

            context.fill(
                Path(ellipseIn: CGRect(x: 238, y: 148, width: 112, height: 88)),
                with: .color(Color(hex: 0x16241F).opacity(0.85))
            )

            let streets: [(CGPoint, CGPoint)] = [
                (CGPoint(x: -20, y: 96), CGPoint(x: 300, y: 60)),
                (CGPoint(x: -20, y: 150), CGPoint(x: 340, y: 112)),
                (CGPoint(x: -20, y: 214), CGPoint(x: 380, y: 180)),
                (CGPoint(x: -20, y: 276), CGPoint(x: 400, y: 250)),
                (CGPoint(x: 60, y: -10), CGPoint(x: 92, y: 340)),
                (CGPoint(x: 150, y: -10), CGPoint(x: 168, y: 350)),
                (CGPoint(x: 240, y: -10), CGPoint(x: 246, y: 350)),
                (CGPoint(x: 320, y: -10), CGPoint(x: 350, y: 350)),
                (CGPoint(x: -20, y: 60), CGPoint(x: 420, y: 300)),
                (CGPoint(x: 120, y: 360), CGPoint(x: 200, y: -10)),
            ]

            var streetPath = Path()
            for (start, end) in streets {
                streetPath.move(to: start)
                streetPath.addLine(to: end)
            }
            context.stroke(streetPath, with: .color(Color(hex: 0x2B323B)), lineWidth: 1.1)

            var highway = Path()
            highway.move(to: CGPoint(x: -20, y: 250))
            highway.addCurve(
                to: CGPoint(x: 410, y: 166),
                control1: CGPoint(x: 120, y: 244),
                control2: CGPoint(x: 260, y: 200)
            )
            context.stroke(
                highway,
                with: .color(Color(hex: 0x20262E)),
                style: StrokeStyle(lineWidth: 9, lineCap: .round)
            )
            context.stroke(highway, with: .color(Color(hex: 0x39414C).opacity(0.7)), lineWidth: 1.2)

            context.draw(
                Text("280")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(Color(hex: 0x6B7683)),
                at: CGPoint(x: 292, y: 200)
            )
            context.draw(
                Text("Stevens Creek Blvd")
                    .font(.system(size: 9))
                    .foregroundStyle(Color(hex: 0x4D5764)),
                at: CGPoint(x: 140, y: 116)
            )
        }
    }
}

/// The recorded route, drawn in a 393 x 356 design space and scaled to fit.
struct RouteShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: 40, y: 300))
        path.addCurve(
            to: CGPoint(x: 142, y: 232),
            control1: CGPoint(x: 86, y: 286),
            control2: CGPoint(x: 96, y: 246)
        )
        path.addCurve(
            to: CGPoint(x: 242, y: 226),
            control1: CGPoint(x: 188, y: 218),
            control2: CGPoint(x: 212, y: 252)
        )
        path.addCurve(
            to: CGPoint(x: 300, y: 150),
            control1: CGPoint(x: 272, y: 200),
            control2: CGPoint(x: 264, y: 168)
        )

        let scale = CGAffineTransform(
            scaleX: rect.width / 393,
            y: rect.height / 356
        )
        return path.applying(scale)
    }
}
