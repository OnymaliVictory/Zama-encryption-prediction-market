/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        zinc: {
          50:  "#FAFAFA",
          100: "#F4F4F5",
          150: "#EFEFEF",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
          950: "#09090B",
        },
      },
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'DM Mono'", "monospace"],
      },
      animation: {
        "pulse-slow":   "pulse 3s ease-in-out infinite",
        "float":        "float 6s ease-in-out infinite",
        "glow":         "glow 2s ease-in-out infinite alternate",
        "slide-up":     "slideUp 0.5s ease-out",
        "fade-in":      "fadeIn 0.6s ease-out",
        "shimmer":      "shimmer 2s linear infinite",
        "spin-slow":    "spin 8s linear infinite",
        "bounce-soft":  "bounceSoft 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":       { transform: "translateY(-10px)" },
        },
        glow: {
          "0%":   { boxShadow: "0 0 10px rgba(251,191,36,0.3)" },
          "100%": { boxShadow: "0 0 30px rgba(251,191,36,0.8)" },
        },
        slideUp: {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":       { transform: "translateY(-4px)" },
        },
      },
      boxShadow: {
        "gold":     "0 4px 24px rgba(251,191,36,0.25)",
        "gold-lg":  "0 8px 48px rgba(251,191,36,0.35)",
        "inner-gold": "inset 0 1px 0 rgba(251,191,36,0.3)",
        "card":     "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 20px rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.06)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)",
        "gold-subtle":   "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
        "dark-gradient": "linear-gradient(135deg, #18181B 0%, #27272A 100%)",
        "grid-pattern":  "radial-gradient(circle, #D4D4D8 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
