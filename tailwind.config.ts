import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#317039',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F1BE49',
          foreground: '#000000',
        },
        accent: {
          DEFAULT: '#FBEDD9',
          foreground: '#000000',
        },
        destructive: {
          DEFAULT: '#CC4824',
          foreground: '#FFFFFF',
        },
        background: '#FFF8EB', // cosmic latte
      },
      borderRadius: {
        lg: '9999px',
      },
    },
  },
}

export default config; 