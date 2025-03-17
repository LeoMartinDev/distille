import "@std/dotenv/load";

import config from "./config.ts";
import type { Route } from "./types.ts";
import { extractRouteFactory } from "./routes/extract.route.ts";

const routes: Route[] = [
  extractRouteFactory({ config }),
];

export default {
  fetch(request) {
    const matchedRoute = routes.reduce<
      { route: Route; match: URLPatternResult } | undefined
    >((acc, route) => {
      if (route.method === request.method) {
        const match = route.pattern.exec(request.url);

        if (!match) {
          return acc;
        }

        return {
          route,
          match,
        };
      }

      return acc;
    }, undefined);

    if (!matchedRoute) {
      return new Response("Not Found", { status: 404 });
    }

    try {
      const token = request.headers.get("Authorization");

      if (token !== config.token) {
        return new Response("Unauthorized", { status: 401 });
      }

      const { match, route } = matchedRoute;

      const params = match.pathname.groups;

      return route.handler({ request, params });
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
} satisfies Deno.ServeDefaultExport;
