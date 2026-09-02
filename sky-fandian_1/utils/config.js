/**
 * 配置文件
 * 
 * 良子饭店后端服务地址
 */

// API 基础地址 - 本地后端服务
// 开发/真机调试时改为电脑局域网 IP（手机和电脑需在同一 WiFi）
// 模拟器调试时用 localhost
// 上线前改为正式服务器域名
export const baseUrl = 'http://127.0.0.1:3000'

// 其他配置项
export const config = {
  // 请求超时时间（毫秒）
  timeout: 10000,
  
  // 是否开启请求日志（开发环境建议开启）
  enableLog: true,
  
  // 演示模式标识（已关闭，使用真实后端）
  isDemoMode: false,
};
