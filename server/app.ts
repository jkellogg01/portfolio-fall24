import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono();

app.use("*", logger());

app.get("/healthz", (ctx) => {
	return ctx.text("all is well");
});

export default app;
