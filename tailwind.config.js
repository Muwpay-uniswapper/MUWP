/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/**/*.{ts,tsx}',
	],
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
					DEFAULT: "hsla(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				'home-gradient': {
					start: '#3d2d37',
					mid1: '#473341',
					mid2: '#3c323e',
					mid3: '#312a36',
					end: '#2d2433',
				},
			},
			fontFamily: {
				'poppins': ['Poppins', 'sans-serif'],
			},
			minHeight: {
				'100vh': '100vh',
			},
			backgroundImage: (theme) => ({
				'home-gradient': `linear-gradient(153.44deg, ${theme('colors.home-gradient.start')} -5.98%, ${theme('colors.home-gradient.mid1')} 37.15%, ${theme('colors.home-gradient.mid2')} 67.97%, ${theme('colors.home-gradient.mid3')} 88.32%, ${theme('colors.home-gradient.end')} 98.55%)`,
			}),
			backgroundPosition: {
				'50': '50%',
			},
			backgroundSize: {
				'cover': 'cover',
			},
			backgroundRepeat: {
				'no-repeat': 'no-repeat',
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"accordion-down": {
					from: { height: 0 },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: 0 },
				},
				pulse: {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(1.5)', opacity: '0.2' },
				}
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				pulse: 'pulse 500ms ease-out forwards',
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
	variants: {
		extend: {
			backgroundColor: ['responsive', 'hover', 'focus', 'active'],
		},
	},
};
