require('dotenv').config()

module.exports = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'liangzi_restaurant'
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'liangzi_jwt_secret_2026',
    customerExpires: process.env.JWT_CUSTOMER_EXPIRES || '7d',
    staffExpires: process.env.JWT_STAFF_EXPIRES || '2h'
  },
  wx: {
    appid: process.env.WX_APPID || '',
    secret: process.env.WX_SECRET || ''
  },
  wxPay: {
    mchId: process.env.WX_MCH_ID || '',
    key: process.env.WX_PAY_KEY || '',
    notifyUrl: process.env.WX_NOTIFY_URL || ''
  }
}
