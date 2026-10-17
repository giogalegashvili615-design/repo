import type { BackgroundTheme } from '../types'

export const BACKGROUNDS: BackgroundTheme[] = [
  {
    id: 'alpine-morning',
    name: 'Alpine Morning',
    description: 'Snowy mountains and blue skies',
    image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920&q=80&auto=format',
    gradient: 'linear-gradient(180deg, #a8d8ea 0%, #d4e9f7 50%, #f0f5fa 100%)',
    overlay: 'linear-gradient(180deg, rgba(10,30,60,0.15) 0%, rgba(10,30,60,0.35) 100%)',
    isGradient: false,
  },
  {
    id: 'forest-mist',
    name: 'Forest Mist',
    description: 'Deep green forest and fog',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80&auto=format',
    gradient: 'linear-gradient(180deg, #1a3a2a 0%, #2d5a3d 50%, #4a7a5a 100%)',
    overlay: 'linear-gradient(180deg, rgba(10,30,20,0.25) 0%, rgba(10,30,20,0.45) 100%)',
    isGradient: false,
  },
  {
    id: 'blue-lake',
    name: 'Blue Lake',
    description: 'Crystal-clear lake and distant mountains',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format',
    gradient: 'linear-gradient(180deg, #1a4a7a 0%, #2d6aa0 50%, #5aa0d0 100%)',
    overlay: 'linear-gradient(180deg, rgba(10,30,50,0.2) 0%, rgba(10,30,50,0.4) 100%)',
    isGradient: false,
  },
  {
    id: 'golden-sunset',
    name: 'Golden Sunset',
    description: 'Warm sunlight and orange clouds',
    image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80&auto=format',
    gradient: 'linear-gradient(180deg, #8b4513 0%, #d4730a 50%, #f0a030 100%)',
    overlay: 'linear-gradient(180deg, rgba(40,20,5,0.25) 0%, rgba(40,20,5,0.4) 100%)',
    isGradient: false,
  },
  {
    id: 'midnight-sky',
    name: 'Midnight Sky',
    description: 'Dark mountains with stars',
    image: 'https://images.unsplash.com/photo-1419242902?w=1920&q=80&auto=format',
    gradient: 'linear-gradient(180deg, #050816 0%, #0a1030 40%, #121a40 100%)',
    overlay: 'linear-gradient(180deg, rgba(0,0,10,0.35) 0%, rgba(0,0,10,0.5) 100%)',
    isGradient: false,
  },
  {
    id: 'minimal-cloud',
    name: 'Minimal Cloud',
    description: 'Soft blue-white gradient',
    image: '',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #80D1FF 70%, #a8e6ff 100%)',
    overlay: 'linear-gradient(180deg, rgba(30,40,80,0.1) 0%, rgba(30,40,80,0.25) 100%)',
    isGradient: true,
  },
]

export const DEFAULT_BACKGROUND = BACKGROUNDS[0]
