import { hc } from "hono/client";
import { AppType } from "../../server/app";

export const client = hc<AppType>("/");

export function getTopSongs(
  limit: number,
  offset: number,
  time_range: "short_term" | "medium_term" | "long_term",
) {
  return async () => {
    const res = await client.api.spotify.top.artists.$get({
      query: {
        limit: limit.toString(),
        offset: offset.toString(),
        time_range: time_range,
      },
    });
    if (!res.ok) {
      throw new Error("failed to fetch top songs");
    }
    return await res.json();
  };
}
