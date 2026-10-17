export type ViewName = 'home' | 'chat' | 'create' | 'tools' | 'history' | 'settings'

export type ThemeMode = 'dark' | 'light'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isDemo?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface BackgroundTheme {
  id: string
  name: string
  description: string
  image: string
  gradient: string
  overlay: string
  isGradient: boolean
}

export interface CreativeTool {
  id: string
  title: string
  description: string
  icon: string
  color: string
}
