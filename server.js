const App    = require('./core/app')
const Router = require('./core/router')
const { logger, cors } = require('./core/middleware')

const app    = new App()
const router = new Router()

app.use(logger())
app.use(cors())

router.get('/', ctx => {
  ctx.json({ message: 'Tandem is running', version: '1.0.0' })
})

router.get('/ping', ctx => {
  ctx.send('pong')
})

router.get('/user/:id', ctx => {
  ctx.json({ userId: ctx.params.id })
})

router.post('/echo', async ctx => {
  const body = await ctx.body()
  ctx.json({ echo: body })
})

router.get('/status', ctx => {
  ctx.status(200).json({ status: 'ok', uptime: process.uptime() })
})

app.useRouter(router)

module.exports = app
