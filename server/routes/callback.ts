import { Hono } from "hono";
import { z } from "zod";
import { dbSpotify } from "../db/init";
import { keyTable } from "../db/schema";

export const spotifyAccessTokenSchema = z.object({
	access_token: z.string(),
	token_type: z.string().refine((x) => x === "Bearer"),
	scope: z.string().optional(),
	expires_in: z.number().int(),
	refresh_token: z.string(),
});

export const callbackRoute = new Hono().get("/spotify", async (c) => {
	const { code, error } = c.req.query();
	if (error || !code) {
		console.error(`spotify callback failed: ${error}`);
		return c.json({ error }, 500);
	}
	const res = await fetch(
		`https://accounts.spotify.com/api/token?grant_type=authorization_code&code=${code}&redirect_uri=${process.env.SPOTIFY_REDIRECT_URI!}`,
		{
			method: "POST",
			headers: {
				Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID!}:${process.env.SPOTIFY_CLIENT_SECRET!}`).toString("base64")}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
		},
	);
	if (!res.ok) {
		console.error({
			error: "failed to fetch spotify access code",
			response: await res.json(),
		});
		res
			.json()
			.then((data) => {
				console.error({
					error: "failed to fetch spotify access code",
					response: data,
				});
			})
			.catch(() => {
				console.error({ error: "failed to fetch spotify access code" });
			});
		return c.json({ error: "failed to fetch spotify access code" }, 500);
	}
	const data = await res.json();
	console.debug(data);
	const accessTokenResponse = spotifyAccessTokenSchema.parse(data);
	const dbResult = await dbSpotify.insert(keyTable).values({
		accessKey: accessTokenResponse.access_token,
		refreshKey: accessTokenResponse.refresh_token,
		expiresAt: Math.floor(Date.now() / 1000) + accessTokenResponse.expires_in,
		scope: accessTokenResponse.scope,
	});
	return c.json({ dbResult });
});
