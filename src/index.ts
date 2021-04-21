import { Banana } from './dep';
import ie from 'is-even';

export default {
  async fetch(request: Request, env: any) {
    const b = new Banana();
    ie(3)
    return new Response(`hello from TS: ${b.color}, ${ie(1)}, ${ie(2)}`);
  }
}
