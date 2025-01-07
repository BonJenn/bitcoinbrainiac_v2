/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        foreground: "var(--foreground)",
      },
      backgroundImage: {
        'gradient-background': 'var(--background)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

