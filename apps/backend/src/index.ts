import express from 'express'
import 'express-async-errors'
import { router } from './routes/index'
import { errorMiddleware } from './middleware/error.middleware'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/v1', router)
app.use(errorMiddleware)

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`)
})
