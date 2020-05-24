console.log('Reporter loaded');


const http2 = require('http2');
const {
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_CONTENT_TYPE
} = http2.constants;

class MetricsServer {

  constructor({ port }) {
    console.log('metrics server init', port);
    this.port = port;
  }

  start() {
    this.server = http2.createServer(this.serverOptions);
    this.server.on('stream', (stream, headers, flags) => {
      const method = headers[HTTP2_HEADER_METHOD];
      const path = headers[HTTP2_HEADER_PATH];
      // ...
      stream.respond({
        [HTTP2_HEADER_STATUS]: 200,
        [HTTP2_HEADER_CONTENT_TYPE]: 'text/plain'
      });
      stream.write('hello ');
      stream.end('world');
    });
    this.server.listen(this.port);
  }

}

class MyCustomReporter {

  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
    //console.log('Reporter constructed');
    this.server = new MetricsServer({ port: 9090 });
    this.server.start();
  }

  onRunStart() {
    //console.log('onRunStart', arguments);
  }
  
  onTestStart() {
    //console.log('onTestStart', arguments);
  }
  
  onTestResult(test, testResult, aggregatedResult) {
    console.log('onTestResult', testResult);
  }

  onRunComplete(contexts, results) {
    //console.log('Complete!', contexts, results);
    // TODO exit server
  }
}

module.exports = MyCustomReporter;
