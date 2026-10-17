// Demo responses for when no AI API is configured.
// These are clearly labeled as demo mode — never pretend they came from a real AI.

const responses: Record<string, string> = {
  trip: `Here's a 7-day mountain trip plan:

1. **Day 1: Arrival** — Check into your cabin, explore the local village, and enjoy a welcome dinner.
2. **Day 2: First Hike** — Take a gentle trail to acclimatize and enjoy panoramic valley views.
3. **Day 3: Lake Day** — Kayaking or swimming at the alpine lake, followed by a picnic lunch.
4. **Day 4: Summit Attempt** — Early start for a guided summit hike with packed lunches.
5. **Day 5: Rest & Recover** — Spa day, local hot springs, and a leisurely forest walk.
6. **Day 6: Adventure Sports** — Try paragliding, mountain biking, or rock climbing.
7. **Day 7: Return & Reflection** — Sunrise photography, brunch, and a scenic drive home.

Would you like me to adjust this for a specific mountain range or budget?`,

  code: `Here's a React component example with TypeScript:

\`\`\`tsx
import { useState } from 'react'

interface CounterProps {
  initial?: number
}

export function Counter({ initial = 0 }: CounterProps) {
  const [count, setCount] = useState(initial)

  return (
    <div className="counter">
      <button onClick={() => setCount(c => c - 1)}>−</button>
      <span>{count}</span>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  )
}
\`\`\`

This is a simple counter with increment and decrement. You can pass an \`initial\` prop to set the starting value.`,

  image: `In demo mode, I can't generate actual images. Here's what I would create:

**Prompt:** *"A serene mountain lake at dawn, mist rising from the water, golden sunlight breaking through clouds, reflections of snow-capped peaks"*

To enable real image generation, connect an AI provider like DALL·E or Stable Diffusion through your backend.`,

  write: `Here's a polished version of your text:

---

The morning mist hung low over the valley, wrapping the ancient pines in a soft, silver embrace. Somewhere beyond the veil, a river whispered its timeless song — a melody that had greeted these mountains long before the first footstep, and would echo long after the last.

---

Want me to adjust the tone, length, or style?`,

  summarize: `Here's a concise summary:

• **Key point 1:** The main topic revolves around nature-inspired AI design.
• **Key point 2:** Glassmorphism and translucent panels create a premium feel.
• **Key point 3:** A friendly mascot adds personality and warmth.
• **Key point 4:** Responsive design ensures accessibility across devices.

Would you like me to expand on any of these points?`,

  brainstorm: `Here are some creative ideas:

1. **Eco-friendly subscription box** — Curated sustainable products delivered monthly.
2. **AI-powered garden planner** — App that designs optimal layouts based on climate data.
3. **Virtual retreat platform** — Guided nature meditation sessions with live forest cams.
4. **Local food marketplace** — Connect farmers directly with urban consumers.
5. **Smart hiking companion** — Wearable that suggests trails based on fitness and mood.

Which of these excites you most? I can develop any of them further!`,

  research: `In demo mode, I can't perform live web searches. Here's what I'd research for you:

I would search for the latest information on your topic, compile key findings from multiple sources, and present them with citations.

To enable real web research, connect a search API (like Tavily or Serper) through your backend proxy.`,

  default: `That's a great question! In **demo mode**, I provide simulated responses to showcase the interface.

Here's what I can help with:

- 💬 **Chat** — Have natural conversations
- 🎨 **Create** — Text to image, writing, code, and more
- 🔍 **Explore** — Research and brainstorm ideas
- ⚙️ **Settings** — Customize your experience

To connect a real AI model, configure the \`VITE_AI_API_URL\` environment variable with your backend endpoint. See the \`.env.example\` file for details.`,
}

export function getDemoResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase()

  if (lower.includes('trip') || lower.includes('travel') || lower.includes('plan') || lower.includes('vacation'))
    return responses.trip
  if (lower.includes('code') || lower.includes('function') || lower.includes('component') || lower.includes('bug'))
    return responses.code
  if (lower.includes('image') || lower.includes('picture') || lower.includes('draw') || lower.includes('generate'))
    return responses.image
  if (lower.includes('write') || lower.includes('rewrite') || lower.includes('improve') || lower.includes('story'))
    return responses.write
  if (lower.includes('summar') || lower.includes('tldr') || lower.includes('short'))
    return responses.summarize
  if (lower.includes('brainstorm') || lower.includes('idea') || lower.includes('business'))
    return responses.brainstorm
  if (lower.includes('research') || lower.includes('search') || lower.includes('find'))
    return responses.research

  return responses.default
}
