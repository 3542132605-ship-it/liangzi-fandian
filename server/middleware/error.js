module.exports = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    console.error('[Error]', err.message, err.stack)
    ctx.status = err.status || 500
    ctx.body = {
      code: err.code || 0,
      msg: err.message || '服务器内部错误',
      data: null
    }
  }
}
