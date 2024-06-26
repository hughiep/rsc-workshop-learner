import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { App } from "../ui/app.js";
import { trimTrailingSlash } from "hono/trailing-slash";
import { renderToPipeableStream } from "react-server-dom-esm/server";
import closeWithGrace from "close-with-grace";
import { createElement as h } from "react";
import { RESPONSE_ALREADY_SENT } from "@hono/node-server/utils/response";

const app = new Hono({ strict: true });
app.use(trimTrailingSlash());
const PORT = process.env.PORT || 3000;

app.use("/*", serveStatic({ root: "./public", index: "" }));

// this line tells hono.js to serve the files in the public directory when a
// request is made to the root of the server.
app.use(
  "/ui/*",
  serveStatic({
    root: "./ui",
    onNotFound: (path, context) => context.text("File not found", 404),
    rewriteRequestPath: (path) => path.replace("/ui", ""),
  })
);

app.use(async (context, next) => {
  if (context.req.query("search") === "") {
    const url = new URL(context.req.url);
    const searchParams = new URLSearchParams(url.search);
    searchParams.delete("search");
    const location = [url.pathname, searchParams.toString()]
      .filter(Boolean)
      .join("?");
    return context.redirect(location, 302);
  } else {
    await next();
  }
});

app.get("/rsc/:shipId?", async (context) => {
  const shipId = context.req.param("shipId") || null;
  const search = context.req.query("search") || "";

  console.log({ shipId, search });
  const data = { shipId, search };
  shipDataStorage.run(data, () => {
		const { pipe } = renderToPipeableStream(h(App))
		pipe(context.env.outgoing)
	})
  return RESPONSE_ALREADY_SENT;
});

const server = serve({ fetch: app.fetch, port: PORT }, (info) => {
  const url = `http://localhost:${info.port}`;
  console.log(`🚀  We have liftoff!\n${url}`);
});

closeWithGrace(async ({ signal, err }) => {
  if (err) console.error("Shutting down server due to error", err);
  else console.log("Shutting down server due to signal", signal);

  await new Promise((resolve) => server.close(resolve));
  process.exit();
});
