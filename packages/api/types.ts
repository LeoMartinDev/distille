export type Route = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  pattern: URLPattern;
  handler: (
    args: { request: Request; params: Record<string, string | undefined> },
  ) => Promise<Response> | Response;
};
