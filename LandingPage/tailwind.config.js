/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', "system-ui", "sans-serif"],
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
      },
      colors: {
        ce: {
          canvas: "var(--ce-canvas)",
          surface: "var(--ce-surface)",
          muted: "var(--ce-muted)",
          elevated: "var(--ce-elevated)",
          border: "var(--ce-border)",
          ink: "var(--ce-ink)",
          "ink-muted": "var(--ce-ink-muted)",
          accent: "var(--ce-accent)",
          "accent-hover": "var(--ce-accent-hover)",
          "on-accent": "var(--ce-ink-on-accent)",
          secondary: "var(--ce-secondary)",
          positive: "var(--ce-positive)",
          warm: "var(--ce-warm)",
          "warm-soft": "var(--ce-warm-soft)",
          "footer-bg": "var(--ce-footer-bg)",
          "footer-text": "var(--ce-footer-text)",
          "footer-muted": "var(--ce-footer-muted)",
        },
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
      fontSize: {
        hero: ["clamp(2.25rem,4vw+1rem,3.75rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        display: ["clamp(1.875rem,2.5vw+1rem,2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      maxWidth: {
        measure: "68ch",
      },
    },
  },
  plugins: [],
};
