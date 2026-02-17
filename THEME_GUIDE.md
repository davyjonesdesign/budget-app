# Theme & Color Customization Guide

## Dark Mode is Now Live! 🌙

Your app now supports:
- ☀️ **Light mode**
- 🌙 **Dark mode**  
- 💻 **System preference** (auto-switches based on device settings)

Users can toggle between modes using the theme switcher in the dashboard header.

## How It Works

### 1. Theme Provider
The app uses a React Context (`ThemeProvider`) to manage the theme state:
- Saves preference to `localStorage`
- Listens to system theme changes
- Applies the correct CSS classes

### 2. Tailwind Dark Mode Classes
Every component uses Tailwind's `dark:` prefix:

```jsx
// Light mode: white background, dark text
// Dark mode: dark background, light text
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

## Customizing Colors

### Change Primary Brand Color

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        light: '#2563eb',  // Light mode blue
        DEFAULT: '#2563eb',
        dark: '#3b82f6',   // Dark mode lighter blue
      },
      // Add custom colors
      brand: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        500: '#0ea5e9',
        900: '#0c4a6e',
      },
    },
  },
}
```

Then use in components:
```jsx
<button className="bg-brand-500 dark:bg-brand-400">
  Click me
</button>
```

### Common Color Patterns

**Backgrounds:**
```jsx
// Page background
bg-gray-50 dark:bg-gray-900

// Card/panel background
bg-white dark:bg-gray-800

// Secondary background
bg-gray-100 dark:bg-gray-700
```

**Text:**
```jsx
// Primary text
text-gray-900 dark:text-white

// Secondary text
text-gray-600 dark:text-gray-400

// Muted text
text-gray-500 dark:text-gray-500
```

**Borders:**
```jsx
border-gray-200 dark:border-gray-700
```

**Shadows:**
```jsx
shadow-sm dark:shadow-none
shadow-lg dark:shadow-2xl
```

## Changing the Color Scheme

### Option 1: Use Tailwind's Built-in Colors

```javascript
// tailwind.config.js
colors: {
  primary: colors.purple,  // Use purple instead of blue
  success: colors.emerald,
  warning: colors.amber,
  danger: colors.rose,
}
```

### Option 2: Create Custom Palette

Generate a palette at [uicolors.app](https://uicolors.app), then:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',  // Main color
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      },
    },
  },
}
```

## Updating Existing Components

To add dark mode to any component, follow this pattern:

**Before:**
```jsx
<div className="bg-white border-gray-200 text-gray-900">
  <h1 className="text-gray-900">Hello</h1>
  <p className="text-gray-600">Description</p>
</div>
```

**After:**
```jsx
<div className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
  <h1 className="text-gray-900 dark:text-white">Hello</h1>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

## Components Already Updated

✅ **Card** - Full dark mode support
✅ **Dashboard** - Theme toggle + dark styling
✅ **Root Layout** - ThemeProvider wrapper
✅ **Global CSS** - Dark mode variables

## Components to Update (When You Get to Them)

When building calendar views or other new features, remember to add dark mode:

```jsx
// Month view calendar
<div className="bg-white dark:bg-gray-800">
  <div className="border-gray-200 dark:border-gray-700">
    {/* Calendar cells */}
  </div>
</div>

// Transaction items
<div className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
  {/* Transaction details */}
</div>
```

## Testing Dark Mode

1. **Manual toggle**: Use the theme switcher in dashboard
2. **System preference**: 
   - Mac: System Preferences → General → Appearance
   - Windows: Settings → Personalization → Colors
   - iOS: Settings → Display & Brightness
   - Android: Settings → Display → Dark theme

3. **Browser DevTools**:
   - Chrome: DevTools → ⋮ → More tools → Rendering → Emulate CSS media: `prefers-color-scheme: dark`

## Pro Tips

1. **Always test both modes** - What looks good in light might not work in dark
2. **Use semantic colors** - `bg-white dark:bg-gray-800` not specific hex codes
3. **Reduce shadow in dark mode** - Shadows are less visible on dark backgrounds
4. **Increase contrast** - Dark mode needs higher contrast for readability
5. **Test on real devices** - OLED displays show true black differently

## Color Accessibility

Make sure your colors have good contrast:
- Light mode: Dark text on light background (4.5:1 ratio minimum)
- Dark mode: Light text on dark background (4.5:1 ratio minimum)

Test with: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Example: Custom Pink Theme

Want a pink budget app? Here's how:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        light: '#ec4899',  // Pink in light mode
        DEFAULT: '#ec4899',
        dark: '#f472b6',   // Lighter pink in dark mode
      },
    },
  },
}
```

Then update the gradient card in dashboard:
```jsx
<Card className="bg-gradient-to-br from-pink-600 to-rose-600 text-white">
```

## Need Help?

Common issues:
- **Dark mode not working**: Check `suppressHydrationWarning` is on `<html>` tag
- **Flashing on load**: ThemeProvider needs to be in root layout
- **Theme not persisting**: Check localStorage is enabled in browser
- **System theme not detected**: Make sure `darkMode: 'class'` in tailwind.config.js

That's it! Your app now has professional dark mode support that respects user preferences. 🎨
