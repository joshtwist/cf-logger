export class LogEngine {
  async postHandler(request: any, env: any) {
    
    // TODO
    // 1. Send off write to storage
    // 2. Send off to topic DO
    // 3. ACK 

    /*
    {
      logs : [
        { 
          sourceTime: 'ZULU DATE',
          message: 'short message',
          level: 'Critical', 'Error', 'Warn', 'Info', 'Debug',
          description: '',
          data : { JSON },
          source: ''
          traceId: 'GUID'
        }
      ]
    }
    */

    const topicId = request.params.topicId as string;

    // TODO - need to do some safety checking before sending shit to clients

    const id = env.LOGTOPIC.idFromName(topicId);
    const stub = env.LOGTOPIC.get(id);
    await stub.fetch(request);

    return new Response();
  }

  async listenHandler(request: any, env: any) {

    const path = new URL(request.url).pathname;

    if (request.headers.get('Upgrade') != 'websocket') {
      return new Response('Not found', {
        status: 404,
        headers: {
          pathname: path,
          upgrade: request.headers.get('Upgrade') || '',
        },
      });
    }

    const topicId = request.params.topicId as string;
    const id = env.LOGTOPIC.idFromName(topicId);
    const stub = env.LOGTOPIC.get(id);
    const response = stub.fetch(request);
    return response;
  }
} 