

const fs = require('fs');
const path = require('path');
const { handler } = require('./index');

const rawEvent = fs.readFileSync(path.join(__dirname, 'event.json'), 'utf-8');
const event = JSON.parse(rawEvent);

handler(event)
  .then((res) => console.log('Lambda completed:', res))
  .catch((err) => console.error('Lambda error:', err));
