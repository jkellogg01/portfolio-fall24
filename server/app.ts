import { Hono } from "hono";
import { logger } from "hono/logger";
import { spotifyRoute } from "./routes/spotify";
import { callbackRoute } from "./routes/callback";
import { contactRoute } from "./routes/contact";

const app = new Hono();
app.use(logger());

const api = app
  .basePath("/api")
  .route("/spotify", spotifyRoute)
  .route("/callback", callbackRoute)
  .route("/contact", contactRoute);

export type AppType = typeof api;

export default app;
