import { Hono } from 'hono'

const app = new Hono()

const router = app

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export type AppType = typeof router
export default app
