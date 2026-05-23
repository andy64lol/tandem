const App = require("./core/app");
const Router = require("./core/router");

const app = new App();
const router = new Router();

router.get("/", (ctx) => {
  ctx.json({ message: "Tandem is running ⚡" });
});

router.get("/ping", (ctx) => {
  ctx.send("pong");
});

app.useRouter(router);

module.exports = app;