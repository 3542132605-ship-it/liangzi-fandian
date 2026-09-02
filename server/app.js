const Koa = require('koa')
const { bodyParser } = require('@koa/bodyparser')
const cors = require('koa2-cors')
const config = require('./config')
const errorHandler = require('./middleware/error')

// 路由(稍后创建)
const customerRoutes = require('./routes/customer')
const manageRoutes = require('./routes/manage')

// 定时任务
const soldoutRecovery = require('./jobs/soldout-recovery')

const app = new Koa()

// 全局错误处理
app.use(errorHandler)

// CORS
app.use(cors({
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// 请求体解析
app.use(bodyParser({
  jsonLimit: '10mb',
  formLimit: '10mb'
}))

// 路由挂载
app.use(customerRoutes.routes(), customerRoutes.allowedMethods())
app.use(manageRoutes.routes(), manageRoutes.allowedMethods())

// 健康检查
app.use(async (ctx) => {
  if (ctx.path === '/') {
    ctx.body = { code: 1, msg: '良子饭店后端服务运行中', data: { version: '1.0.0' } }
  }
})

// 启动定时任务：每日00:00售罄自动恢复上架
soldoutRecovery.start()

// 启动
const PORT = config.port
app.listen(PORT, () => {
  console.log(`[良子饭店] 后端服务已启动: http://localhost:${PORT}`)
})

module.exports = app
