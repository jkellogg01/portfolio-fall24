import { useQuery } from "@tanstack/react-query";
import { getTopSongs } from "../api";

export default function () {
	const { data, error } = useQuery({
		queryKey: ["top-songs"],
		queryFn: getTopSongs,
	});
	if (error) {
		return (
			<div className="border-tokyonight-fg border rounded-lg content-center text-center">
				Looks like we aren't getting along with spotify's api at the moment.
				check back later.
			</div>
		);
	}
	return (
		<div className="border border-tokyonight-fg rounded-xl">
			<code>
				<pre>{JSON.stringify(data, undefined, "  ")}</pre>
			</code>
		</div>
	);
}
