import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        sand: "#f6efe5",
        ember: "#bb4d00",
        mist: "#d7e3ef",
        spruce: "#1b4332"
      },
      boxShadow: {
        panel: "0 24px 60px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;
