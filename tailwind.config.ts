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
        ink: "#F4F0E8",
        graphite: "#EAE5DC",
        frost: "#15314F",
        muted: "#65778A",
        mint: "#4F83B6",
        sage: "#8DB5D8",
        steel: "#D5E0E8",
        aurora: "#BFD8EA",
      },
      boxShadow: {
        glow: "0 18px 50px rgba(49, 88, 126, 0.12)",
        sage: "0 18px 55px rgba(74, 116, 154, 0.14)",
      },
      backgroundImage: {
        "radial-grid":
          "radial-gradient(circle at top left, rgba(109,161,204,0.16), transparent 34%), radial-gradient(circle at 82% 8%, rgba(255,255,255,0.7), transparent 28%), linear-gradient(180deg, #F8F4EC 0%, #EEF4F7 55%, #F5F0E8 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
