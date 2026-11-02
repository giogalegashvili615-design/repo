import SwiftUI

@main
struct FitXApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
                .preferredColorScheme(.dark)
                .tint(Palette.pink)
        }
    }
}
