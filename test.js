const { Router } = require('itty-router');


const router = Router();

router.post('/:foo', req => {
  console.log('hello');
  console.log(req);
});


const route = router.handle({ url: 'https://example.com/pos', method: 'POST'});

console.log(route);