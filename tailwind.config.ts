import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#050508",
        graphite: "#121411",
        frost: "#F5F2EA",
        muted: "#A4A89F",
        mint: "#9DFFD7",
        sage: "#B7D8C2",
        steel: "#20241F",
        aurora: "#D7FFE8",
      },
      boxShadow: {
        glow: "0 0 70px rgba(157, 255, 215, 0.12)",
        sage: "0 0 80px rgba(183, 216, 194, 0.14)",
      },
      backgroundImage: {
        "radial-grid":
          "radial-gradient(circle at top left, rgba(157,255,215,0.12), transparent 34%), radial-gradient(circle at 80% 15%, rgba(245,242,234,0.06), transparent 30%), linear-gradient(180deg, #050508 0%, #0B0D0B 50%, #050508 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
