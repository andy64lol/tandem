const http    = require('http')
const Context = require('./context')

class App {
  constructor() {
    this._middleware   = []
    this._routers      = []
    this._errorHandler = (err, ctx) => {
      ctx.res.statusCode = err.status || 500
      ctx.res.end(err.message || 'Internal Server Error')
    }
  }

  use(fn) {
    if (fn && typeof fn.match === 'function') {
      this._routers.push(fn)
    } else {
      this._middleware.push(fn)
    }
    return this
  }

  useRouter(router) {
    this._routers.push(router)
    return this
  }

  onError(fn) {
    this._errorHandler = fn
    return this
  }

  async _dispatch(ctx) {
    let i = -1

    const next = async index => {
      if (index <= i) throw new Error('next() called multiple times')
      i = index
      const fn = this._middleware[index]
      if (fn) await fn(ctx, () => next(index + 1))
    }

    await next(0)

    for (const router of this._routers) {
      const match = router.match(ctx.method, ctx.url)

      if (match) {
        ctx.params = match.params
        ctx.query  = match.qs ? Object.fromEntries(new URLSearchParams(match.qs)) : {}

        const h = match.handler
        if (Array.isArray(h)) {
          for (const fn of h) await fn(ctx)
        } else {
          await h(ctx)
        }
        return
      }
    }

    ctx.res.statusCode = 404
    ctx.res.end('Not Found')
  }

  listen(port, cb) {
    const server = http.createServer({ keepAlive: true, keepAliveTimeout: 5000 }, (req, res) => {
      const ctx = new Context(req, res)
      this._dispatch(ctx).catch(err => this._errorHandler(err, ctx))
    })

    server.maxHeadersCount = 100
    server.headersTimeout  = 10000
    server.requestTimeout  = 30000

    server.listen(port, '0.0.0.0', cb)
    return server
  }
}

module.exports = App
