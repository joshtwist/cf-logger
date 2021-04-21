import { Banana } from './dep';

export default {
  async fetch(request: Request, env: any) {
    const b = new Banana();
    return new Response(`hello from TS: ${b.color}`);
  }
}
