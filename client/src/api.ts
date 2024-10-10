import { hc } from "hono/client";
import { AppType } from "../../server/app";

const client = hc<AppType>("/");

export const getTopSongs = async () => {
	const res = await client.api.spotify.top.artists.$get({
		query: {
			limit: "10",
			offset: "0",
			time_range: "short_term",
		},
	});
	if (!res.ok) {
		throw new Error("failed to fetch top songs");
	}
	return await res.json();
};
