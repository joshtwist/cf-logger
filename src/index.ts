import { Router } from "itty-router";
import { v4 as uuidv4 } from "uuid";
import { LogEngine } from "./LogEngine";
import { handleWebSocketError } from "./WebSocketHelper";
import { LogTopic } from "./LogTopic"

const defaultRuntimeId = "not-initialized";
let runtimeId = defaultRuntimeId;
const router = Router();
const logEngine = new LogEngine();

router.get(
  "/",
  () =>
    new Response(
      `Hello from instance ${runtimeId} @ ${new Date().toISOString()}`
    )
);
router.post("/log/:topicId", logEngine.postHandler);

const mod = {
  initialize() {
    if (runtimeId === defaultRuntimeId) {
      runtimeId = uuidv4();
    }
  },

  async fetch(request: Request, env: any) {
    this.initialize();
    try {
      return await handleWebSocketError(r => {
        return router.handle(r)
      }, request);
    } catch (err) {
      const data = {
        ERROR: {
          description: err.description,
          stack: err.stack,
          message: err.message,
        },
      };
      const response = new Response(JSON.stringify(data), { status: 500 });
      response.headers.append("Content-Type", "application/json");
      return response;
    }
  },
};

export { LogTopic, mod as default }

