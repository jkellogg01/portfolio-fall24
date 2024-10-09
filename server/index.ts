import app from "./app";

const server = Bun.serve({
	hostname: "0.0.0.0",
	fetch: app.fetch,
});

console.log(`server running at ${server.url}`);

