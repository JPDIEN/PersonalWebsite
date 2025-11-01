# The Improviser — Joseph Diener's Interactive Personal Website

## Overview
"The Improviser" is a piano-inspired interactive personal website for Joseph Diener that uses musical metaphors to tell his story as a startup leader, coach, and pianist. The site features interactive piano elements, smooth animations, and a sophisticated black/white/brass aesthetic.

## Project Architecture

### Tech Stack
- **Frontend**: React with TypeScript, Wouter for routing, Framer Motion for animations, Tone.js for piano sounds
- **Backend**: Express.js with in-memory storage
- **Styling**: Tailwind CSS with custom piano-inspired design tokens
- **Typography**: Playfair Display (headers) + Inter (body)

### Key Features
1. **Interactive Piano Keyboard**: Uses Tone.js to generate piano sounds when keys are played
2. **Six Main Sections**:
   - Prelude (Home): Hero with tagline and interactive piano
   - Themes & Variations (About): Key-based navigation through Joseph's story
   - The Score (Experience): Horizontal-scrolling timeline of milestones
   - Interlude (Journal): Tempo-organized blog system
   - Encore (Media): Gallery of playlists and media organized by musical keys
   - Coda (Contact): Contact form with chord animation
3. **Dark/Light Mode**: "Daylight Sonata" ↔ "Nocturne" theme toggle
4. **Musical Animations**: All transitions evoke musical rhythm

## Data Models

### Blog Posts
- Title, excerpt, content
- Tempo classification (Fast/Adagio)
- Read time and publish date

### Timeline Milestones
- Company, role, date range
- Impact metrics and insights
- Ordered chronologically

### Media Items
- Type (playlist, image, video)
- Musical key and mood associations
- Various aspect ratios for gallery layout

### Contact Submissions
- Name, email, message
- Submission timestamp

## Design System

### Colors
- **Primary**: Warm brass (HSL: 38, 85%, 35%)
- **Accent**: Cream (HSL: 38, 15%, 88%)
- **Background**: White (light) / Charcoal (dark)
- Black/white base inspired by piano keys

### Typography Scale
- H1: 72px desktop, 48px mobile (Playfair Display)
- H2: 48px desktop, 36px mobile
- Body: 16px (Inter)
- Line height: 1.7 for readability

### Spacing
- Standard: 16px (p-4)
- Sections: 80-96px (py-20/py-24)
- Hero: 128px (py-32)

## User Preferences
- Musical metaphors throughout all copy
- Emphasis on improvisation and strategic thinking
- Clean, sophisticated aesthetic
- Smooth, tempo-based animations

## Recent Changes
- Initial implementation completed (November 2025)
- All six sections built with responsive design
- Piano keyboard with Tone.js integration
- Theme toggle functionality
- Seeded with initial blog posts and timeline data

## Development Notes
- Fonts loaded from Google Fonts (Playfair Display + Inter)
- All interactive elements have data-testid attributes for testing
- Responsive design: mobile-first approach
- Animations use Framer Motion with musical timing (200ms, 300ms, 500ms)
- Storage uses in-memory implementation with seed data
