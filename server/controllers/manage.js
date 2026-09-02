const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const config = require('../config')
const { pool } = require('../models')
const { success, fail } = require('../utils/response')
const dayjs = require('dayjs')

exports.login = async (ctx) => {
  const { username, password } = ctx.request.body || {}
  if (!username || !password) { ctx.body = fail('请输入账号和密码'); return }
  const [rows] = await pool.execute('SELECT id, username, password_hash, name, role, status FROM staff WHERE username = ?', [username])
  if (rows.length === 0) { ctx.body = fail('账号不存在'); return }
  const staff = rows[0]
  if (staff.status === 0) { ctx.body = fail('账号已停用'); return }
  const match = await bcrypt.compare(password, staff.password_hash)
  if (!match) { ctx.body = fail('密码错误'); return }
  const token = jwt.sign(
    { type: 'staff', staffId: staff.id, role: staff.role, name: staff.name },
    config.jwt.secret,
    { expiresIn: config.jwt.staffExpires }
  )
  ctx.body = success({ token, staffId: staff.id, name: staff.name, role: staff.role })
}

exports.getDineInOrders = async (ctx) => {
  const { status } = ctx.query
  let sql = `SELECT o.id, o.order_no, o.table_id, o.total_amount, o.status, o.people_count, o.remark, o.created_at,
             t.table_no
             FROM orders o LEFT JOIN tables t ON o.table_id = t.id
             WHERE o.type = 'dine_in'`
  const params = []
  if (status) { sql += ' AND o.status = ?'; params.push(status) }
  else { sql += " AND o.status IN ('pending', 'cooking', 'partial_served', 'served')" }
  sql += ' ORDER BY t.table_no, o.created_at'
  const [orders] = await pool.execute(sql, params)

  // 查菜品明细
  if (orders.length > 0) {
    const oids = orders.map(o => o.id)
    const ph = oids.map(() => '?').join(',')
    const [items] = await pool.execute(
      `SELECT id, order_id, product_name, spec_name, price, quantity, status FROM order_items WHERE order_id IN (${ph})`,
      oids
    )
    const itemMap = {}
    items.forEach(i => { if (!itemMap[i.order_id]) itemMap[i.order_id] = []; itemMap[i.order_id].push(i) })
    orders.forEach(o => { o.items = itemMap[o.id] || [] })
  }
  ctx.body = success(orders)
}

exports.serveItem = async (ctx) => {
  const { order_id, item_id } = ctx.request.body || {}
  if (!order_id || !item_id) { ctx.body = fail('参数错误'); return }
  await pool.execute("UPDATE order_items SET status = 'served' WHERE id = ? AND order_id = ?", [item_id, order_id])

  // 检查是否全部上齐
  const [pending] = await pool.execute("SELECT COUNT(*) as cnt FROM order_items WHERE order_id = ? AND status = 'pending'", [order_id])
  if (pending[0].cnt === 0) {
    await pool.execute("UPDATE orders SET status = 'served' WHERE id = ?", [order_id])
  } else {
    await pool.execute("UPDATE orders SET status = 'partial_served' WHERE id = ? AND status = 'cooking'", [order_id])
  }
  ctx.body = success(null, '已标记上菜')
}

exports.serveAll = async (ctx) => {
  const { order_id } = ctx.request.body || {}
  if (!order_id) { ctx.body = fail('参数错误'); return }
  await pool.execute("UPDATE order_items SET status = 'served' WHERE order_id = ?", [order_id])
  await pool.execute("UPDATE orders SET status = 'served' WHERE id = ?", [order_id])
  ctx.body = success(null, '已全部上菜')
}

exports.completeDineIn = async (ctx) => {
  const { order_id } = ctx.request.body || {}
  if (!order_id) { ctx.body = fail('参数错误'); return }
  await pool.execute("UPDATE orders SET status = 'done' WHERE id = ? AND type = 'dine_in'", [order_id])
  ctx.body = success(null, '已标记完成')
}

exports.cancelDineIn = async (ctx) => {
  const { order_id } = ctx.request.body || {}
  if (!order_id) { ctx.body = fail('参数错误'); return }
  const [rows] = await pool.execute("SELECT id, status FROM orders WHERE id = ? AND type = 'dine_in'", [order_id])
  if (rows.length === 0) { ctx.body = fail('订单不存在'); return }
  if (rows[0].status !== 'pending') { ctx.body = fail('仅待支付订单可取消'); return }
  await pool.execute("UPDATE orders SET status = 'canceled' WHERE id = ?", [order_id])
  ctx.body = success(null, '已取消')
}

