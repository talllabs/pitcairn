import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pitcairn: {
          blue: '#1a4fa8',
          teal: '#2a9d8f',
          sand: '#f4e4c1',
        },
      },
    },
  },
  plugins: [],
}
export default config
