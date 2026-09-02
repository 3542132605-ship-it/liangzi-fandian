const jwt = require('jsonwebtoken')
const config = require('../config')
const { pool } = require('../models')
const { success, fail } = require('../utils/response')
const dayjs = require('dayjs')

// POST /api/customer/login
// body: { phone?: string, nickname?: string }
// mock: 若无手机号则自动创建游客
exports.login = async (ctx) => {
  const { phone, nickname } = ctx.request.body || {}
  const nick = nickname || '顾客' + Math.floor(Math.random() * 9000 + 1000)

  // mock: 查找或创建用户(用 openid 字段存 mock 标识)
  let userId
  const mockOpenid = 'mock_' + (phone || Date.now())
  const [rows] = await pool.execute('SELECT id FROM users WHERE openid = ?', [mockOpenid])
  if (rows.length > 0) {
    userId = rows[0].id
    if (nickname) await pool.execute('UPDATE users SET nickname = ? WHERE id = ?', [nick, userId])
  } else {
    const [result] = await pool.execute(
      'INSERT INTO users (openid, nickname, phone) VALUES (?, ?, ?)',
      [mockOpenid, nick, phone || '']
    )
    userId = result.insertId
  }

  const token = jwt.sign(
    { type: 'customer', userId, openid: mockOpenid },
    config.jwt.secret,
    { expiresIn: config.jwt.customerExpires }
  )
  ctx.body = success({ token, userId, nickname: nick })
}

// GET /api/customer/categories
exports.getCategories = async (ctx) => {
  const [rows] = await pool.execute('SELECT id, name, sort, icon FROM categories WHERE status = 1 ORDER BY sort')
  ctx.body = success(rows)
}

// GET /api/customer/products?category_id=xx
exports.getProducts = async (ctx) => {
  const { category_id } = ctx.query
  let sql = `SELECT p.id, p.category_id, p.name, p.image, p.description, p.price, p.status, p.is_hot, p.sort
             FROM products p WHERE p.status IN (1, 2)`
  const params = []
  if (category_id) {
    sql += ' AND p.category_id = ?'
    params.push(category_id)
  }
  sql += ' ORDER BY p.sort, p.id'
  const [products] = await pool.execute(sql, params)

  // 查询规格
  if (products.length > 0) {
    const pids = products.map(p => p.id)
    const placeholders = pids.map(() => '?').join(',')
    const [specs] = await pool.execute(
      `SELECT id, product_id, name, value, price, sort FROM product_specs WHERE product_id IN (${placeholders}) ORDER BY sort`,
      pids
    )
    const specMap = {}
    specs.forEach(s => {
      if (!specMap[s.product_id]) specMap[s.product_id] = []
      specMap[s.product_id].push(s)
    })
    products.forEach(p => { p.specs = specMap[p.id] || [] })
  }

  ctx.body = success(products)
}

// GET /api/customer/products/:id
exports.getProductDetail = async (ctx) => {
  const { id } = ctx.params
  const [rows] = await pool.execute(
    'SELECT id, category_id, name, image, description, price, status, is_hot FROM products WHERE id = ?',
    [id]
  )
  if (rows.length === 0) { ctx.body = fail('菜品不存在'); return }
  const product = rows[0]
  const [specs] = await pool.execute(
    'SELECT id, name, value, price, sort FROM product_specs WHERE product_id = ? ORDER BY sort',
    [id]
  )
  product.specs = specs
  ctx.body = success(product)
}

