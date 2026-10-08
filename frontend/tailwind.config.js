import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.jsx", 
  ],
  theme: {
    extend: {
      // 1. AQUÍ METEMOS EL GRADIENTE CON TU PALETA
      backgroundImage: {
        'paleta-animada': 'linear-gradient(90deg, #CC7722, #FFB800, #C0C0C0, #808080, #555555, #FFB800, #CC7722)',
      },
      // 2. AQUÍ LA ANIMACIÓN QUE QUERÍAS
      animation: {
        'gradientMove': 'gradientMove 5s ease infinite',
      },
      keyframes: {
        gradientMove: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
      colors: {
        cinemaBg: '#000000',      
        cinemaCard: '#111111',    
        cinemaBorder: '#222222',  
        gold: {
          light: '#F3E5AB',        
          DEFAULT: '#D4AF37',     
          dark: '#996515',    
        },
        cinemaText: '#EAEAEA',     
        cinemaMuted: '#888888',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};