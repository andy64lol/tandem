const http   = require('http')
const assert = require('assert')
const App    = require('./core/app')
const Router = require('./core/router')

let server
let port = 14999

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null
    const opts = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...headers
      }
    }

    const req = http.request(opts, res => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString()
        let json
        try { json = JSON.parse(text) } catch { json = null }
        resolve({ status: res.statusCode, text, json, headers: res.headers })
      })
    })

    req.on('error', reject)
    if (payload) req.write(payload)
    req.end()
  })
}

async function run() {
  const app    = new App()
  const router = new Router()
  let mwRan    = false

  app.use(async (ctx, next) => { mwRan = true; await next() })

  router.get('/',         ctx => ctx.json({ ok: true }))
  router.get('/text',     ctx => ctx.send('hello'))
  router.get('/html',     ctx => ctx.html('<b>hi</b>'))
  router.get('/user/:id', ctx => ctx.json({ id: ctx.params.id }))
  router.get('/search',   ctx => ctx.json({ q: ctx.query.q }))
  router.post('/body',    async ctx => { const b = await ctx.body(); ctx.json({ received: b }) })
  router.get('/status',   ctx => ctx.status(201).json({ created: true }))
  router.get('/error',    () => { const e = new Error('boom'); e.status = 422; throw e })

  app.onError((err, ctx) => {
    ctx.res.statusCode = err.status || 500
    ctx.res.end(err.message)
  })

  app.useRouter(router)

  server = app.listen(port)
  await new Promise(r => server.once('listening', r))

  const tests = [
    ['GET /', async () => {
      const r = await request('GET', '/')
      assert.strictEqual(r.status, 200)
      assert.deepStrictEqual(r.json, { ok: true })
    }],
    ['middleware runs', async () => {
      await request('GET', '/')
      assert.ok(mwRan)
    }],
    ['GET /text sends plain text', async () => {
      const r = await request('GET', '/text')
      assert.strictEqual(r.text, 'hello')
    }],
    ['GET /html sends html', async () => {
      const r = await request('GET', '/html')
      assert.ok(r.headers['content-type'].includes('text/html'))
    }],
    ['GET /user/:id param extraction', async () => {
      const r = await request('GET', '/user/42')
      assert.deepStrictEqual(r.json, { id: '42' })
    }],
    ['GET /search query string parsing', async () => {
      const r = await request('GET', '/search?q=tandem')
      assert.deepStrictEqual(r.json, { q: 'tandem' })
    }],
    ['POST /body JSON body parsing', async () => {
      const r = await request('POST', '/body', { name: 'tandem' })
      assert.deepStrictEqual(r.json, { received: { name: 'tandem' } })
    }],
    ['GET /status custom status code', async () => {
      const r = await request('GET', '/status')
      assert.strictEqual(r.status, 201)
    }],
    ['404 for unknown route', async () => {
      const r = await request('GET', '/notfound')
      assert.strictEqual(r.status, 404)
    }],
    ['error handler catches throws', async () => {
      const r = await request('GET', '/error')
      assert.strictEqual(r.status, 422)
      assert.strictEqual(r.text, 'boom')
    }],
  ]

  let passed = 0
  let failed = 0

  for (const [name, fn] of tests) {
    try {
      await fn()
      console.log(`  PASS  ${name}`)
      passed++
    } catch (err) {
      console.error(`  FAIL  ${name}`)
      console.error(`        ${err.message}`)
      failed++
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`)
  server.close()
  if (failed > 0) process.exit(1)
}

run().catch(err => { console.error(err); process.exit(1) })
