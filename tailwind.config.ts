import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cds: {
          bg: "var(--color-bg)",
          "bg-alternate": "var(--color-bg-alternate)",
          "bg-elevated": "var(--color-bg-elevated)",
          primary: "var(--color-bg-primary)",
          "primary-hover": "var(--color-bg-primary-hover)",
          secondary: "var(--color-bg-secondary)",
          tertiary: "var(--color-bg-tertiary)",
          fg: "var(--color-fg)",
          muted: "var(--color-fg-muted)",
          "fg-primary": "var(--color-fg-primary)",
          line: "var(--color-line)",
          positive: "var(--color-positive)",
          warning: "var(--color-warning)",
        },
      },
      borderRadius: {
        cds: "var(--border-radius-300)",
        "cds-lg": "var(--border-radius-400)",
        "cds-xl": "var(--border-radius-500)",
      },
    },
  },
  plugins: [],
};
export default config;
