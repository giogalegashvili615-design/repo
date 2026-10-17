import { CloudSun } from 'lucide-react'

export function WeatherWidget() {
  return (
    <div className="glass rounded-2xl px-3.5 py-2 flex items-center gap-2.5 no-select">
      <CloudSun className="w-6 h-6 text-yellow-300" strokeWidth={1.5} />
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-primary">18°C</span>
          <span className="text-xs text-secondary">Partly Cloudy</span>
        </div>
        <span className="text-xs text-secondary">Tbilisi, Georgia</span>
      </div>
    </div>
  )
}
