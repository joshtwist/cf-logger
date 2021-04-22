export class LogEngine {
  async postHandler(request: Request) {
    return new Response(JSON.stringify(request));
  }
}