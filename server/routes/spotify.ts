import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { getAccessKey } from "../db/init";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

type Env = {
	Variables: {
		token: string;
	};
};

const getAccessTokenMiddleware = createMiddleware<Env>(async (c, next) => {
	const accessToken = await getAccessKey();
	if (!accessToken) {
		throw new Error("no access token available");
	}
	c.set("token", accessToken);
	await next();
});

const spotifyImageSchema = z.object({
	url: z.string().url(),
	height: z.number().int(),
	width: z.number().int(),
});

const spotifyArtistSchema = z.object({
	external_urls: z
		.object({
			spotify: z.string().url(),
		})
		.optional(),
	followers: z
		.object({
			href: z.null(),
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

const spotifyGetTopArtistSchema = z.object({
	href: z.string().url(),
	next: z.string().url().nullable(),
	previous: z.string().url().nullable(),
	limit: z.number().int(),
	offset: z.number().int(),
	total: z.number().int(),
	items: z.array(spotifyArtistSchema),
});

export const spotifyRoute = new Hono()
	.get("/authorize", async (c) => {
		const { token } = c.req.query();
		try {
			await verify(token, process.env.JWT_SECRET!);
		} catch (err) {
			console.error(err);
			return c.json({ error: "invalid token" } as const, 400);
		}
		const clientID = process.env.SPOTIFY_CLIENT_ID!;
		const redirectURI = process.env.SPOTIFY_REDIRECT_URI!;
		const searchParams = new URLSearchParams({
			client_id: clientID,
			redirect_uri: redirectURI,
			response_type: "code",
			show_dialog: "false",
			scope: "user-top-read",
		});
		return c.redirect(
			`https://accounts.spotify.com/authorize?${searchParams.toString()}`,
		);
	})
	.get("/top/artists", getAccessTokenMiddleware, async (c) => {
		const spotifyAccess = c.var.token;
		const { limit, offset, time_range } = c.req.query();
		const res = await fetch(
			`https://api.spotify.com/v1/me/top/artists?${new URLSearchParams({
				limit,
				offset,
				time_range,
			}).toString()}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${spotifyAccess}`,
				},
			},
		);
		if (!res.ok) {
			res.json().then((body) => {
				console.error(body);
			});
			throw new Error(`${c.req.url}: ${res.status} ${res.statusText}`);
		}
		const data = await res.json();
		return c.json(spotifyGetTopArtistSchema.parse(data));
	});
