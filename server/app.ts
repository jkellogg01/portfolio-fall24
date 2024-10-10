import { Hono } from "hono";
import { logger } from "hono/logger";
import { spotifyRoute } from "./routes/spotify";
import { callbackRoute } from "./routes/callback";

const app = new Hono();
app.use(logger());

const api = new Hono();
app.route("/api", api);
api.route("/spotify", spotifyRoute);
api.route("/callback", callbackRoute);

export default app;
