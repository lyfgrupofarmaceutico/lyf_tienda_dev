export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx}",
    "./assets/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./contexts/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        bgPrimario: "var(--bg-primario)",
        bgSecundario: "var(--bg-secundario)",
        bgOscuro: "var(--bg-oscuro)",
        txtBlanco: "var(--txt-blanco)",
        txtNegro: "var(--txt-negro)",
        primario: "var(--primario)",
        secundario: "var(--secundario)",
        descuento: "var(--descuento)",
        destacado: "var(--destacado)",
        destructivo: "var(--destructivo)",
        enfasis: "var(--enfasis)",
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-secondary": "var(--gradient-secondary)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        hover: "var(--shadow-hover)",
      },
      transitionProperty: {
        smooth: "var(--transition)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: ["tailwindcss-animate"],
};
