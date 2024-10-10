import { drizzle } from "drizzle-orm/bun-sqlite";
import { keyTable } from "./schema";
import { spotifyAccessTokenSchema } from "../routes/callback";
import { Database } from "bun:sqlite";

const spotify = new Database("spotify.sqlite", { create: true });
export const dbSpotify = drizzle(spotify);

export async function getAccessKey() {
	const key = await dbSpotify
		.select()
		.from(keyTable)
		.groupBy(keyTable.createdAt)
		.limit(1);
	if (key.length > 0 && key[0].expiresAt > Math.floor(Date.now() / 1000)) {
		return key[0].accessKey;
	}
	return await refreshSpotifyAPIKey(key[0].refreshKey)
		.then((refreshed) => {
			dbSpotify.insert(keyTable).values({
				accessKey: refreshed.access_token,
				refreshKey: refreshed.refresh_token ?? key[0].refreshKey,
				expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
				scope: refreshed.scope,
			});
			return refreshed.access_token;
		})
		.catch((err) => {
			console.error(err);
			return undefined;
		});
}

async function refreshSpotifyAPIKey(refreshKey: string) {
	const res = await fetch(`https://accounts.spotify.com/api/token`, {
		method: "POST",
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refreshKey,
		}),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID!}:${process.env.SPOTIFY_CLIENT_SECRET!}`).toString("base64")}`,
		},
	});
	if (!res.ok) {
		throw new Error("failed to refresh spotify API key");
	}
	const body = await res.json();
	try {
		const parsed = spotifyAccessTokenSchema.parse(body);
		return parsed;
	} catch (err) {
		console.debug(body);
		throw err;
	}
}
