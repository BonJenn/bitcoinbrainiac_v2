/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-gradient-to-r',
    'from-white',
    'to-orange-100',
    'text-gray-900',
    'text-4xl',
    'font-bold',
    'text-center',
    'mb-12',
  ],
  theme: {
    extend: {
      // Your existing theme extensions
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 