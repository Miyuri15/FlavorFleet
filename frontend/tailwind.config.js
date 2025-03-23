/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode using the 'class' strategy
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Adjust this to match your project structure
  ],
  theme: {
    extend: {
      colors: {
        // Light mode colors (custom palette)
        background: '#E0F3FF', // Light background
        'background-light': '#fafafa', // Same as background for consistency
        'primary-light': '#e4e5f1', // Soft primary color (light purple-blue)
        'secondary-light': '#d2d3db', // Secondary color (cool gray)
        'accent-light': '#9394a5', // A bit darker accent (grayish purple)
        'text-light': '#484b6a', // Darker text for light mode (muted slate blue)

        // New, more vibrant colors:
        'highlight-light': '#ffcc00', // Yellow accent for highlights (brighter)
        'button-light': '#007BFF', // Primary button color (vibrant blue)

        // Dark mode colors (can be customized further if needed)
        'background-dark': '#121212', // Dark mode background
        'text-dark': '#ffffff', // Dark mode text color
        'primary-dark': '#1a202c', // Darker primary color for dark mode
        'secondary-dark': '#2d3748', // Darker secondary color for dark mode
        'accent-dark': '#4a5568', // Accent for dark mode (muted gray)
      },
    },
  },
  plugins: [],
  };
