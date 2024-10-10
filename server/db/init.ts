import { drizzle } from "drizzle-orm/bun-sqlite";
import { keyTable } from "./schema";
import { spotifyAccessTokenSchema } from "../routes/callback";
import { Database } from "bun:sqlite";

const spotify = new Database("spotify.sqlite", { create: true });
export const dbSpotify = drizzle(spotify);

export async function getAccessKey() {
	const key = dbSpotify
		.select()
		.from(keyTable)
		.groupBy(keyTable.createdAt)
		.limit(1)
		.get();
	if (!key) {
		throw new Error("no keys available");
	}
	if (key.expiresAt > Math.floor(Date.now() / 1000)) {
		return key.accessKey;
	}
	return await refreshSpotifyAPIKey(key.refreshKey)
		.then((refreshed) => {
			dbSpotify.insert(keyTable).values({
				accessKey: refreshed.access_token,
				refreshKey: refreshed.refresh_token,
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
	const parsed = spotifyAccessTokenSchema.parse(body);
	return parsed;
}
