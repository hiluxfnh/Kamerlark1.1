/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
    width:{
      256: '68.75rem',
      148:'37.5rem',
      200:'50rem',
      80:'20rem',
      64:'16rem',
      170:'42.5rem',
      130:'32.5rem',
      120:'30rem',
      160:'40rem',
      150:'37.5rem',
    },
    height:{
      256: '68.75rem',
      148:'37.5rem',
      200:'50rem',
      80:'20rem',
      64:'16rem',
      170:'42.5rem',
      130:'32.5rem',
      120:'30rem',
    },
    minHeight:{
      80:'20rem',
      64:'16rem',
      170:'42.5rem',
      130:'32.5rem',
      120:'30rem',
      256: '68.75rem',
    },
    maxHeight:{
      80:'20rem',
      64:'16rem',
      170:'42.5rem',
      130:'32.5rem',
      120:'30rem',
      256: '68.75rem',
      140:'35rem',
    },
    scale:{
      80:'0.80',
    }
  },
  plugins: [],
}