exports.getDeliveryOrders = async (ctx) => {
  const { status } = ctx.query
  let sql = `SELECT o.id, o.order_no, o.total_amount, o.status, o.remark, o.created_at, o.address_id,
             a.name as addr_name, a.phone as addr_phone, a.province, a.city, a.district, a.detail as addr_detail
             FROM orders o LEFT JOIN addresses a ON o.address_id = a.id
             WHERE o.type = 'delivery'`
  const params = []
  if (status) { sql += ' AND o.status = ?'; params.push(status) }
  else { sql += " AND o.status IN ('cooking', 'delivering', 'delivered')" }
  sql += ' ORDER BY o.created_at DESC'
  const [orders] = await pool.execute(sql, params)

  if (orders.length > 0) {
    const oids = orders.map(o => o.id)
    const ph = oids.map(() => '?').join(',')
    const [items] = await pool.execute(
      `SELECT id, order_id, product_name, spec_name, price, quantity, status FROM order_items WHERE order_id IN (${ph})`,
      oids
    )
    const itemMap = {}
    items.forEach(i => { if (!itemMap[i.order_id]) itemMap[i.order_id] = []; itemMap[i.order_id].push(i) })
    orders.forEach(o => { o.items = itemMap[o.id] || [] })
  }
  ctx.body = success(orders)
}

exports.startDelivery = async (ctx) => {
  const { order_id } = ctx.request.body || {}
  if (!order_id) { ctx.body = fail('参数错误'); return }
  await pool.execute("UPDATE orders SET status = 'delivering' WHERE id = ? AND type = 'delivery' AND status = 'cooking'", [order_id])
  ctx.body = success(null, '已开始配送')
}

exports.confirmDelivered = async (ctx) => {
  const { order_id } = ctx.request.body || {}
  if (!order_id) { ctx.body = fail('参数错误'); return }
  await pool.execute("UPDATE orders SET status = 'delivered' WHERE id = ? AND type = 'delivery' AND status = 'delivering'", [order_id])
  ctx.body = success(null, '已确认送达')
}

exports.completeDelivery = async (ctx) => {
  const { order_id } = ctx.request.body || {}
  if (!order_id) { ctx.body = fail('参数错误'); return }
  await pool.execute("UPDATE orders SET status = 'done' WHERE id = ? AND type = 'delivery' AND status = 'delivered'", [order_id])
  ctx.body = success(null, '已完成')
}

exports.getProducts = async (ctx) => {
  const { category_id } = ctx.query
  let sql = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1'
  const params = []
  if (category_id) { sql += ' AND p.category_id = ?'; params.push(category_id) }
  sql += ' ORDER BY p.category_id, p.sort, p.id'
  const [products] = await pool.execute(sql, params)

  if (products.length > 0) {
    const pids = products.map(p => p.id)
    const ph = pids.map(() => '?').join(',')
    const [specs] = await pool.execute(
      `SELECT id, product_id, name, value, price, sort FROM product_specs WHERE product_id IN (${ph}) ORDER BY sort`,
      pids
    )
    const specMap = {}
    specs.forEach(s => { if (!specMap[s.product_id]) specMap[s.product_id] = []; specMap[s.product_id].push(s) })
    products.forEach(p => { p.specs = specMap[p.id] || [] })
  }
  ctx.body = success(products)
}

exports.getProductDetail = async (ctx) => {
  const { id } = ctx.params
  const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id])
  if (rows.length === 0) { ctx.body = fail('菜品不存在'); return }
  const product = rows[0]
  const [specs] = await pool.execute('SELECT * FROM product_specs WHERE product_id = ? ORDER BY sort', [id])
  product.specs = specs
  ctx.body = success(product)
}

exports.addProduct = async (ctx) => {
  const { name, category_id, price, image, description, is_hot, specs } = ctx.request.body || {}
  if (!name || !category_id || price === undefined) { ctx.body = fail('请填写菜品名称、分类和价格'); return }
  const [result] = await pool.execute(
    'INSERT INTO products (category_id, name, image, description, price, status, is_hot) VALUES (?, ?, ?, ?, ?, 1, ?)',
    [category_id, name, image || '', description || '', price, is_hot ? 1 : 0]
  )
  const productId = result.insertId
  if (specs && specs.length > 0) {
    for (const s of specs) {
      await pool.execute(
        'INSERT INTO product_specs (product_id, name, value, price, sort) VALUES (?, ?, ?, ?, ?)',
        [productId, s.name || '规格', s.value, s.price || 0, s.sort || 0]
      )
    }
  }
  ctx.body = success({ id: productId }, '新增成功')
}

exports.updateProduct = async (ctx) => {
  const { id } = ctx.params
  const { name, category_id, price, image, description, is_hot, specs } = ctx.request.body || {}
  await pool.execute(
    'UPDATE products SET name=?, category_id=?, price=?, image=?, description=?, is_hot=? WHERE id=?',
    [name || '', category_id || 0, price || 0, image || '', description || '', is_hot ? 1 : 0, id]
  )
  // 更新规格:先删后插
  if (specs !== undefined) {
    await pool.execute('DELETE FROM product_specs WHERE product_id = ?', [id])
    for (const s of specs) {
      await pool.execute(
        'INSERT INTO product_specs (product_id, name, value, price, sort) VALUES (?, ?, ?, ?, ?)',
        [id, s.name || '规格', s.value, s.price || 0, s.sort || 0]
      )
    }
  }
  ctx.body = success(null, '更新成功')
}

exports.deleteProduct = async (ctx) => {
  const { id } = ctx.params
  await pool.execute('DELETE FROM product_specs WHERE product_id = ?', [id])
  await pool.execute('DELETE FROM products WHERE id = ?', [id])
  ctx.body = success(null, '删除成功')
}

