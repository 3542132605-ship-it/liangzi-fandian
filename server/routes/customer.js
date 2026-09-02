const Router = require('koa-router')
const router = new Router({ prefix: '/api/customer' })
const { customerAuth } = require('../middleware/auth')
const ctrl = require('../controllers/customer')

// 登录(暂mock,不需要微信)
router.post('/login', ctrl.login)

// 以下接口需顾客端鉴权
router.get('/categories', customerAuth, ctrl.getCategories)
router.get('/products', customerAuth, ctrl.getProducts)
router.get('/products/:id', customerAuth, ctrl.getProductDetail)

// 购物车/订单
router.post('/orders', customerAuth, ctrl.createOrder)
router.post('/orders/:id/pay', customerAuth, ctrl.mockPay)
router.get('/orders', customerAuth, ctrl.getOrders)
router.get('/orders/:id', customerAuth, ctrl.getOrderDetail)
router.post('/orders/:id/cancel', customerAuth, ctrl.cancelOrder)

// 收货地址
router.get('/addresses', customerAuth, ctrl.getAddresses)
router.post('/addresses', customerAuth, ctrl.addAddress)
router.put('/addresses/:id', customerAuth, ctrl.updateAddress)
router.delete('/addresses/:id', customerAuth, ctrl.deleteAddress)

// 桌台解码(扫码)
router.post('/table/decode', customerAuth, ctrl.decodeTable)

module.exports = router
