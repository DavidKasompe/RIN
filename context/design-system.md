# RIN Design System & UI Principles

## Core Aesthetic: "Okara" Style
The RIN platform utilizes a design language referred to internally as the "Okara" style. It emphasizes:
- **Clean, Modern, Muted:** A warm, inviting, and professional aesthetic, moving away from stark corporate SaaS looks.
- **Color Palette:**
  - Backgrounds: Beige/Cream (`#FAF3EC`, `#FBF7F5`)
  - Primary Accents: Deep Burgundy/Crimson (`#800532`, `#aa6b76`)
  - Text: Dark Espresso (`#230603`)
- **Typography:** Inter, "Helvetica Neue", Arial, sans-serif. Heavy use of varied font weights (e.g., `fontWeight: 800` for logos, `500` for body).
- **Glassmorphism:** Strategic use of blurred backgrounds and transparency (e.g., `backdropFilter: 'blur(12px)'`) for sticky headers, dropdowns, and input areas to create depth without clutter.
- **Softness:** Fully rounded corners on buttons and chat bubbles (`borderRadius: 9999` or `24px`).

## Component Guidelines

### Chat Interface (`/dashboard/page.tsx`)
- **Layout:** Centered chat content, single large heading when empty.
- **Input Area:** Beige outer wrapper with a white inner card, crimson drop-shadow on focus. ArrowUp icon for the send button.
- **Bubbles:** 
  - User: Solid burgundy background (`#800532`), white text, fully rounded.
  - AI: Handled by Thesys C1 component. No avatar icons.
- **Suggestions:** 4-column layout for chips. Chips disappear when the thread is active. Smooth fade-and-slide animations.

### Navigation & Layouts
- **Sidebar:** Minimalist. Only the "RIN" wordmark logo in the header (no collapse icons).
- **Headers:** Often use sticky positioning with glassmorphism effects to keep context visible while scrolling.

### User Experience Principles
- **Smooth Animations:** Elements should fade, slide, or seamlessly transition state (avoid harsh snaps).
- **Human-Centered Messaging:** Copy should feel supportive, not purely clinical. (e.g., Footer tagline: *"RIN supports your judgment — always verify with school records."*)
- **Native AI Integration:** Lean on native UI components provided by AI SDKs (like C1's thinking indicator) rather than building custom spinners, ensuring a polished, integrated feel.
