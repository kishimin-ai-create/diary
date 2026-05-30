---
name: "Frontend Display"
description: "Browser support, responsive layout, localization, images, dark mode, and delivery-performance guidance."
---

# Frontend Display

Use this skill when defining browser support, responsive rules, image handling, dark mode, i18n, or frontend delivery performance.

## Browser Support Policy

### Core Browser Set

Treat these as the default modern support baseline:

- Google Chrome (desktop / Android)
- Apple Safari (macOS / iOS)
- Microsoft Edge (desktop)
- Mozilla Firefox (desktop / Android)

### Recommendations

- Keep the supported browser list **as small as practical**.
- Prefer browsers and OS versions that still receive security updates.
- Chrome should almost always be in scope.
- On iOS, Safari must be in scope.
- Consider excluding low-share browsers when business requirements allow it.

### Version Policy

- For evergreen desktop browsers, support the **latest version and one version back**.
- For Firefox, use the latest or the ESR line when Firefox support is required.
- On mobile, define support through the **supported OS/device fleet**, then inherit browser support from that.

## Responsive Design

Responsive work usually includes:

- layout adjustments for readability
- touch-friendly button and link placement
- device-appropriate font sizing
- responsive image delivery
- CSS/JavaScript size optimization

## Breakpoint Strategy

| Technique | Best for | Recommendation |
|---|---|---|
| **Media queries** | Whole-page layout shifts | Use for global breakpoints |
| **Container queries** | Component-level adaptation | Add after page-level layout is stable |

### Practical Rules

- Use **media queries** for page shells, navigation, spacing, and overall layout.
- Use **container queries** for cards, widgets, and components inside flexible layouts.
- Keep the number of breakpoints small.
- Avoid deep nesting of container queries.

## Tailwind CSS Guidance

If you use Tailwind CSS:

- Prefer the default responsive prefixes such as `sm`, `md`, and `lg` unless requirements force custom values.
- Do not radically redefine existing prefixes.
- If you add custom breakpoints, name them clearly.
- Use unprefixed classes as the **mobile default**.

```html
<div class="text-center sm:text-left"></div>
```

## Mobile-First Policy

- Default to **mobile-first CSS**, even for internal systems.
- For information-dense business screens, first try to reduce what appears on mobile.
- If one layout cannot work well across devices, consider:
  1. conditional hiding / alternate markup inside one page
  2. a separate mobile-specific page
  3. a real mobile app for mobile-native workflows

## Resolution and Viewport

### Resolution Rules

- Define one **target logical resolution** up front for design and QA.
- A common desktop baseline is around **1280x720 logical resolution**.
- Do not write vague requirements such as "1366x768 and above" without a concrete testing target.
- For mobile, explicitly decide whether portrait-only is acceptable.

### Browser Window and Zoom

- Assume full-screen browser usage by default.
- Treat 100% zoom as the design baseline.
- If the viewport becomes smaller than the target baseline, preserve usability with scrolling rather than breaking controls.

### Viewport Meta Tag

Use the standard responsive viewport.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

Do not lock zoom ranges unless there is an exceptional reason; it hurts UX and accessibility.

## Internationalization (i18n)

- Add an i18n mechanism even if the first release is single-language.
- Externalize UI text early; retrofitting later is expensive.
- Prefer the browser language as the default language source unless you have a strong reason not to.

### Useful Libraries

- React: `react-intl`, `react-i18next`
- Vue: `vue-i18n`, `unplugin-vue-i18n`
- Angular: `@ngx-translate/core`

## Image Strategy

| Asset type | Recommended format |
|---|---|
| Brand assets, icons, logos | **SVG** |
| Photos, product shots, complex banners | **AVIF** or **WebP** |
| Diagrams, screenshots, transparent UI graphics | **AVIF** or **WebP** |
| Animated images | Avoid if possible; prefer CSS, JS, or video |

### Image Best Practices

- Use `<picture>` for modern-format delivery with fallback.
- Use `srcset` and `sizes` for responsive images.
- Optimize originals before shipping them.
- Use `loading="lazy"` for below-the-fold images.
- Write meaningful `alt` text for informative images.
- Use `alt=""` for decorative images.

## OGP and Favicon

### OGP

- OGP matters mainly for public, shareable, consumer-facing pages.
- OGP is usually unnecessary for intranet apps or private SaaS pages behind authentication.

```html
<meta property="og:title" content="Page title" />
<meta property="og:description" content="Page description" />
<meta property="og:image" content="https://example.com/og-image.png" />
<meta property="og:url" content="https://example.com/page" />
```

### Favicon Set

Recommended minimum set:

- `icon.svg`
- `apple-touch-icon.png`
- `icon-192.png`
- `icon-512.png`
- `manifest.webmanifest`
- `favicon.ico` only for legacy fallback

Prefer **SVG first**, with PNG support files where platforms require them.

## Dark Mode

### Recommended Model

Use a **hybrid strategy**:

- default to the user's OS preference
- also provide a manual theme toggle
- persist the user's explicit choice

### Persistence

- Use **localStorage** by default when cross-device sync is not required.
- Fallback to in-memory state if storage is unavailable.
- Use server-side persistence only when the setting must follow the user across browsers, devices, or domains.

### Dark Mode QA

Check all of these explicitly:

- text contrast
- icon and illustration visibility
- transparent image backgrounds
- focus states
- readability in both themes

## Delivery Performance

### Minify and Source Maps

- Minify production assets to reduce transfer size and hide incidental development details.
- Keep source maps for local/development debugging as needed.
- Avoid public production source maps unless your security and operations model explicitly allows them.
- If error-reporting tooling needs source maps, prefer hidden generation and remove public exposure after upload.

### Environment Guidance

| Environment | Minify | Source maps |
|---|---|---|
| Local | No | Yes |
| Development | Yes | Yes |
| Staging | Yes | Usually no, unless temporarily needed for debugging |
| Production | Yes | No public source maps by default |

## Accessibility Reminders

Accessibility is part of display design, not an afterthought.

- Preserve readable font sizes.
- Keep touch targets large enough.
- Maintain color contrast in both light and dark themes.
- Do not block zoom without a compelling reason.
- Test responsive layouts with keyboard and assistive technology flows.
