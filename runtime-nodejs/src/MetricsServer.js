const http = require('http');

module.exports = class MetricsServer {

  constructor({ port, getMetrics, tracker }) {
    this.port = port;
    this.getMetrics = getMetrics;
    this._tracker = tracker;
  }

  serveMetrics(res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(this.getMetrics());
  }

  serveRerun(res) {
    console.log('Rerun endpoint called');
    this._tracker.modifyAll();
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('{}');
  }

  start() {
    this.server = http.createServer((req, res) => {
      //console.log('req', req.url, req.headers);
      if ('/metrics' == req.url) return this.serveMetrics(res);
      if ('POST' == req.method && '/rerun' == req.url) return this.serveRerun(res);
      res.writeHead(404, { 'Content-Length': '0' });
      res.end();
    });
    this.server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
    this.server.listen(this.port, '0.0.0.0');
    console.log('Server listening on port', this.port);
  }

  stop() {
    this.server.close();
  }

}