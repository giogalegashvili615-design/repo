import SwiftUI

enum WorkoutKind: String, Hashable, CaseIterable {
    case run
    case ride
    case strength
    case indoor

    var symbol: String {
        switch self {
        case .run, .indoor: return "figure.run"
        case .ride: return "bicycle"
        case .strength: return "dumbbell.fill"
        }
    }

    var tint: Color {
        switch self {
        case .run: return Palette.pink
        case .ride: return Palette.mint
        case .strength: return Palette.gold
        case .indoor: return Palette.violet
        }
    }

    var filter: String {
        switch self {
        case .run, .indoor: return "Run"
        case .ride: return "Ride"
        case .strength: return "Strength"
        }
    }
}

struct Weather: Hashable {
    let temperature: String
    let humidity: String
}

struct Workout: Identifiable, Hashable {
    let id: String
    let kind: WorkoutKind
    let name: String
    let date: String
    let shortDate: String
    let time: String
    let trainingLoad: Int
    let distance: Double
    let elevation: Int
    let avgTime: String
    let avgLoad: Int
    let avgDistance: Double
    let weather: Weather?
    var isFavorite: Bool = false

    var distanceText: String { String(format: "%.2f", distance) }
    var avgDistanceText: String { String(format: "%.1f", avgDistance) }
    var elevationText: String { "\(elevation)" }

    var comparisonName: String {
        switch kind {
        case .run, .indoor: return "Outdoor Run"
        case .ride: return "Outdoor Cycle"
        case .strength: return "Strength Training"
        }
    }
}

extension Workout {
    static let samples: [Workout] = [
        Workout(
            id: "w-run",
            kind: .run,
            name: "Outdoor Run",
            date: "Monday, 2 November 2026 at 19:12",
            shortDate: "Mon 2 Nov · 19:12",
            time: "0:56:29",
            trainingLoad: 103,
            distance: 10.63,
            elevation: 41,
            avgTime: "0:40:15",
            avgLoad: 59,
            avgDistance: 7.5,
            weather: Weather(temperature: "22°", humidity: "62%"),
            isFavorite: true
        ),
        Workout(
            id: "w-ride",
            kind: .ride,
            name: "Outdoor Cycle",
            date: "Saturday, 31 October 2026 at 09:04",
            shortDate: "Sat 31 Oct · 09:04",
            time: "1:02:15",
            trainingLoad: 88,
            distance: 24.60,
            elevation: 186,
            avgTime: "0:58:32",
            avgLoad: 74,
            avgDistance: 21.4,
            weather: Weather(temperature: "18°", humidity: "48%")
        ),
        Workout(
            id: "w-strength",
            kind: .strength,
            name: "Strength Training",
            date: "Thursday, 29 October 2026 at 07:20",
            shortDate: "Thu 29 Oct · 07:20",
            time: "0:35:20",
            trainingLoad: 64,
            distance: 0,
            elevation: 0,
            avgTime: "0:31:04",
            avgLoad: 58,
            avgDistance: 0
        ),
        Workout(
            id: "w-indoor",
            kind: .indoor,
            name: "Indoor Run",
            date: "Wednesday, 28 October 2026 at 20:41",
            shortDate: "Wed 28 Oct · 20:41",
            time: "0:31:48",
            trainingLoad: 52,
            distance: 6.42,
            elevation: 0,
            avgTime: "0:32:10",
            avgLoad: 55,
            avgDistance: 6.1
        ),
        Workout(
            id: "w-trail",
            kind: .run,
            name: "Trail Run",
            date: "Monday, 26 October 2026 at 17:05",
            shortDate: "Mon 26 Oct · 17:05",
            time: "1:18:02",
            trainingLoad: 121,
            distance: 12.04,
            elevation: 318,
            avgTime: "1:05:44",
            avgLoad: 96,
            avgDistance: 9.8,
            weather: Weather(temperature: "15°", humidity: "71%")
        ),
    ]
}
