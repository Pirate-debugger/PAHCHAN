/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SSB / MHA Calm Sovereign Enterprise Palette
        brand: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#061220'
        },
        surface: {
          canvas: '#0f172a',
          card: '#ffffff',
          subtle: '#f8fafc',
          border: '#e2e8f0',
          hover: '#f1f5f9'
        },
        risk: {
          low: '#059669',
          lowBg: '#ecfdf5',
          lowBorder: '#a7f3d0',
          review: '#d97706',
          reviewBg: '#fffbeb',
          reviewBorder: '#fde68a',
          high: '#dc2626',
          highBg: '#fef2f2',
          highBorder: '#fecaca',
          critical: '#991b1b',
          criticalBg: '#fdf2f8',
          criticalBorder: '#fbcfe8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
