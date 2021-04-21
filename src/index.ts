export default {
  async fetch(request: Request, env: any) {
    return new Response('hello from TS');
  }
}
