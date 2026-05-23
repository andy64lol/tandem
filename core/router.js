class Router {
  constructor() {
    this.routes = [];
  }

  get(path, handler) {
    this.routes.push({ method: 'GET', path, handler });
  }

  match(method, path) {
    return this.routes.find(r => r.method === method && r.path === url);
  }
}

module.exports = Router;