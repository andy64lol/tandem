const http = require("http");
const Context = require("./context");

class App {
  constructor() {
    this.router = null;
  }

  useRouter(router) {
    this.router = router;
  }

  listen(port, cb) {
    const server = http.createServer((req, res) => {
      const ctx = new Context(req, res);

      const route = this.router.match(req.method, req.url);

      if (!route) {
        res.statusCode = 404;
        return res.end("Not Found");
      }

      route.handler(ctx);
    });

    server.listen(port, cb);
  }
}

module.exports = App;