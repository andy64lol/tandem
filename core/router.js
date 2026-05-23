class Router {
  constructor() {
    this._static  = new Map()
    this._dynamic = []
  }

  _add(method, path, handlers) {
    const handler = handlers.length === 1 ? handlers[0] : handlers

    if (!path.includes(':') && !path.includes('*')) {
      this._static.set(method + path, handler)
      return
    }

    const segments  = path.split('/').filter(Boolean)
    const paramNames = []
    const pattern = segments.map(s => {
      if (s[0] === ':') {
        paramNames.push(s.slice(1))
        return null
      }
      return s
    })

    this._dynamic.push({ method, pattern, paramNames, handler })
  }

  get(path, ...h)     { this._add('GET',     path, h) }
  post(path,  ...h)   { this._add('POST',    path, h) }
  put(path,   ...h)   { this._add('PUT',     path, h) }
  patch(path, ...h)   { this._add('PATCH',   path, h) }
  del(path,   ...h)   { this._add('DELETE',  path, h) }
  head(path,  ...h)   { this._add('HEAD',    path, h) }
  options(path, ...h) { this._add('OPTIONS', path, h) }

  match(method, url) {
    const qi   = url.indexOf('?')
    const path = qi === -1 ? url : url.slice(0, qi)
    const qs   = qi === -1 ? '' : url.slice(qi + 1)

    const handler = this._static.get(method + path)
    if (handler) return { handler, params: {}, qs }

    const parts = path.split('/').filter(Boolean)

    for (const route of this._dynamic) {
      if (route.method !== method) continue
      if (route.pattern.length !== parts.length) continue

      let ok = true
      let pi = 0
      const params = {}

      for (let i = 0; i < route.pattern.length; i++) {
        if (route.pattern[i] === null) {
          params[route.paramNames[pi++]] = parts[i]
        } else if (route.pattern[i] !== parts[i]) {
          ok = false
          break
        }
      }

      if (ok) return { handler: route.handler, params, qs }
    }

    return null
  }
}

module.exports = Router
