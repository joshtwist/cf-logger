import { WebSocketHelper } from "./WebSocketHelper";

export class LogTopic implements DurableObject {

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
    this.wsh = new WebSocketHelper();
  }

  wsh: WebSocketHelper; 
  state: DurableObjectState;
  env: any;

  async fetch(request: Request) {    
    
    const path = new URL(request.url).pathname;

    if (path.includes("/listen")) {
      return await this.handleWebSocket(request);
    }
    else if (path.includes("/log")) {
      return await this.handleLog(request); 
    }
    else {
      return new Response("Not found", { status: 404 });
    }
  }

  async handleLog(request: Request) {
    const body = await request.text();
    this.wsh.broadcast(body);
    return new Response("Ack :)");
  }

  async handleWebSocket(request: Request) {
    const path = new URL(request.url).pathname;
    const re = /^\/listen\/(\S*)$/g;
      const match = re.exec(path);
      if (!match) {
        throw new Error(`Invalid Topic ID on URL: ${path}`);
      }
      const topicId = match[1];
  
      if (request.headers.get('Upgrade') != 'websocket') {
        return new Response('Not found', {
          status: 404,
          headers: {
            pathname: path,
            upgrade: request.headers.get('Upgrade') || '',
          },
        });
      }
  
      return await this.wsh.handleWebSocketUpgrade(request, topicId);
  }
}


