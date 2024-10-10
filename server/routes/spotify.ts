import { Hono } from "hono";
import { verify } from "hono/jwt";

export const spotifyRoute = new Hono().get("/authorize", async (c) => {
	const { token } = c.req.query();
	try {
		await verify(token, process.env.JWT_SECRET!);
	} catch (err) {
		console.error(err);
		return c.json({ error: "invalid token" } as const, 400);
	}
	const clientID = process.env.SPOTIFY_CLIENT_ID!;
	const redirectURI = process.env.SPOTIFY_REDIRECT_URI!;
	return c.redirect(
		`https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=code&redirect_uri=${redirectURI}`,
	);
});
