import { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
	return (
		<div className="border border-tokyonight-foreground bg-tokyonight-background-dark p-4 rounded-lg">
			{children}
		</div>
	);
}
