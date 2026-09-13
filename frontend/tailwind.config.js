/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sovereign Government & Security Palette
        brand: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#627d98',
          500: '#486581',
          600: '#334e68',
          700: '#243b53',
          800: '#162b42',
          900: '#0c1b2e',
          950: '#060f1c'
        },
        sovereign: {
          saffron: '#f59e0b',
          saffronMuted: '#d97706',
          ashoka: '#1d4ed8',
          ashokaLight: '#3b82f6',
          chakra: '#0284c7',
          gold: '#eab308'
        },
        surface: {
          canvas: '#0f172a',
          card: '#ffffff',
          subtle: '#f8fafc',
          border: '#e2e8f0',
          hover: '#f1f5f9',
          glass: 'rgba(255, 255, 255, 0.92)'
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
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
        'glow-blue': '0 0 15px -3px rgba(37, 99, 235, 0.25)',
        'glow-saffron': '0 0 15px -3px rgba(245, 158, 11, 0.25)',
        'glow-emerald': '0 0 15px -3px rgba(16, 185, 129, 0.25)'
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(0%)', opacity: '0.9' },
          '50%': { transform: 'translateY(100%)', opacity: '1' },
          '100%': { transform: 'translateY(0%)', opacity: '0.9' }
        },
        radarPulse: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '0.4' },
          '100%': { transform: 'scale(0.95)', opacity: '0.8' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        'scanline': 'scanline 2.8s ease-in-out infinite',
        'radar-pulse': 'radarPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.2s infinite linear'
      }
    },
  },
  plugins: [],
}
