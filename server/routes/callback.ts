import { Hono } from "hono";
import { z } from "zod";

const spotifyAccessTokenSchema = z.object({
	access_token: z.string(),
	token_type: z.string().refine((x) => x === "Bearer"),
	scope: z.string(),
	expires_in: z.number().int(),
	refresh_token: z.string(),
});

export const callbackRoutes = new Hono().get("/spotify", async (c) => {
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
		return c.json({ error: "failed to fetch spotify access code" }, 500);
	}
	const data = await res.json();
	return c.json({ data });
});
