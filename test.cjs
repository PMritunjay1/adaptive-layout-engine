require('ts-node').register({ transpileOnly: true });
const { sampleAd } = require('./src/data/sample-ad.ts');
const { sampleSurfaces } = require('./src/data/sample-surfaces.ts');
const { resolveLayout } = require('./src/engine/resolver.ts');

const broadcast = sampleSurfaces.find(s => s.id === 'broadcast-lower-third');
const layout = resolveLayout(sampleAd, broadcast);

console.log('Surface:', broadcast.width, 'x', broadcast.height);
layout.elements.forEach(el => {
  console.log(el.id, '->', 'x:', el.x, 'y:', el.y, 'w:', el.width, 'h:', el.height);
});
