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
      60:'15rem',
      58:'14.5rem',
      56:'14rem',
      40:'10rem',
      96:'24rem',
      110:'27.5rem',
      70:'17.5rem',
      full:'100%',
      16:'4rem',
      14:'3.5rem',
      12:'3rem',
      10:'2.5rem',
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
      60:'15rem',
      58:'14.5rem',
      56:'14rem',
      16:'4rem',
      14:'3.5rem',
      12:'3rem',
      10:'2.5rem',
    },
    minHeight:{
      80:'20rem',
      64:'16rem',
      170:'42.5rem',
      130:'32.5rem',
      120:'30rem',
      256: '68.75rem',
      140:'35rem',

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

