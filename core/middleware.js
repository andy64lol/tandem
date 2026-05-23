function logger() {
  return async (ctx, next) => {
    const start = process.hrtime.bigint()
    await next()
    const ms = Number(process.hrtime.bigint() - start) / 1e6
    process.stdout.write(`${ctx.method} ${ctx.url} ${ctx.res.statusCode} ${ms.toFixed(2)}ms\n`)
  }
}

function cors(opts = {}) {
  const origin  = opts.origin  || '*'
  const methods = opts.methods || 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  const headers = opts.headers || 'Content-Type,Authorization'

  return async (ctx, next) => {
    ctx.res.setHeader('Access-Control-Allow-Origin', origin)
    ctx.res.setHeader('Access-Control-Allow-Methods', methods)
    ctx.res.setHeader('Access-Control-Allow-Headers', headers)

    if (ctx.method === 'OPTIONS') {
      ctx.res.statusCode = 204
      ctx.res.end()
      return
    }

    await next()
  }
}

module.exports = { logger, cors }
