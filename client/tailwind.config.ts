import type { Config } from "tailwindcss";

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				tokyonight: {
					background: {
						DEFAULT: "#222436",
						dark: "#1e2030",
					},
					foreground: {
						DEFAULT: "#c8d3f5",
						dark: "#828bb8",
					},
					black: {
						DEFAULT: "#1b1d2b",
						bright: "#444a73",
					},
					red: {
						DEFAULT: "#ff757f",
						bright: "#c53b53",
					},
					green: {
						DEFAULT: "#c3e88d",
						bright: "#4fd6be",
					},
					yellow: {
						DEFAULT: "#ffc777",
						bright: "#ff966c",
					},
					blue: {
						DEFAULT: "#82aaff",
						bright: "#65bcff",
					},
					magenta: {
						DEFAULT: "#c099ff",
						bright: "#ff007c",
					},
					cyan: {
						DEFAULT: "#86e1fc",
						bright: "#89ddff",
					},
					white: {
						DEFAULT: "#828bb8",
						bright: "#c8d3f5",
					},
				},
			},
		},
	},
	plugins: [],
} satisfies Config;
