export class WebSocketHelper {
  constructor() {
    this.sessions = new Array<Session>();
    this.messageHandlers = new Array<MessageHandler>();
    this.errorHandlers = new Array<ErrorHandler>();
    this.closeHandlers = new Array<CloseHandler>();
  }

  sessions: Session[];
  messageHandlers: Array<MessageHandler>;
  errorHandlers: Array<ErrorHandler>;
  closeHandlers: Array<CloseHandler>;

  

  async handleWebSocketUpgrade(request: Request, clientId: string) {
    if (request.headers.get("Upgrade") !== "websocket") {
      throw new Error(`Upgrade header not 'websocket' or not present`);
    }

    const pair = new WebSocketPair();
    const webSocket = pair[1];
    webSocket.accept();

    const session = new Session(webSocket, clientId);
    this.sessions.push(session);

    webSocket.addEventListener("message", async (msg) => {
      this.messageHandlers.forEach((mh) => {
        // TODO should this be async/await?
        mh(msg, session);
      });
    });

    webSocket.addEventListener("close", async (evt) => {
      this.closeHandlers.forEach((ch) => {
        ch(evt, session);
      });
    });

    webSocket.addEventListener("error", async (error) => {
      this.errorHandlers.forEach((eh) => {
        eh(error, session);
      });
    });
  }

  addMessageListener(handler: MessageHandler) {
    this.messageHandlers.push(handler);
  }

  addErrorListener(handler: ErrorHandler) {
    this.errorHandlers.push(handler);
  }

  addCloseListener(handler: CloseHandler) {
    this.closeHandlers.push(handler);
  }

  sendToClientId(message: string, clientId: string) {
    const session = this.sessions.find((s) => s.clientId === clientId);
    if (!session) {
      return false;
    }

    try {
      session.webSocket.send(message);
    } catch (error) {
      session.quit = true;
      this.sessions.splice(this.sessions.indexOf(session), 1);
    }
  }

  broadcast(message: string, excludeClientId?: string) {
    this.sessions = this.sessions.filter((session) => {
      if (session.quit) {
        return false;
      }

      if (excludeClientId && session.clientId === excludeClientId) {
        // no need to send, but don't remove from session roster
        return true;
      }

      try {
        session.webSocket.send(message);
      } catch (error) {
        session.quit = true;
        return false;
      }

      return true;
    });
  }
}

export type MessageHandler = (message: MessageEvent, session: Session) => void;
export type CloseHandler = (event: CloseEvent, session: Session) => void;
export type ErrorHandler = (error: Event, session: Session) => void;
export type RequestHandler = (request: Request) => Promise<Response>;

export class Session {
  constructor(webSocket: WebSocket, clientId: string) {
    this.webSocket = webSocket;
    this.clientId = clientId;
    this.quit = false;
  }
  clientId: string;
  webSocket: WebSocket;
  quit: boolean;
}

export async function handleWebSocketError (requestHandler: RequestHandler, request: Request) {
  try {
    return await requestHandler(request);
  } catch (err) {
    if (request.headers.get("Upgrade") == "websocket") {
      const data = {
        ERROR: {
          message: err.message,
          stack: err.stack,
          description: err.description,
        },
      };

      const pair = new WebSocketPair();
      pair[1].accept();
      pair[1].send(JSON.stringify(data));
      pair[1].close(1011, 'Uncaught exception during session setup');
    }
  }
}
