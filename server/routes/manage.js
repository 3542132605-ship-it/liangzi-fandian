const Router = require('koa-router')
const router = new Router({ prefix: '/api/manage' })
const { staffAuth } = require('../middleware/auth')
const ctrl = require('../controllers/manage')

// 登录
router.post('/login', ctrl.login)

// 以下接口需管理端鉴权
// 堂食订单
router.get('/dine-in/orders', staffAuth, ctrl.getDineInOrders)
router.post('/dine-in/serve-item', staffAuth, ctrl.serveItem)
router.post('/dine-in/serve-all', staffAuth, ctrl.serveAll)
router.post('/dine-in/complete', staffAuth, ctrl.completeDineIn)
router.post('/dine-in/cancel', staffAuth, ctrl.cancelDineIn)

// 外卖订单
router.get('/delivery/orders', staffAuth, ctrl.getDeliveryOrders)
router.post('/delivery/start', staffAuth, ctrl.startDelivery)
router.post('/delivery/delivered', staffAuth, ctrl.confirmDelivered)
router.post('/delivery/complete', staffAuth, ctrl.completeDelivery)

// 菜品管理
router.get('/products', staffAuth, ctrl.getProducts)
router.get('/products/:id', staffAuth, ctrl.getProductDetail)
router.post('/products', staffAuth, ctrl.addProduct)
router.put('/products/:id', staffAuth, ctrl.updateProduct)
router.delete('/products/:id', staffAuth, ctrl.deleteProduct)
router.post('/products/:id/status', staffAuth, ctrl.updateProductStatus)
router.post('/products/:id/price', staffAuth, ctrl.updateProductPrice)

// 经营设置
router.get('/tables', staffAuth, ctrl.getTables)
router.get('/staff', staffAuth, ctrl.getStaffList)
router.post('/staff', staffAuth, ctrl.addStaff)
router.put('/staff/:id', staffAuth, ctrl.updateStaff)
router.delete('/staff/:id', staffAuth, ctrl.deleteStaff)
router.post('/staff/:id/reset-password', staffAuth, ctrl.resetStaffPassword)
router.get('/delivery-config', staffAuth, ctrl.getDeliveryConfig)
router.put('/delivery-config', staffAuth, ctrl.updateDeliveryConfig)
router.get('/analytics', staffAuth, ctrl.getAnalytics)

module.exports = router
