const mysql = require('mysql2/promise')
const Redis = require('ioredis')
const config = require('../config')

// MySQL 连接池
const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
})

// Redis 客户端
let redis = null
try {
  const redisOpts = {
    host: config.redis.host,
    port: config.redis.port,
    retryStrategy: (times) => Math.min(times * 200, 5000)
  }
  if (config.redis.password) redisOpts.password = config.redis.password
  redis = new Redis(redisOpts)
  redis.on('error', (err) => console.warn('[Redis] 连接失败,将使用内存缓存:', err.message))
  redis.on('connect', () => console.log('[Redis] 已连接'))
} catch (e) {
  console.warn('[Redis] 初始化失败,将使用内存缓存')
}

// Redis 不可用时降级为内存 Map
const memoryCache = new Map()
const cache = {
  async get(key) {
    if (redis && redis.status === 'ready') return await redis.get(key)
    return memoryCache.get(key) || null
  },
  async set(key, value, ttlSeconds) {
    if (redis && redis.status === 'ready') {
      if (ttlSeconds) await redis.set(key, value, 'EX', ttlSeconds)
      else await redis.set(key, value)
    } else {
      memoryCache.set(key, value)
      if (ttlSeconds) setTimeout(() => memoryCache.delete(key), ttlSeconds * 1000)
    }
  },
  async del(key) {
    if (redis && redis.status === 'ready') await redis.del(key)
    else memoryCache.delete(key)
  }
}

module.exports = { pool, redis, cache }
