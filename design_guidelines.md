# Design Guidelines: "The Improviser" — Joseph Diener's Interactive Piano Website

## Core Principles
1. **Life as Improvisation:** Every interaction reveals story progression
2. **Musical Hierarchy:** Visual weight follows musical dynamics (fortissimo = bold, pianissimo = subtle)
3. **Structured Fluidity:** Grid-based layouts with flowing transitions
4. **Purposeful Restraint:** Minimalism amplifying interaction moments

**Aesthetic Foundation:**
- Piano-inspired black/white base with warm brass/cream accents
- All animations evoke musical rhythm (smooth, tempo-based)
- Mobile-first, responsive design

## Typography

**Fonts:**
- **Playfair Display** (headers): Elegant, musical sophistication
  - H1: 72px/4.5rem desktop, 48px/3rem mobile
  - H2: 48px/3rem desktop, 36px/2.25rem mobile
  - H3: 36px/2.25rem desktop, 28px/1.75rem mobile
  - Letter-spacing: 0.02em

- **Inter** (body/UI): Modern, legible
  - Large: 20px/1.25rem (featured text)
  - Regular: 16px/1rem (standard)
  - Small: 14px/0.875rem (captions)
  - Micro: 12px/0.75rem (labels)
  - Line-height: 1.7

## Layout System

**Spacing (Tailwind units):**
- Micro: p-2, m-2 (8px)
- Standard: p-4, m-4 (16px)
- Sections: py-12/py-16 (mobile), py-20/py-24 (desktop)
- Hero: py-32 (128px)

**Grid:**
- Max-width: max-w-7xl (1280px) content, max-w-4xl (896px) reading
- Breakpoints: md-768px, lg-1024px, xl-1280px
- Feature grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

## Section Specifications

### 1. Prelude (Hero)
- Full viewport (min-h-screen), centered content
- Grand piano background with subtle parallax
- Tagline: "Every note a story." (Playfair 72px, centered)
- **Piano Keyboard:** Full-width horizontal strip, 2-3 octaves practical
  - White keys 8:1 ratio, black keys offset/elevated
  - Hover: Glow + translateY(-4px)
  - Click: scale(0.98) + shadow
  - Middle C: Highlighted, triggers section transition
  - Load: Sequential shimmer (50ms stagger)

### 2. Themes & Variations (About)
- Split layout: Fixed piano keys (left), scrollable content (right)
- Mobile: Vertical stack, key selector top
- **Cards:** p-8, subtle border, 300ms height transition
  - **C Major:** Notre Dame (warm/bright)
  - **G Minor:** Startup lessons (contemplative)
  - **A♭ Major:** Philosophy (ethereal)
- **Improviser's Note:** Pull quote, Playfair italic, line-height 2.0, max-w-prose
- **Headshot:** Circular crop (200px), top-center

### 3. The Score (Timeline)
- Horizontal scroll resembling sheet music staff
- **Desktop:** 3-4 cards visible, scroll-snap-type: x mandatory
- **Mobile:** Vertical scroll, full-width
- **Milestone Cards:** h-64, hover translateY(-12px)
  - Company/role (Inter Bold 24px)
  - Date range (Inter Regular 14px)
  - Impact metrics (Inter Medium 18px)
  - Insight (Playfair italic 16px)
- Progress indicator tracks position

### 4. Interlude (Blog)
- **Grid:** grid-cols-2 gap-8 desktop, single-column mobile
- **Categories:** Tempo-based (♩ = 140 Fast/♩ = 60 Adagio)
- **Card Structure:**
  - Image: aspect-ratio 16/9
  - Category badge (tempo indicator)
  - Title (Playfair 28px)
  - Excerpt (Inter 16px, 3-line clamp)
  - Metadata (read time, date)
- **Post Layout:** max-w-3xl centered, space-y-6 paragraphs
- Pull quotes: border-l-4, Playfair italic

### 5. Encore (Gallery)
- Masonry grid (CSS Grid auto-flow dense)
- Mix 1:1, 16:9, 4:5 aspect ratios
- **Desktop:** grid-cols-3 gap-6 | **Tablet:** grid-cols-2 | **Mobile:** Single column
- Load: Stagger 100ms increments
- **Spotify:** Custom overlay, key indicator, mood description (Playfair 20px)
- **Side Quests:** High C key easter egg → full-screen modal carousel (skiing, climbing, travel)
- Hover captions: Blur backdrop

### 6. Coda (Contact)
- lg:grid-cols-2 split
- **Form:** space-y-6, bottom-border inputs only, labels Inter Medium 14px
  - Textarea: min-h-48
  - Submit: Triggers chord animation → notes converge → success message fade/scale
- **Right:** Social icons grid, tagline "Let's make something worth hearing." (Playfair 36px)
- Easter egg: "improvise" → jazz riff visual

## Components

### Navigation
- Fixed header, backdrop-blur-md
- Logo left, links right
- Mobile: Hamburger → full-screen overlay
- Active: Subtle underline animation

### Buttons
- Primary: rounded-lg, px-8 py-4, hover scale(1.05) 200ms
- Secondary: Outlined variant
- Icon: h-12 w-12 square, centered

### Cards
- Padding: p-6 to p-8
- Hover: shadow-lg transition
- Rounded: rounded-xl
- Border: 1px subtle or none

### Modals
- Full-screen backdrop blur
- Content: Centered max-width
- Close: Top-right fixed
- Entry: Scale 0.95→1.0 + fade, 400ms

### Piano Key
- White: Rectangular, subtle gradient
- Black: Narrower, offset, elevated z-index
- Hover: Glow + lift
- Active: Press down
- Emit faint note on interaction

## Animation Rules

**Timing:** 200ms, 300ms, 500ms durations (musical)
**Easing:** ease-out (entrances), ease-in-out (transforms)
**Stagger:** 50-100ms delays

**Key Animations:**
1. Page transitions: Fade + slide (300ms)
2. Card hovers: Lift + shadow (200ms)
3. Piano keys: Press (150ms snap)
4. Scroll reveals: Fade up (500ms stagger)
5. Modal entry: Scale + fade (400ms)

**Scroll-Based:**
- Hero parallax: 0.5x scroll speed
- Elements fade-in on scroll into view
- Timeline progress tracks scroll

## Dark/Light Mode
- Toggle: "Daylight Sonata" ↔ "Nocturne"
- Icon: Sun/Moon with rotation transition
- Switch: 300ms simultaneous element transition
- Position: Header top-right

## Image Specifications
- **Hero:** High-quality grand piano (horizontal), soft focus, center position, gradient overlay
- **About:** Headshot 200px circular crop
- **Timeline:** Company logos 48px height
- **Gallery:** Personal photos (varied ratios), high quality
- **Blog:** Featured 16:9, abstract musical graphics

## Accessibility
- Semantic HTML throughout
- ARIA labels on interactive elements
- Keyboard navigation for piano keys
- Focus states visible (outline with brand color)
- Alt text on all images
- Color contrast WCAG AA minimum
- Skip navigation link

---
**Implementation Note:** All measurements use Tailwind CSS utilities. Custom piano component requires JavaScript for interaction/sound. Prioritize performance with lazy-loading images and optimized animations.