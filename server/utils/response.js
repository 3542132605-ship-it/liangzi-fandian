/**
 * 统一响应格式 { code, msg, data }
 */
exports.success = (data = null, msg = 'success') => {
  return { code: 1, msg, data }
}

exports.fail = (msg = '操作失败', code = 0) => {
  return { code, msg, data: null }
}

exports.unauth = (msg = '未登录或登录已过期') => {
  return { code: -1, msg, data: null }
}
