// Design System - Component patterns
// Uses tokens to build reusable component classes
// Change colors/spacing in tokens, not here

import { tokens } from './design-tokens'

export const ds = {
  // Backgrounds
  bg: {
    page: 'bg-gray-50 dark:bg-gray-900',
    card: 'bg-white dark:bg-gray-800',
    surface: 'bg-gray-100 dark:bg-gray-700',
    header: 'bg-white dark:bg-gray-800',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800',
    input: 'bg-white dark:bg-gray-700',
    hover: 'hover:bg-gray-100 dark:hover:bg-gray-700'
  },

  // Text colors
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-400',
    tertiary: 'text-gray-500 dark:text-gray-500',
    muted: 'text-gray-400 dark:text-gray-600',
    label: 'text-gray-700 dark:text-gray-300',
    link: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
  },

  // Borders
  border: {
    default: 'border-gray-300 dark:border-gray-600',
    light: 'border-gray-200 dark:border-gray-700',
    strong: 'border-gray-400 dark:border-gray-500'
  },

  // Inputs
  input: {
    base: 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500',
    select: 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
    textarea: 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500',
    checkbox: 'w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
  },

  // Buttons - Now with proper contrast for light/dark modes
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600',
    danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white',
    success: 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white',
    ghost: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
    // Add these:
    light: 'bg-white hover:bg-gray-50 dark:hover:bg-gray-100 text-blue-600',
    darkBlue: 'bg-blue-800 hover:bg-blue-900 dark:bg-blue-900 dark:hover:bg-blue-950 text-white'
  },

// Add to the card section:
  card: {
    base: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4',
    hover: 'cursor-pointer hover:shadow-md transition-shadow',
    gradient: 'bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white rounded-lg shadow-sm border-0 p-6'
  },

  // Alerts
  alert: {
    error: 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg',
    success: 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg',
    info: 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-lg'
  },

  // Dividers
  divider: 'border-t border-gray-200 dark:border-gray-700',

  // Shadows
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  },

  // Border radius
  radius: {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full'
  }
}

// Helper to combine classes
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}

// Export tokens for direct access when needed
export { tokens }
