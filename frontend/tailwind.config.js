/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'helvetica': ['Helvetica'], // atau 'Helvetica Neue' jika Anda lebih suka
        sans: ['Helvetica', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'], // Menggunakan Helvetica sebagai sans-serif default
        serif: ['Helvetica', 'Georgia', 'Palatino', 'Book Antiqua', 'Palatino Linotype', 'Perpetua', 'Script MT', 'Times New Roman', 'serif'], // Menggunakan Helvetica sebagai serif fallback
      }
    },
  },
  plugins: [],
}

