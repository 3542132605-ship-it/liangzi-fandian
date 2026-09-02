/**
 * 售罄自动恢复定时任务
 * 每日 00:00 将所有售罄菜品(status=2)自动恢复为上架(status=1)
 */
const cron = require('node-cron')
const { pool } = require('../models')

let task = null

/**
 * 启动定时任务
 * @param {string} schedule cron 表达式，默认每天 00:00
 */
function start(schedule = '0 0 * * *') {
  if (task) {
    console.log('[定时任务] 售罄恢复任务已在运行中，跳过重复启动')
    return
  }

  task = cron.schedule(schedule, async () => {
    console.log(`[定时任务] 售罄恢复触发 @ ${new Date().toISOString()}`)
    try {
      const [result] = await pool.execute(
        'UPDATE products SET status = 1 WHERE status = 2'
      )
      const count = result.affectedRows
      console.log(`[定时任务] 售罄恢复完成，共恢复 ${count} 个菜品`)
    } catch (err) {
      console.error('[定时任务] 售罄恢复失败:', err.message)
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Shanghai'
  })

  console.log(`[定时任务] 售罄恢复任务已启动，cron: ${schedule}，时区: Asia/Shanghai`)
}

/**
 * 手动执行一次（调试用）
 */
async function runOnce() {
  console.log('[定时任务] 手动触发售罄恢复...')
  try {
    const [result] = await pool.execute(
      'UPDATE products SET status = 1 WHERE status = 2'
    )
    const count = result.affectedRows
    console.log(`[定时任务] 手动售罄恢复完成，共恢复 ${count} 个菜品`)
    return count
  } catch (err) {
    console.error('[定时任务] 手动售罄恢复失败:', err.message)
    throw err
  }
}

/**
 * 停止定时任务
 */
function stop() {
  if (task) {
    task.stop()
    task = null
    console.log('[定时任务] 售罄恢复任务已停止')
  }
}

module.exports = { start, runOnce, stop }
