/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep clinical teal — the brand's primary color. Deliberately not the
        // generic SaaS indigo/violet; teal reads as clinical/trustworthy
        // without tipping into a sterile, cold hospital-white look.
        brand: {
          50: '#EEF7F7',
          100: '#D3EBEC',
          200: '#A7D7D9',
          300: '#72BCC0',
          400: '#3F9CA1',
          500: '#0E7C86',
          600: '#0B646C',
          700: '#0A5259',
          800: '#0B4145',
          900: '#0B5F67',
          950: '#062A2E',
        },
        ink: {
          50: '#F8FAFB',
          100: '#F1F5F7',
          200: '#E2E8EC',
          300: '#CBD5DC',
          400: '#94A3AF',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        status: {
          amber: '#B45309',
          amberBg: '#FEF3E2',
          green: '#15803D',
          greenBg: '#EAF7EE',
          red: '#B91C1C',
          redBg: '#FCEAEA',
          blue: '#1D4ED8',
          blueBg: '#EAF0FE',
          slate: '#475569',
          slateBg: '#EEF1F4',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};
