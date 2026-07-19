# Design

## Visual Theme
Dark mode only, dense control center aesthetic. Inspired by Datadog, Grafana, and Bloomberg Terminal.

## Color Palette
- Main Background: near-black with blue undertones (`#0a0e17`)
- Panels/Cards: deep slate (`#111827`, `#1a2236`)
- Accent: indigo/purple (`#6366f1`)
- Status System: 
  - Critical: red (`#ef4444`) with dark glow
  - Warning: amber (`#f59e0b`)
  - OK: green (`#22c55e`)
  - Info: blue (`#3b82f6`)

## Typography
- **Metrics/Data/Timestamps**: `JetBrains Mono` (gives a technical, precise ticker-board feel)
- **Body/UI Labels**: `Inter` (clean, highly legible at small sizes)

## Components & Structure
- **Global Layout**: Fixed top bar (Command Bar, Status), fixed tab bar, flex content area, fixed bottom status bar.
- **AI Panel**: Slide-in panel on the right for execution plans, approval workflows, and conversation history.
- **Metric Cards**: Real-time counters with digit-flip animations.
- **Stadium Map**: Canvas 2D map with density heatmaps and colored crowd dots.

## Motion & Interaction
- GPU-composited CSS transforms (no layout thrashing).
- Critical incidents pulse gently.
- AI panel slides in from the right edge.
- Smooth digit-flip for metrics.
