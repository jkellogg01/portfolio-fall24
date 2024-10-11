import { TopArtists } from "./components/TopArtists";

export default function () {
	return (
		<div className="min-h-svh container mx-auto flex justify-center items-center">
			<TopArtists limit={5} offset={0} time_range="short_term" />
		</div>
	);
}
