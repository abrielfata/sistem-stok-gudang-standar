import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-app)',
        surface: 'var(--bg-surface)',
        'surface-subtle': 'var(--bg-subtle)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',

        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },

        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
        },

        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#0EA5E9',
        },
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '3px',
        md: '4px',
        none: '0px',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['13px', '18px'],
        base: ['14px', '22px'],
        md: ['15px', '24px'],
        lg: ['16px', '24px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
      },
    },
  },
  plugins: [],
} satisfies Config;
