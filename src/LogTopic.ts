import { WebSocketHelper } from './WebSocketHelper';
import { v4 as uuidv4 } from 'uuid';

export class LogTopic {
  constructor(state: any, env: any) {
  
    this.wsh = new WebSocketHelper();
  
    this.wsh.addMessageListener((message, session) => {
      // TODO 
      // Broadcast to listeners as appropriate
    });
  }

  wsh : WebSocketHelper;

  async fetch(request: Request) {
    const path = new URL(request.url).pathname;

    if (path !== '/listen' || request.headers.get('Upgrade') != 'websocket') {
      return new Response('Not found', {
        status: 404,
        headers: {
          pathname: path,
          upgrade: request.headers.get('Upgrade') || '',
        },
      });
    }

    // TODO probably need a better client ID?
    const clientId = uuidv4();

    return await this.wsh.handleWebSocketUpgrade(request, clientId);
  }
}