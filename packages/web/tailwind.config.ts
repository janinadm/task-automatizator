// Tailwind CSS Configuration (Configuración de Tailwind CSS)
// This file customizes and extends Tailwind's default theme.
// We define our color palette, glassmorphism utilities, fonts, and animations here.
// (Este archivo personaliza y extiende el tema por defecto de Tailwind.
//  Aquí definimos nuestra paleta de colores, utilidades de glassmorfismo, fuentes y animaciones.)

import type { Config } from 'tailwindcss'

export default {
  // === Content Sources (Fuentes de contenido) ===
  // Tailwind scans these files to know which classes are used (tree-shaking)
  // (Tailwind escanea estos archivos para saber qué clases se usan)
  content: [
    './app/**/*.{vue,ts,js}',
    './components/**/*.{vue,ts,js}',
    './layouts/**/*.{vue,ts,js}',
    './pages/**/*.{vue,ts,js}',
    './composables/**/*.{ts,js}',
    './plugins/**/*.{ts,js}',
  ],

  // === Dark Mode (Modo oscuro) ===
  // 'class' means we toggle dark mode with a CSS class on <html>
  // (Se activa el modo oscuro añadiendo una clase CSS al elemento <html>)
  darkMode: 'class',

  theme: {
    extend: {
      // === Custom Font (Fuente personalizada) ===
      // Inter is a modern, clean sans-serif font designed for screens
      // (Inter es una fuente sans-serif moderna y limpia diseñada para pantallas)
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      // === Custom Colors (Colores personalizados) ===
      // Our brand palette — used across the entire application
      // (Nuestra paleta de marca — usada en toda la aplicación)
      colors: {
        // Primary brand color (Color primario de marca)
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',  // Main brand color (Color principal)
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Glass colors for glassmorphism effects (Colores para efectos glassmorfismo)
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.15)',
          heavy: 'rgba(255, 255, 255, 0.25)',
          border: 'rgba(255, 255, 255, 0.2)',
        },
        // Sentiment colors — used in ticket sentiment indicators
        // (Colores de sentimiento — usados en indicadores de sentimiento de tickets)
        sentiment: {
          positive: '#22c55e', // Green (Verde)
          neutral: '#f59e0b',  // Amber (Ámbar)
          negative: '#ef4444', // Red (Rojo)
        },
        // Priority colors — used in priority badges
        // (Colores de prioridad — usados en badges de prioridad)
        priority: {
          low: '#22c55e',     // Green (Verde)
          medium: '#f59e0b',  // Amber (Ámbar)
          high: '#f97316',    // Orange (Naranja)
          urgent: '#ef4444',  // Red (Rojo)
        },
      },

      // === Glassmorphism Backdrop Blur (Desenfoque de fondo para glassmorfismo) ===
      backdropBlur: {
        xs: '2px',
      },

      // === Box Shadow for glass cards (Sombras para tarjetas de cristal) ===
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
        'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.5)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
      },

      // === Animations (Animaciones) ===
      // Custom animations for UI interactions
      // (Animaciones personalizadas para interacciones de interfaz)
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      // === Border Radius (Radio de borde) ===
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },

  plugins: [],
} satisfies Config
