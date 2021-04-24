import { RequestHandler } from "./CommonTypes";

interface ICorsHeaders {
  "Access-Control-Allow-Origin": string;
  "Access-Control-Allow-Methods": string;
  "Access-Control-Allow-Headers": string;
  "Access-Control-Expose-Headers": string;
  "Access-Control-Max-Age": string;
}

export class CorsHelper {
  wrapRequestHandler(handler: any) {
    const wrapped: RequestHandler = async (request: any) => {
      const method = request.method as string;
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Expose-Headers": "*",
        "Access-Control-Max-Age": "600",
      };

      if (method.toLowerCase() === "options") {
        // This is an OPTIONS request, we're going to take over here
        let response = new Response(null, {
          headers: corsHeaders,
        });
        return response;
      } else {
        let response = await handler(request);
        // No messing with WebSocket headers
        if (request.headers.get("Upgrade") !== "websocket") {
          Object.keys(corsHeaders).forEach((k) => {
            response.headers.append(k, corsHeaders[k as keyof ICorsHeaders]);
          });
        }
        return response;
      }
    };

    return wrapped;
  }
}
