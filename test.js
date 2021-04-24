const re = /\/listen\/(\S*)?/g;
const s = "/listen/foo";
console.log(s.match(re));

var p = re.exec(s);

console.log(p);
