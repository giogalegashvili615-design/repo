# Cloud AI — Development Guide

## Overview
Cloud AI is a nature-inspired AI assistant web app built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion. It features glassmorphism design, a floating cloud mascot, chat interface, creative studio, and customizable nature backgrounds.

## Tech Stack
- **React 18** + **TypeScript** — UI framework
- **Vite 5** — dev server and build tool
- **Tailwind CSS 3** — styling
- **Framer Motion** — animations
- **Lucide React** — icons
- **React Markdown** + **react-syntax-highlighter** — markdown rendering

## Running in the Sandbox
```bash
docker compose -f docker-compose.base44.yml up -d --build
```
The app runs on port 3000 (mapped to Vite's 5173 inside the container). Dependencies are installed on container startup via `npm install`.

## Project Structure
- `src/App.tsx` — root layout, routing (state-based view switching)
- `src/context/AppContext.tsx` — global state (theme, background, conversations, chat)
- `src/components/` — all UI components
- `src/lib/` — backgrounds config, AI service, demo responses
- `src/hooks/useLocalStorage.ts` — persistent preferences

## AI Integration
The app runs in **demo mode** by default (simulated responses). To connect a real AI:
1. Set up a backend proxy that holds your API key securely
2. Expose a POST endpoint accepting `{ messages: [{role, content}] }`
3. Set `VITE_AI_API_URL` to that endpoint
See `.env.example` for details.

## Key Design Notes
- Glassmorphism via CSS custom properties (`--glass-bg`, `--glass-border`, `--glass-blur`)
- Backgrounds: Unsplash images with gradient fallbacks, stored in localStorage
- Theme (dark/light) toggled via class on `<html>`, persisted to localStorage
- Conversations persisted to localStorage
- Mobile: bottom nav bar + slide-out sidebar; Desktop: fixed sidebar
