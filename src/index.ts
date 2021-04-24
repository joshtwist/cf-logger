import { Router } from "itty-router";
import { v4 as uuidv4 } from "uuid";
import { LogEngine } from "./LogEngine";
import { wrapForWebSocketError } from "./WebSocketHelper";
import { CorsHelper } from "./CorsHelper";
import { LogTopic } from "./LogTopic";
import { HTML } from "./html";

const defaultRuntimeId = "not-initialized";
let runtimeId = defaultRuntimeId;
const router = Router();
const logEngine = new LogEngine();
const corsHelper = new CorsHelper();

router.get(
  "/",
  () =>
    new Response(
      HTML, { headers: { "Content-Type" : "text/html" }}
    )
);
router.post("/log/:topicId", logEngine.postHandler);
router.get("/listen/:topicId", logEngine.listenHandler);
router.all("*", () => new Response('Not found', { status: 404}));

const mod = {
  initialize() {
    if (runtimeId === defaultRuntimeId) {
      runtimeId = uuidv4();
    }
  },

  async fetch(request: Request, env: any) {
    this.initialize();

    try {
      const inner = async (request: Request) => {
        return router.handle(request, env);
      };
      const corsWrapped = corsHelper.wrapRequestHandler(inner);
      const wsWrapped = wrapForWebSocketError(corsWrapped);
      return await wsWrapped(request);
    } catch (err) {
      const data = {
        ERROR: {
          description: err.description,
          stack: err.stack,
          message: err.message,
          runtimeId,
        },
      };
      const response = new Response(JSON.stringify(data), { status: 500 });
      response.headers.append("Content-Type", "application/json");
      return response;
    }
  },
};

export { LogTopic, mod as default };
