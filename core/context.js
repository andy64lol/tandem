class Context {
  constructor(req, res) {
    this.req    = req
    this.res    = res
    this.method = req.method
    this.url    = req.url
    this.params = {}
    this.query  = {}
    this.state  = {}
    this.res.statusCode = 200
  }

  status(code) {
    this.res.statusCode = code
    return this
  }

  set(key, value) {
    this.res.setHeader(key, value)
    return this
  }

  get(key) {
    return this.req.headers[key.toLowerCase()]
  }

  json(data) {
    this.res.setHeader('Content-Type', 'application/json')
    this.res.end(JSON.stringify(data))
  }

  send(data) {
    if (data !== null && typeof data === 'object') return this.json(data)
    this.res.end(String(data))
  }

  html(data) {
    this.res.setHeader('Content-Type', 'text/html; charset=utf-8')
    this.res.end(data)
  }

  text(data) {
    this.res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    this.res.end(data)
  }

  redirect(location, code = 302) {
    this.res.statusCode = code
    this.res.setHeader('Location', location)
    this.res.end()
  }

  body() {
    if (this._cachedBody !== undefined) return Promise.resolve(this._cachedBody)

    return new Promise((resolve, reject) => {
      const chunks = []

      this.req.on('data', c => chunks.push(c))
      this.req.on('error', reject)
      this.req.on('end', () => {
        const raw = Buffer.concat(chunks).toString()
        const ct = this.req.headers['content-type'] || ''

        if (ct.includes('application/json')) {
          try { this._cachedBody = JSON.parse(raw) }
          catch { this._cachedBody = raw }
        } else if (ct.includes('application/x-www-form-urlencoded')) {
          this._cachedBody = Object.fromEntries(new URLSearchParams(raw))
        } else {
          this._cachedBody = raw
        }

        resolve(this._cachedBody)
      })
    })
  }

  cookies() {
    const header = this.req.headers['cookie']
    if (!header) return {}

    return Object.fromEntries(
      header.split(';').map(p => {
        const [k, ...v] = p.trim().split('=')
        return [k.trim(), decodeURIComponent(v.join('='))]
      })
    )
  }
}

module.exports = Context
