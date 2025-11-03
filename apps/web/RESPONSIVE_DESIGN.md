# CosmoStream Responsive Design Guide

## Overview

This guide documents the responsive design system for CosmoStream, covering breakpoints, patterns, components, and best practices to ensure an optimal experience across all device sizes.

## Table of Contents

1. [Breakpoint System](#breakpoint-system)
2. [Design Principles](#design-principles)
3. [Responsive Patterns](#responsive-patterns)
4. [Component Library](#component-library)
5. [Touch-Friendly Design](#touch-friendly-design)
6. [Typography](#typography)
7. [Spacing & Layout](#spacing--layout)
8. [Testing Guidelines](#testing-guidelines)
9. [Common Patterns](#common-patterns)

---

## Breakpoint System

### Tailwind Breakpoints

CosmoStream uses the following breakpoints (defined in `tailwind.config.js`):

```javascript
{
  'xs': '480px',   // Small phones in landscape, large phones in portrait
  'sm': '640px',   // Tablets in portrait
  'md': '768px',   // Tablets in landscape, small laptops
  'lg': '1024px',  // Laptops, desktops
  'xl': '1280px',  // Large desktops
  '2xl': '1536px', // Extra large desktops
  '3xl': '1920px'  // 4K monitors and ultra-wide displays
}
```

### Target Devices

| Breakpoint | Device Types | Typical Width |
|------------|--------------|---------------|
| Base (< 480px) | Small phones (portrait) | 320px - 479px |
| xs | Large phones (portrait/landscape) | 480px - 639px |
| sm | Tablets (portrait) | 640px - 767px |
| md | Tablets (landscape), small laptops | 768px - 1023px |
| lg | Laptops, desktops | 1024px - 1279px |
| xl | Large desktops | 1280px - 1535px |
| 2xl | Extra large desktops | 1536px - 1919px |
| 3xl | 4K monitors, ultra-wide | 1920px+ |

---

## Design Principles

### 1. Mobile-First Approach

Always start with mobile design and progressively enhance for larger screens:

```jsx
// ✅ Good: Mobile-first
<div className="text-sm sm:text-base lg:text-lg">

// ❌ Bad: Desktop-first
<div className="text-lg sm:text-base text-sm">
```

### 2. Content Priority

Ensure critical content is accessible on all screen sizes. Use conditional visibility sparingly:

```jsx
// ✅ Good: Keep critical content visible
<button className="px-3 xs:px-4">
  <span>Save</span>
</button>

// ⚠️ Use with caution: Hiding content
<span className="hidden md:inline">Advanced Options</span>
```

### 3. Touch-First Design

All interactive elements must meet minimum touch target sizes (44px × 44px):

```jsx
<button className="min-h-touch min-w-touch px-4 py-2">
  Click Me
</button>
```

### 4. Performance Optimization

Optimize images and assets for different screen sizes:

```jsx
<img
  srcSet="image-320w.jpg 320w, image-640w.jpg 640w, image-1280w.jpg 1280w"
  sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
  alt="Description"
/>
```

---

## Responsive Patterns

### Grid Layouts

Use responsive grid patterns that adapt to screen size:

```jsx
// Basic responsive grid (1 → 2 → 3 → 4 columns)
<div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
  {/* Grid items */}
</div>

// Metrics cards (1 → 2 → 3 → 5 columns)
<div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 xs:gap-4">
  {/* Metric cards */}
</div>
```

### Flex Layouts

Stack on mobile, horizontal on larger screens:

```jsx
// Column on mobile, row on tablet+
<div className="flex flex-col sm:flex-row gap-4">
  <div className="flex-1">Content</div>
  <aside className="sm:w-64">Sidebar</aside>
</div>
```

### Container Patterns

Use responsive container utilities:

```jsx
// Standard container with responsive padding
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// Wide container for large screens
<div className="container-wide">
  {/* Full-width content */}
</div>

// Narrow container for reading
<div className="container-narrow">
  {/* Article content */}
</div>
```

---

## Component Library

### Buttons

All buttons include touch-friendly minimum sizes and responsive padding:

```jsx
// Primary button (responsive sizing)
<button className="btn-primary">
  Save Changes
</button>

// Button with responsive text
<button className="px-3 xs:px-4 py-2 min-h-touch">
  <span className="hidden xs:inline">Submit Form</span>
  <span className="xs:hidden">Submit</span>
</button>

// Icon button with proper touch target
<button className="min-h-touch min-w-touch p-2" aria-label="Close">
  <svg className="w-5 h-5">...</svg>
</button>
```

### Cards

Responsive card components with adaptive padding:

```jsx
// Standard card
<div className="card">
  {/* Content with responsive padding (p-4 sm:p-6) */}
</div>

// Compact card
<div className="card-compact">
  {/* Content with tighter padding (p-3 sm:p-4) */}
</div>

// Spacious card
<div className="card-spacious">
  {/* Content with generous padding (p-6 sm:p-8 lg:p-10) */}
</div>
```

### Form Inputs

Forms with touch-friendly inputs:

```jsx
// Text input
<input
  type="text"
  className="input-field"
  // Includes: text-base sm:text-sm min-h-touch
/>

// Select dropdown
<select className="w-full px-3 sm:px-4 py-2.5 min-h-touch text-sm sm:text-base">
  <option>Option 1</option>
</select>
```

### Navigation

Responsive navigation with mobile menu:

```jsx
// Desktop navigation (hidden on mobile)
<nav className="hidden md:flex items-center gap-6">
  {/* Nav links */}
</nav>

// Mobile menu toggle (visible on mobile only)
<button className="md:hidden min-h-touch min-w-touch">
  <svg className="w-6 h-6">...</svg>
</button>
```

---

## Touch-Friendly Design

### Minimum Touch Targets

All interactive elements must meet WCAG 2.1 Level AAA standards (44px × 44px):

```jsx
// Using min-h-touch and min-w-touch utilities
<button className="min-h-touch px-4">Button</button>

// Icon buttons need both dimensions
<button className="min-h-touch min-w-touch" aria-label="Menu">
  <svg className="w-5 h-5">...</svg>
</button>
```

### Touch Target Classes

Available utility classes:

- `min-h-touch`: 44px minimum height
- `min-w-touch`: 44px minimum width
- `min-h-touch-lg`: 48px minimum height (for primary actions)

### Spacing Between Touch Targets

Maintain adequate spacing (minimum 8px) between touch targets:

```jsx
<div className="flex gap-2 xs:gap-3">
  <button className="min-h-touch px-4">Action 1</button>
  <button className="min-h-touch px-4">Action 2</button>
</div>
```

### Active States

Provide clear feedback on touch devices:

```jsx
<button className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600">
  {/* active: state provides feedback on touch */}
</button>
```

---

## Typography

### Fluid Typography

Use fluid typography that scales smoothly across breakpoints:

```jsx
// Fluid text sizes (using clamp)
<h1 className="text-fluid-6xl">Main Heading</h1>
<p className="text-fluid-base">Body text</p>

// Responsive text sizes (stepped)
<h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl">
  Responsive Heading
</h1>
```

### Available Fluid Typography Classes

```css
text-fluid-xs    /* clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem) */
text-fluid-sm    /* clamp(0.875rem, 0.825rem + 0.25vw, 1rem) */
text-fluid-base  /* clamp(1rem, 0.95rem + 0.25vw, 1.125rem) */
text-fluid-lg    /* clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem) */
text-fluid-xl    /* clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem) */
text-fluid-2xl   /* clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem) */
text-fluid-3xl   /* clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem) */
text-fluid-4xl   /* clamp(2.25rem, 1.95rem + 1.5vw, 3rem) */
text-fluid-5xl   /* clamp(3rem, 2.55rem + 2.25vw, 3.75rem) */
text-fluid-6xl   /* clamp(3.75rem, 3.15rem + 3vw, 4.5rem) */
```

### Line Length

Optimize line length for readability:

```jsx
// Narrow container for article content
<article className="max-w-3xl mx-auto">
  <p className="leading-relaxed">
    Article content with optimal line length for reading...
  </p>
</article>
```

---

## Spacing & Layout

### Responsive Section Padding

Use utility classes for consistent section spacing:

```jsx
// Standard section padding
<section className="section-padding">
  {/* py-12 sm:py-16 lg:py-20 3xl:py-24 */}
</section>

// Compact section
<section className="section-padding-sm">
  {/* py-8 sm:py-12 lg:py-16 */}
</section>

// Large section
<section className="section-padding-lg">
  {/* py-16 sm:py-20 lg:py-28 3xl:py-32 */}
</section>
```

### Responsive Gaps

Use responsive gap values for spacing:

```jsx
// Responsive gap in grids/flex
<div className="flex gap-2 xs:gap-3 sm:gap-4 lg:gap-6">
  {/* Elements with increasing gaps */}
</div>
```

### Safe Area Insets

Support for devices with notches and rounded corners:

```jsx
// Apply safe area insets
<header className="safe-area-top">
  {/* Respects top safe area (notch, status bar) */}
</header>

<footer className="safe-area-bottom">
  {/* Respects bottom safe area (home indicator) */}
</footer>

// Full safe area padding
<div className="safe-area-inset">
  {/* Padding on all sides */}
</div>
```

---

## Testing Guidelines

### Device Testing Matrix

Test on these screen sizes:

| Category | Sizes to Test | Example Devices |
|----------|---------------|-----------------|
| Small phones | 320px, 375px | iPhone SE, small Android |
| Large phones | 414px, 430px | iPhone 14 Pro Max, Galaxy S23 |
| Tablets (portrait) | 768px, 834px | iPad, iPad Pro 11" |
| Tablets (landscape) | 1024px, 1112px | iPad landscape |
| Laptops | 1280px, 1440px | MacBook, standard laptops |
| Desktops | 1920px, 2560px | Full HD, 2K monitors |
| Large displays | 3440px, 3840px | Ultra-wide, 4K monitors |

### Browser Testing

Test on:
- Chrome (mobile & desktop)
- Safari (iOS & macOS)
- Firefox
- Edge
- Samsung Internet (mobile)

### Orientation Testing

Always test both orientations on mobile devices:

```jsx
// Ensure layouts work in both orientations
@media (orientation: landscape) {
  /* Landscape-specific styles if needed */
}
```

### Accessibility Testing

- **Zoom testing**: Test at 200% browser zoom
- **Touch target verification**: Use browser dev tools to verify 44px minimum
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible
- **Screen reader testing**: Test with VoiceOver (iOS/macOS) or TalkBack (Android)

### Performance Testing

- **Lighthouse scores**: Aim for 90+ on mobile
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1

---

## Common Patterns

### Responsive Images

```jsx
// Responsive aspect ratio
<div className="aspect-video w-full xs:w-32 sm:w-40 md:w-48">
  <img src="..." alt="..." className="w-full h-full object-cover" />
</div>

// Responsive image sizing
<img
  className="w-full xs:w-1/2 sm:w-1/3 lg:w-1/4"
  src="..."
  alt="..."
/>
```

### Responsive Tables

```jsx
// Mobile: Stack vertically
// Desktop: Traditional table

<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* Table content */}
  </table>
</div>

// Or use card layout on mobile
<div className="block lg:hidden">
  {/* Card layout for mobile */}
</div>
<div className="hidden lg:block">
  <table>{/* Traditional table */}</table>
</div>
```

### Responsive Modals

```jsx
// Full-screen on mobile, centered on desktop
<div className="fixed inset-0 lg:flex lg:items-center lg:justify-center">
  <div className="bg-gray-900 w-full h-full lg:w-auto lg:h-auto lg:max-w-2xl lg:rounded-xl p-4 sm:p-6">
    {/* Modal content */}
  </div>
</div>
```

### Sticky Elements

```jsx
// Sticky header with safe area support
<header className="sticky top-0 z-30 safe-area-top">
  {/* Sticky navigation */}
</header>

// Adjust sticky positioning for different screens
<div className="sticky top-16 lg:top-20">
  {/* Content that sticks below header */}
</div>
```

### Conditional Rendering

```jsx
// Show different components based on screen size
<div className="mobile-only">
  <MobileComponent />
</div>

<div className="tablet-up">
  <DesktopComponent />
</div>

<div className="desktop-only">
  <DesktopOnlyFeature />
</div>
```

---

## Best Practices Checklist

### Before Committing Code

- [ ] Tested on mobile (320px - 480px)
- [ ] Tested on tablet (768px - 1024px)
- [ ] Tested on desktop (1280px+)
- [ ] All touch targets are 44px minimum
- [ ] Text is readable at all sizes
- [ ] No horizontal scrolling on small screens
- [ ] Images have appropriate aspect ratios
- [ ] Buttons have clear active states
- [ ] Forms are usable with touch keyboards
- [ ] Navigation works on all screen sizes
- [ ] Content hierarchy is maintained
- [ ] Performance is acceptable on mobile

### Code Review Checklist

- [ ] Uses mobile-first approach
- [ ] Consistent use of breakpoints
- [ ] Proper use of responsive utilities
- [ ] Accessible to keyboard and screen readers
- [ ] No hardcoded pixel values for breakpoints
- [ ] Semantic HTML elements used
- [ ] ARIA labels where appropriate
- [ ] Follows established patterns

---

## Resources

### Internal Resources

- `tailwind.config.js` - Breakpoint and utility configuration
- `globals.css` - Responsive utility classes and components
- Component examples in `/src/components`

### External Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [WCAG 2.1 Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google Web Fundamentals - Responsive Design](https://developers.google.com/web/fundamentals/design-and-ux/responsive)

---

## Getting Help

If you encounter responsive design issues:

1. Check this documentation first
2. Review similar components in the codebase
3. Test in browser dev tools with device emulation
4. Ask in the team's design/frontend channel
5. Consider creating a new responsive pattern if needed

---

**Last Updated**: 2025-10-19

**Maintained By**: CosmoStream Frontend Team
