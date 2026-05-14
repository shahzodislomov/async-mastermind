# Async Mastermind — Implementation TODO

## Design System & Foundation
- [x] Global CSS variables for dark editorial theme (gold, green, red, blue)
- [x] Instrument Serif italic + DM Sans Light typography setup
- [x] Sidebar layout with left-border accent
- [x] Update card component with 3px colored strip

## Database Schema
- [x] Users table with streak and feedback_score fields
- [x] Groups table with captain and member management
- [x] Updates table with win, blocker, mrr, mood, voice_url fields
- [x] Feedback table with tag enforcement
- [x] Metrics table for tracking progress
- [x] Weeks table for submission deadlines

## tRPC API Layer
- [x] Auth procedures (me, logout)
- [x] Updates procedures (create, list, get, getByWeek)
- [x] Members procedures (list, getStreaks)
- [x] Feedback procedures (give, receive)
- [x] Archive procedures (getHistory, export)
- [x] Mock seed data

## Feed Screen
- [x] Week progress bar component
- [x] Stats summary row
- [x] Update cards with win/blocker display
- [x] Animated deadline pulse
- [x] Responsive layout

## Submit Screen
- [x] Structured form with discrete fields
- [x] Win input field
- [x] Blocker input field
- [x] MRR input field
- [x] Mood selector (1-5 scale)
- [x] Voice note upload with recording functionality
- [x] Form validation and submission

## Members Screen
- [x] Member grid/list layout
- [x] Streak history display
- [x] Feedback score display
- [x] Last update timestamp
- [x] At-risk warning badge
- [x] Color-coded status indicators

## Feedback Screen
- [x] Received feedback list with tags
- [x] Give feedback form
- [x] Tag selection enforcement (Encouraging, Tactical, Question)
- [x] Minimum character validation
- [x] Feedback submission

## Archive Screen
- [x] 18-week MRR line chart (Recharts)
- [x] Chronological entry log
- [x] CSV export button
- [x] JSON export button
- [x] Filter and search functionality

## Authentication & Navigation
- [x] Manus OAuth integration
- [x] Protected routes for all screens
- [x] Sidebar navigation with user profile
- [x] Login/logout flow
- [x] Route guards

## Polish & Animations
- [x] Deadline pulse animation
- [x] Smooth transitions between screens
- [x] Loading states
- [x] Error handling
- [x] Responsive design refinement

## Testing
- [x] tRPC procedures vitest coverage (16 tests passing)
- [x] API endpoint validation
- [x] Form validation tests

## Advanced Features (Phase 2)
- [x] Voice transcription integration with server-side helper
- [x] Notification system for events and alerts
- [x] Streak achievements and milestone badges
- [x] Custom metrics dashboard with trend analysis
- [x] Group management admin panel
- [x] Real-time updates with WebSocket (Socket.io + client hooks)
- [x] Real-time Feed integration with live update notifications
- [x] 27 comprehensive vitest tests passing