// POST /api/customer/orders
exports.createOrder = async (ctx) => {
  const userId = ctx.state.user.userId
  const { type, table_no, address_id, people_count, remark, items } = ctx.request.body || {}

  if (!items || !items.length) { ctx.body = fail('请选择菜品'); return }
  if (!type || !['dine_in', 'delivery'].includes(type)) { ctx.body = fail('订单类型错误'); return }
  if (type === 'dine_in' && !table_no) { ctx.body = fail('堂食请选择桌号'); return }
  if (type === 'delivery' && !address_id) { ctx.body = fail('外卖请选择收货地址'); return }

  // 查菜品信息+计算金额
  const pids = items.map(i => i.product_id)
  const placeholders = pids.map(() => '?').join(',')
  const [products] = await pool.execute(
    `SELECT id, name, price, status FROM products WHERE id IN (${placeholders})`,
    pids
  )
  const productMap = {}
  products.forEach(p => { productMap[p.id] = p })

  // 查规格价格
  const specIds = items.filter(i => i.spec_id).map(i => i.spec_id)
  let specMap = {}
  if (specIds.length > 0) {
    const specPh = specIds.map(() => '?').join(',')
    const [specs] = await pool.execute(
      `SELECT id, product_id, value, price FROM product_specs WHERE id IN (${specPh})`,
      specIds
    )
    specs.forEach(s => { specMap[s.id] = s })
  }

  let totalAmount = 0
  const orderItems = []
  for (const item of items) {
    const product = productMap[item.product_id]
    if (!product) { ctx.body = fail(`菜品不存在: ${item.product_id}`); return }
    if (product.status === 0) { ctx.body = fail(`菜品已下架: ${product.name}`); return }
    if (product.status === 2) { ctx.body = fail(`菜品已售罄: ${product.name}`); return }

    let price = Number(product.price)
    let specName = ''
    if (item.spec_id && specMap[item.spec_id]) {
      const spec = specMap[item.spec_id]
      price = Number(spec.price)
      specName = spec.value
    }

    const qty = Math.max(1, parseInt(item.quantity) || 1)
    totalAmount += price * qty
    orderItems.push({ product_id: product.id, product_name: product.name, spec_name: specName, price, quantity: qty })
  }

  // 起送价校验(外卖)
  if (type === 'delivery') {
    const [configRows] = await pool.execute("SELECT value FROM config WHERE `key` = 'delivery_min_price'")
    const minPrice = configRows.length > 0 ? Number(configRows[0].value) : 0
    if (totalAmount < minPrice) { ctx.body = fail(`未达起送价¥${minPrice}，还差¥${(minPrice - totalAmount).toFixed(2)}`); return }
  }

  // 桌台ID
  let tableId = 0
  if (type === 'dine_in' && table_no) {
    const [tableRows] = await pool.execute('SELECT id FROM tables WHERE table_no = ?', [table_no])
    if (tableRows.length > 0) tableId = tableRows[0].id
  }

  // 生成订单号
  const orderNo = 'LZ' + dayjs().format('YYYYMMDDHHmmss') + Math.floor(Math.random() * 9000 + 1000)

  // 写入
  const [result] = await pool.execute(
    'INSERT INTO orders (order_no, user_id, table_id, type, total_amount, delivery_fee, status, address_id, people_count, remark) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)',
    [orderNo, userId, tableId, type, totalAmount.toFixed(2), 'pending', address_id || 0, people_count || 1, remark || '']
  )
  const orderId = result.insertId

  for (const oi of orderItems) {
    await pool.execute(
      'INSERT INTO order_items (order_id, product_id, product_name, spec_name, price, quantity, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [orderId, oi.product_id, oi.product_name, oi.spec_name, oi.price.toFixed(2), oi.quantity, 'pending']
    )
  }

  ctx.body = success({ orderId, orderNo, totalAmount, status: 'pending' })
}

// POST /api/customer/orders/:id/pay
exports.mockPay = async (ctx) => {
  const { id } = ctx.params
  const userId = ctx.state.user.userId
  const [rows] = await pool.execute('SELECT id, status, user_id, order_no FROM orders WHERE id = ?', [id])
  if (rows.length === 0) { ctx.body = fail('订单不存在'); return }
  const order = rows[0]
  if (order.user_id !== userId) { ctx.body = fail('无权操作'); return }
  if (order.status !== 'pending') { ctx.body = fail('订单状态不可支付'); return }

  await pool.execute("UPDATE orders SET status = 'cooking' WHERE id = ?", [id])
  await pool.execute(
    "INSERT INTO order_flow (order_id, staff_id, action, remark) VALUES (?, 0, 'pay', 'mock支付成功')",
    [id]
  )
  ctx.body = success({ orderId: id, orderNo: order.order_no, status: 'cooking' })
}

