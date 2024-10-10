import app from "./app";
import authorizeSpotify from "./auth-email";

authorizeSpotify().then((result) => {
	if (process.env.NODE_ENV === "production") {
		const { error, data } = result!;
		if (error) {
			console.error(error);
			throw new Error(
				`failed to send spotify authorization: ${error.message} [${error.name}]`,
			);
		} else if (!data) {
			console.error("got no data or error from sending authorization email");
			throw new Error(`failed to send spotify authorization: [error missing]`);
		}
		console.log(`sent email ${data.id} to authorize spotify`);
	}
});

const server = Bun.serve({
	hostname: "0.0.0.0",
	fetch: app.fetch,
});

console.log(`server running at ${server.url}`);
