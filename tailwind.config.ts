import type { Config } from "tailwindcss";

// Design tokens — enterprise finance/ops register (QuickBooks / Zoho Books / Stripe class)
// Ink:      #0B1120  near-black navy, primary text & sidebar
// Slate:    #475467  secondary text
// Canvas:   #F7F8FA  app background (cool, not warm cream — avoids the templated look)
// Surface:  #FFFFFF  cards/panels
// Line:     #E4E7EC  hairline borders
// Brand:    #4F46E5  indigo — primary actions, active nav, links
// Signal:   #059669  emerald — reserved ONLY for positive money (paid, profit, revenue up)
// Warn:     #D97706  amber — pending/aging
// Danger:   #DC2626  overdue/rejected

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1120",
        slate: {
          DEFAULT: "#475467",
          50: "#F8F9FB",
          100: "#F1F2F5",
          200: "#E4E7EC",
          400: "#98A2B3",
          600: "#475467",
          900: "#0B1120",
        },
        canvas: "#F7F8FA",
        surface: "#FFFFFF",
        line: "#E4E7EC",
        brand: {
          DEFAULT: "#4F46E5",
          50: "#EEF0FF",
          100: "#E0E3FF",
          600: "#4F46E5",
          700: "#4338CA",
        },
        signal: {
          DEFAULT: "#059669",
          50: "#ECFDF5",
          600: "#059669",
        },
        warn: {
          DEFAULT: "#D97706",
          50: "#FFFBEB",
          600: "#D97706",
        },
        danger: {
          DEFAULT: "#DC2626",
          50: "#FEF2F2",
          600: "#DC2626",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,17,32,0.04), 0 1px 0 rgba(11,17,32,0.03)",
        panel: "0 4px 12px rgba(11,17,32,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
