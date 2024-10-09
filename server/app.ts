import { Hono } from "hono";
import { logger } from "hono/logger";
import { spotifyRoute } from "./routes/spotify";
import { callbackRoutes as callbackRoute } from "./routes/callback";

const app = new Hono();

app.use(logger());

app.route("/api/spotify", spotifyRoute);

app.route("/api/callback", callbackRoute);

export default app;
