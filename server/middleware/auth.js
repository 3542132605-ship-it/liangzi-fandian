const jwt = require('jsonwebtoken')
const config = require('../config')
const { unauth } = require('../utils/response')

/**
 * 顾客端鉴权 — 从 header Authorization: Bearer <token> 解析
 */
exports.customerAuth = async (ctx, next) => {
  const token = ctx.header.authorization?.replace('Bearer ', '')
  if (!token) {
    ctx.body = unauth()
    return
  }
  try {
    const decoded = jwt.verify(token, config.jwt.secret)
    if (decoded.type !== 'customer') {
      ctx.body = unauth('无效的token类型')
      return
    }
    ctx.state.user = decoded
    await next()
  } catch (e) {
    ctx.body = unauth('登录已过期，请重新登录')
  }
}

/**
 * 管理端鉴权 — 同样从 header 解析
 */
exports.staffAuth = async (ctx, next) => {
  const token = ctx.header.authorization?.replace('Bearer ', '')
  if (!token) {
    ctx.body = unauth()
    return
  }
  try {
    const decoded = jwt.verify(token, config.jwt.secret)
    if (decoded.type !== 'staff') {
      ctx.body = unauth('无效的token类型')
      return
    }
    ctx.state.user = decoded
    await next()
  } catch (e) {
    ctx.body = unauth('登录已过期，请重新登录')
  }
}
