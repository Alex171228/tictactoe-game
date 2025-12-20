# Design Guidelines: Крестики-Нолики с Telegram

## Design Approach
**Approach**: Custom aesthetic inspired by the existing implementation - elegant pastel gaming experience with playful personality.

**Design Principles**:
- Warmth and approachability through soft pastels and friendly animations
- Elegance through serif typography for headings
- Personality through animated cat mascot emotional system
- Mobile-first with seamless desktop adaptation

## Typography

**Font Families**:
- Headings: 'Cormorant Garamond', Georgia, serif (elegant, soft)
- Body/UI: 'Nunito', sans-serif (friendly, rounded)
- Game Marks (X/O): 'Cormorant Garamond' (dramatic, elegant)

**Type Scale**:
- H1: 2.5rem desktop, 1.8rem mobile
- H2: 1.25rem desktop, 1.1rem mobile
- Body: 0.95rem desktop, 0.85rem mobile
- Use clamp() for fluid responsive scaling

## Layout System

**Spacing**: Use Tailwind units of 2, 4, 8, 12, 16, 20 for consistent rhythm
- Card padding: p-5 (mobile) to p-6 (desktop)
- Section gaps: gap-4 (mobile) to gap-8 (desktop)
- Component margins: m-2, m-4 for tight spacing

**Container Strategy**:
- Mobile: Full-width with p-5 padding
- Desktop: max-w-[900px] centered container
- Two-column layout on desktop (game panel + info panel)

## Component Library

### Authentication Screen
- Centered card on pastel gradient background
- Telegram widget integration with native styling
- Single-column centered layout
- Soft welcome messaging

### Game Board
- 3x3 grid with equal aspect-ratio cells
- Rounded corners (16-20px border radius)
- Responsive sizing: max 300px desktop, scales down mobile
- Hover states: lift effect (translateY -2px) + enhanced shadow

### Status & Controls
- Horizontal flex layout with space-between
- Turn indicator with highlighted current player
- Secondary button style for "New Game"

### Score Display
- Three equal-width cards in horizontal row
- Uppercase labels with large numeric values
- Subtle background differentiation

### Message Cards
- Cat emoji container (2.5-3.5rem font-size)
- Centered text layout
- Gradient backgrounds for special states (win = success gradient)

### Buttons
- Primary: Gradient background (pink accent)
- Secondary: Outlined with border, transparent background
- Border radius: 12px
- Padding: 0.7rem × 1.4rem
- Hover: translateY(-2px) + shadow enhancement

## Color Palette
Reference existing CSS variables - pastel pink/beige with soft green accents for success states. Do not specify explicit colors; maintain the existing warm, approachable aesthetic.

## Animations

**Cat Mascot Animations**:
- Happy: Bounce entry + continuous wiggle
- Sad: Simple fade-up appearance
- Draw: Tilt animation
- Duration: 0.5-0.6s for entries, 2s for loops

**Game Interactions**:
- Cell click: "Pop" scale animation (0.8 → 1.1 → 1.0)
- Button hover: Lift + shadow enhancement
- Smooth 0.25s transitions for all interactive elements

**Restraint**: Animations enhance playfulness without distraction. No excessive motion.

## Visual Hierarchy

1. **Game board** - Primary focus, largest visual element
2. **Turn indicator** - Secondary, always visible status
3. **Results/Messages** - Prominent when active, with cat personality
4. **Statistics** - Supporting information, compact display
5. **Controls** - Available but not dominant

## Responsive Behavior

**Mobile (< 640px)**:
- Single column stacked layout
- Board scales to fit width (max 280px)
- Full-width cards
- Reduced spacing

**Desktop (≥ 640px)**:
- Two-column side-by-side (game panel | info panel)
- Fixed max-widths for optimal proportions
- Increased padding and gaps

**Landscape Mobile (height < 600px)**:
- Compressed vertical spacing
- Hide subtitle
- Smaller board (180px max)
- Reduced padding

## Key UX Patterns

- **Session Persistence**: LocalStorage maintains login state
- **Emotional Feedback**: Cat mascot provides personality-driven responses to game outcomes
- **Progressive Disclosure**: Auth screen → Game screen transition
- **Instant Feedback**: Animations confirm all user actions
- **Clear State Communication**: Turn indicator, disabled states, game-over messaging

## Images
No hero images required. This is a game application focused on interactive gameplay. The visual interest comes from the pastel gradient backgrounds, card layouts, and animated cat mascot emoticons (text-based, not images).