// GET /api/customer/orders
exports.getOrders = async (ctx) => {
  const userId = ctx.state.user.userId
  const { type, status } = ctx.query
  let sql = 'SELECT id, order_no, type, total_amount, status, people_count, remark, created_at FROM orders WHERE user_id = ?'
  const params = [userId]
  if (type) { sql += ' AND type = ?'; params.push(type) }
  if (status) { sql += ' AND status = ?'; params.push(status) }
  sql += ' ORDER BY created_at DESC'
  const [rows] = await pool.execute(sql, params)
  ctx.body = success(rows)
}

// GET /api/customer/orders/:id
exports.getOrderDetail = async (ctx) => {
  const { id } = ctx.params
  const userId = ctx.state.user.userId
  const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId])
  if (orders.length === 0) { ctx.body = fail('订单不存在'); return }
  const order = orders[0]
  const [items] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [id])
  order.items = items
  ctx.body = success(order)
}

// POST /api/customer/orders/:id/cancel
exports.cancelOrder = async (ctx) => {
  const { id } = ctx.params
  const userId = ctx.state.user.userId
  const [rows] = await pool.execute('SELECT id, status, user_id FROM orders WHERE id = ?', [id])
  if (rows.length === 0) { ctx.body = fail('订单不存在'); return }
  if (rows[0].user_id !== userId) { ctx.body = fail('无权操作'); return }
  if (rows[0].status !== 'pending') { ctx.body = fail('仅待支付订单可取消'); return }
  await pool.execute("UPDATE orders SET status = 'canceled' WHERE id = ?", [id])
  ctx.body = success(null, '已取消')
}

// GET /api/customer/addresses
exports.getAddresses = async (ctx) => {
  const userId = ctx.state.user.userId
  const [rows] = await pool.execute('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [userId])
  ctx.body = success(rows)
}

// POST /api/customer/addresses
exports.addAddress = async (ctx) => {
  const userId = ctx.state.user.userId
  const { name, phone, province, city, district, detail, is_default } = ctx.request.body || {}
  if (!name || !phone || !detail) { ctx.body = fail('请填写完整地址信息'); return }
  if (is_default) {
    await pool.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId])
  }
  const [result] = await pool.execute(
    'INSERT INTO addresses (user_id, name, phone, province, city, district, detail, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, name, phone, province || '', city || '', district || '', detail, is_default ? 1 : 0]
  )
  ctx.body = success({ id: result.insertId })
}

// PUT /api/customer/addresses/:id
exports.updateAddress = async (ctx) => {
  const userId = ctx.state.user.userId
  const { id } = ctx.params
  const { name, phone, province, city, district, detail, is_default } = ctx.request.body || {}
  const [rows] = await pool.execute('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [id, userId])
  if (rows.length === 0) { ctx.body = fail('地址不存在'); return }
  if (is_default) {
    await pool.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId])
  }
  await pool.execute(
    'UPDATE addresses SET name=?, phone=?, province=?, city=?, district=?, detail=?, is_default=? WHERE id=? AND user_id=?',
    [name || '', phone || '', province || '', city || '', district || '', detail || '', is_default ? 1 : 0, id, userId]
  )
  ctx.body = success(null, '更新成功')
}

// DELETE /api/customer/addresses/:id
exports.deleteAddress = async (ctx) => {
  const userId = ctx.state.user.userId
  const { id } = ctx.params
  await pool.execute('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId])
  ctx.body = success(null, '删除成功')
}

// POST /api/customer/table/decode
exports.decodeTable = async (ctx) => {
  const { table_no, token } = ctx.request.body || {}
  let tNo = table_no
  // mock: 暂不解密 JWT token,直接用 table_no
  if (!tNo) { ctx.body = fail('无效的桌号'); return }
  const [rows] = await pool.execute('SELECT id, table_no, status FROM tables WHERE table_no = ?', [tNo])
  if (rows.length === 0) { ctx.body = fail('桌号不存在'); return }
  ctx.body = success(rows[0])
}
