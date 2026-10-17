/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        cloud: {
          cyan: '#80D1FF',
          blue: '#5A4BFF',
          purple: '#9D7BFF',
          mint: '#7FE7C8',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'bounce-dot': 'bounceDot 1.4s ease-in-out infinite',
        'mist-drift': 'mistDrift 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(128, 209, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(128, 209, 255, 0.6)' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        mistDrift: {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '50%': { transform: 'translateX(30px) translateY(-10px)' },
          '100%': { transform: 'translateX(0) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
