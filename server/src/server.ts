import { serve } from "@hono/node-server";
import app from "./app.js";

serve(
  {
    fetch: app.fetch,
    hostname: "0.0.0.0",
    port: Number(process.env.PORT) || 8787
  },
  (info) => {
    console.log(`Koala Habit API listening on http://0.0.0.0:${info.port}`);
  }
);
