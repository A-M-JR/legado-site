/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ['class'],
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				legado: {
					light: '#ECEB9C',
					mid: '#BDC895',
					mid10: 'rgba(189, 200, 149, 0.1)',
					dark: '#8DA48D',
					gold: 'rgba(112, 169, 127, 1)',
					black: '#000000',
					white: '#FFFFFF',
					// 🎨 Cores dinâmicas vindas do banco de dados
					primary: 'var(--primary-color, #5ba58c)',
					'primary-light': 'var(--primary-color-light, #e3f1eb)',
					'primary-dark': 'var(--primary-color-dark, #4a8a74)',
				},
				// 🎨 Tema do app Legado (clássico/memorial) — ver src/styles/legado-tema.css
				tema: {
					titulo: 'rgb(var(--tema-titulo) / <alpha-value>)',
					primaria: 'rgb(var(--tema-primaria) / <alpha-value>)',
					'primaria-escura': 'rgb(var(--tema-primaria-escura) / <alpha-value>)',
					medio: 'rgb(var(--tema-medio) / <alpha-value>)',
					texto: 'rgb(var(--tema-texto) / <alpha-value>)',
					suave: 'rgb(var(--tema-suave) / <alpha-value>)',
					apagado: 'rgb(var(--tema-apagado) / <alpha-value>)',
					destaque: 'rgb(var(--tema-destaque) / <alpha-value>)',
					'destaque-claro': 'rgb(var(--tema-destaque-claro) / <alpha-value>)',
					dourado: 'rgb(var(--tema-dourado) / <alpha-value>)',
					borda: 'rgb(var(--tema-borda) / <alpha-value>)',
					'borda-forte': 'rgb(var(--tema-borda-forte) / <alpha-value>)',
					claro: 'rgb(var(--tema-claro) / <alpha-value>)',
					'claro-2': 'rgb(var(--tema-claro-2) / <alpha-value>)',
					'fundo-topo': 'rgb(var(--tema-fundo-topo) / <alpha-value>)',
					'fundo-base': 'rgb(var(--tema-fundo-base) / <alpha-value>)',
				},
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			fontFamily: {
				sans: [
					'Nunito Sans',
					'sans-serif'
				],
				serif: [
					'Lora',
					'serif'
				]
			},
			boxShadow: {
				soft: '0 10px 25px -5px #BDC895, 0 10px 10px -5px rgba(212, 183, 76, 0.04)'
			},
			animation: {
				'fade-in-down': 'fadeInDown 0.5s ease-out',
				'pulse-gentle': 'pulse 3s infinite'
			},
			keyframes: {
				fadeInDown: {
					'0%': {
						opacity: '0',
						transform: 'translateY(-10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				pulse: {
					'0%, 100%': {
						opacity: '0.6'
					},
					'50%': {
						opacity: '0.8'
					}
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};