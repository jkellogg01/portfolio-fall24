import { sign } from "hono/jwt";
import { Resend } from "resend";

export default async function authorizeSpotify() {
	const authorizeURL = await getAuthorizationLink();
	if (process.env.NODE_ENV !== "production") {
		console.log(`authorize spotify at ${authorizeURL}`);
		return;
	}
	const resend = new Resend(process.env.RESEND_API_KEY!);
	return await resend.emails.send({
		from: "Authorization <authorize-spotify@jkellogg.dev>",
		to: "kellogg.20.joshua@gmail.com",
		subject: "Please authorize the spotify api",
		html: `<a href="${authorizeURL}">authorize spotify</a>`,
	});
}

async function getAuthorizationLink() {
	const token = await sign(
		{
			nbf: Math.floor(Date.now() / 1000),
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
		},
		process.env.JWT_SECRET!,
	);
	const authorizeHost =
		process.env.NODE_ENV === "production"
			? "https://www.jkellogg.dev"
			: "http://localhost:5173";
	return `${authorizeHost}/api/spotify/authorize?token=${token}`;
}
