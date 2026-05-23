# ⚡ Tandem

A minimal, high-speed Node.js backend framework built for simplicity and performance.

---

## What is Tandem?

Tandem is a lightweight backend framework for Node.js focused on:
- minimal overhead
- fast routing
- simple API design

---

## Installation

```bash
npm install tandem-js
```

---

## Quickstart

```js
const { App, Router } = require("tandem-js");

const app = new App();
const router = new Router();

router.get("/", (ctx) => {
  ctx.send("Hello from Tandem ⚡");
});

app.useRouter(router);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```