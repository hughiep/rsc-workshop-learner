import { Suspense, createElement as h, startTransition, use } from "react";
import { createRoot } from "react-dom/client";
import { shipFallbackSrc } from "./img-utils.js";

// 💰 you're going to want this:
import { createFromFetch } from "react-server-dom-esm/client";

const getGlobalLocation = () =>
  window.location.pathname + window.location.search;

const initialLocation = getGlobalLocation();

console.log("initialLocation", initialLocation);

const initialContentFetchPromise = fetch(`/rsc${initialLocation}`);
// 💣 we no longer process the response into JSON, instead react-server-dom-esm
// will process it for us. Delete this `then` call:

// 🐨 create a variable called initialContentPromise set to createFromFetch(initialContentFetchPromise)
const initialContentPromise = createFromFetch(initialContentFetchPromise);

function Root() {
  // 🐨 create a variable called content set to use(initialContentPromise)
  const content = use(initialContentPromise);
  console.log(content);
  // 💯 as a bonus, go ahead and console.log the content variable and check it out in the dev tools!
  // 🐨 return the content
  return content;
}

// 🐨 call createRoot with the Root component
startTransition(() => {
  createRoot(document.getElementById("root")).render(
    h(
      "div",
      { className: "app-wrapper" },
      h(
        Suspense,
        {
          fallback: h("img", {
            style: { maxWidth: 400 },
            src: shipFallbackSrc,
          }),
        },
        h(Root)
      )
    )
  );
});
