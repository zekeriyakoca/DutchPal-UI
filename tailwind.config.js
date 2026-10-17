const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      // Inter for reading, Poppins for headings and the brand.
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Delft blue: actions, links, focus.
        primary: {
          50: "#eef3fb",
          100: "#d9e4f5",
          200: "#b5caeb",
          300: "#88a8dc",
          400: "#5a83c9",
          500: "#3a64b3",
          600: "#2b4e96",
          700: "#233f7a",
          800: "#1e3463",
          900: "#1b2d52",
          950: "#111c35",
        },
        // Dutch orange: highlights, used sparingly.
        accent: {
          50: "#fff5eb",
          100: "#ffe6cc",
          200: "#ffc999",
          300: "#ffa75c",
          400: "#ff8a2b",
          500: "#f57010",
          600: "#d9580a",
          700: "#b3430c",
        },
        success: colors.emerald,
        danger: colors.rose,
        warning: colors.amber,
        ink: {
          DEFAULT: "#1c2333",
          muted: "#525b6d",
          subtle: "#8a92a3",
        },
        canvas: "#f7f5f1",
        line: "#e7e3dc",
      },
      borderRadius: {
        control: "0.625rem",
        card: "1rem",
      },
      boxShadow: {
        card: "0 1px 2px rgb(17 28 53 / 0.04), 0 2px 8px -2px rgb(17 28 53 / 0.06)",
        pop: "0 12px 32px -8px rgb(17 28 53 / 0.22), 0 2px 6px rgb(17 28 53 / 0.06)",
      },
      maxWidth: {
        reading: "42rem",
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": theme("colors.ink.DEFAULT"),
            "--tw-prose-headings": theme("colors.ink.DEFAULT"),
            "--tw-prose-bold": theme("colors.ink.DEFAULT"),
            "--tw-prose-links": theme("colors.primary.600"),
            "--tw-prose-bullets": theme("colors.primary.300"),
            "--tw-prose-counters": theme("colors.ink.subtle"),
            "--tw-prose-th-borders": theme("colors.line"),
            "--tw-prose-td-borders": theme("colors.line"),
            "--tw-prose-quote-borders": theme("colors.accent.300"),
            "h1, h2, h3, h4": { fontFamily: theme("fontFamily.display").join(",") },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