exports.updateProductStatus = async (ctx) => {
  const { id } = ctx.params
  const { status } = ctx.request.body || {}
  if (![0, 1, 2].includes(status)) { ctx.body = fail('状态值无效'); return }
  await pool.execute('UPDATE products SET status = ? WHERE id = ?', [status, id])
  const statusText = { 1: '上架', 2: '售罄', 0: '下架' }
  ctx.body = success(null, '已切换为' + statusText[status])
}

exports.updateProductPrice = async (ctx) => {
  const { id } = ctx.params
  const { price } = ctx.request.body || {}
  if (price === undefined || Number(price) < 0) { ctx.body = fail('价格无效'); return }
  await pool.execute('UPDATE products SET price = ? WHERE id = ?', [Number(price).toFixed(2), id])
  ctx.body = success(null, '改价成功')
}

exports.getTables = async (ctx) => {
  const [rows] = await pool.execute('SELECT * FROM tables ORDER BY table_no')
  ctx.body = success(rows)
}

exports.getStaffList = async (ctx) => {
  const [rows] = await pool.execute('SELECT id, username, name, role, status, created_at FROM staff ORDER BY id')
  ctx.body = success(rows)
}

exports.addStaff = async (ctx) => {
  const { username, password, name, role } = ctx.request.body || {}
  if (!username || !password) { ctx.body = fail('请输入账号和密码'); return }
  const [existing] = await pool.execute('SELECT id FROM staff WHERE username = ?', [username])
  if (existing.length > 0) { ctx.body = fail('账号已存在'); return }
  const hash = await bcrypt.hash(password, 10)
  const [result] = await pool.execute(
    'INSERT INTO staff (username, password_hash, name, role) VALUES (?, ?, ?, ?)',
    [username, hash, name || '', role || 'waiter']
  )
  ctx.body = success({ id: result.insertId }, '新增成功')
}

exports.updateStaff = async (ctx) => {
  const { id } = ctx.params
  const { name, role, status } = ctx.request.body || {}
  if (name !== undefined) await pool.execute('UPDATE staff SET name = ? WHERE id = ?', [name, id])
  if (role !== undefined) await pool.execute('UPDATE staff SET role = ? WHERE id = ?', [role, id])
  if (status !== undefined) await pool.execute('UPDATE staff SET status = ? WHERE id = ?', [status, id])
  ctx.body = success(null, '更新成功')
}

exports.deleteStaff = async (ctx) => {
  const { id } = ctx.params
  await pool.execute('DELETE FROM staff WHERE id = ?', [id])
  ctx.body = success(null, '删除成功')
}

exports.resetStaffPassword = async (ctx) => {
  const { id } = ctx.params
  const { password } = ctx.request.body || {}
  if (!password) { ctx.body = fail('请输入新密码'); return }
  const hash = await bcrypt.hash(password, 10)
  await pool.execute('UPDATE staff SET password_hash = ? WHERE id = ?', [hash, id])
  ctx.body = success(null, '密码已重置')
}

exports.getDeliveryConfig = async (ctx) => {
  const [rows] = await pool.execute("SELECT `key`, value FROM config WHERE `key` IN ('delivery_min_price')")
  const config = {}
  rows.forEach(r => { config[r.key] = r.value })
  ctx.body = success(config)
}

exports.updateDeliveryConfig = async (ctx) => {
  const { delivery_min_price } = ctx.request.body || {}
  if (delivery_min_price !== undefined) {
    await pool.execute("INSERT INTO config (`key`, value) VALUES ('delivery_min_price', ?) ON DUPLICATE KEY UPDATE value = ?", [String(delivery_min_price), String(delivery_min_price)])
  }
  ctx.body = success(null, '保存成功')
}

exports.getAnalytics = async (ctx) => {
  const today = dayjs().format('YYYY-MM-DD')
  const todayStart = today + ' 00:00:00'

  // 今日概览
  const [todayStats] = await pool.execute(
    "SELECT COUNT(*) as order_count, COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status NOT IN ('pending', 'canceled') AND created_at >= ?",
    [todayStart]
  )

  // 近7天趋势
  const sevenDaysAgo = dayjs().subtract(6, 'day').format('YYYY-MM-DD') + ' 00:00:00'
  const [trend] = await pool.execute(
    "SELECT DATE(created_at) as date, COUNT(*) as order_count, COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE status NOT IN ('pending', 'canceled') AND created_at >= ? GROUP BY DATE(created_at) ORDER BY date",
    [sevenDaysAgo]
  )

  // 热销Top5
  const [hotProducts] = await pool.execute(
    "SELECT product_name, SUM(quantity) as total_qty, SUM(price * quantity) as total_revenue FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.status NOT IN ('pending', 'canceled') AND o.created_at >= ? GROUP BY product_name ORDER BY total_qty DESC LIMIT 5",
    [sevenDaysAgo]
  )

  ctx.body = success({
    today: todayStats[0],
    trend,
    hotProducts
  })
}
