const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});

server.listen(3000, '0.0.0.0', () => {
  console.log('tmp-server listening on 3000');
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
