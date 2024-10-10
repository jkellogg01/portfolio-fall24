import type { Config } from "tailwindcss";

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				tokyonight: {
					bg: {
						DEFAULT: "#222436",
						dark: "#1e2030",
						highlight: "#2f334d",
					},
					fg: {
						DEFAULT: "#c8d3f5",
						dark: "#828bb8",
						gutter: "#3b4261",
					},
				},
			},
		},
	},
	plugins: [],
} satisfies Config;
