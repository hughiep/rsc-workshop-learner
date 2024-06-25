import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
// import { App } from "../ui/App.js";
import pkg from "react-server-dom-esm/server";
import { serve } from "@hono/node-server";
import { App } from "../ui/App.js";

const app = new Hono({ strict: true });
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
app.get("/rsc/:shipId?", (context) => {
  console.log("===");
  const { renderToPipeableStream, createElement: h } = pkg;
  const { pipe } = renderToPipeableStream(h(App));
  pipe(context.env.outgoing);
  return RESPONSE_ALREADY_SENT;
});

const server = serve({ fetch: app.fetch, port: PORT }, (info) => {
  const url = `http://localhost:${info.port}`;
  console.log(`🚀  We have liftoff!\n${url}`);
});
