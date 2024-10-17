import { z } from "zod";

const spotifyImageSchema = z.object({
  url: z.string().url(),
  height: z.number().int().optional(),
  width: z.number().int().optional(),
});

const spotifyArtistSchema = z.object({
  external_urls: z
    .object({
      spotify: z.string().url(),
    })
    .optional(),
  followers: z
    .object({
      href: z.null().optional(),
      total: z.number().int(),
    })
    .optional(),
  genres: z.array(z.string()),
  href: z.string().url(),
  images: z.array(spotifyImageSchema),
  name: z.string(),
  popularity: z.number().int(),
  type: z.string().refine((x) => x === "artist"),
  uri: z.string(),
});

const spotifyGetTopArtistsSchema = z.object({
  href: z.string().url(),
  next: z.string().url().optional(),
  previous: z.string().url().optional(),
  limit: z.number().int(),
  offset: z.number().int(),
  total: z.number().int(),
  items: z.array(spotifyArtistSchema),
});

export function getTopArtists(
  limit: number,
  offset: number,
  time_range: "short_term" | "medium_term" | "long_term",
) {
  const search = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
    time_range,
  });
  return async () => {
    const res = await fetch(`/api/spotify/top/artists?${search.toString()}`);
    if (!res.ok) {
      throw new Error("failed to fetch top artists");
    }
    const data = await res.json();
    return spotifyGetTopArtistsSchema.parse(data);
  };
}
