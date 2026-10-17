import { CloudMascot } from './CloudMascot'

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="scale-50 -m-4">
        <CloudMascot size="sm" />
      </div>
      <div className="glass rounded-2xl px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-cloud-cyan animate-bounce-dot"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
    </div>
  )
}
