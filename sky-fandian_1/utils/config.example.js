/**
 * 配置文件示例
 * 
 * 说明：
 * 1. 本项目已提供 utils/config.js 配置文件，内置演示后端服务
 * 2. 如需使用自己的后端服务，请修改 utils/config.js 中的 baseUrl
 * 3. 本文件仅作为配置参考，实际使用请修改 utils/config.js
 */

// API 基础地址配置
export const baseUrl = 'https://your-api-domain.com/api'; // 请替换为你的实际 API 地址

// 其他配置项（可选）
export const config = {
  // 请求超时时间（毫秒）
  timeout: 10000,
  
  // 是否开启请求日志
  enableLog: true,
  
  // 演示模式标识
  isDemoMode: false,
  
  // 其他自定义配置
  // ...
};

/**
 * 使用说明：
 * 
 * 1. 演示模式（默认）：
 *    - 项目已配置演示后端服务，可直接运行
 *    - 无需修改任何配置
 * 
 * 2. 自定义后端：
 *    - 修改 utils/config.js 中的 baseUrl
 *    - 确保后端实现了完整的 API 接口
 *    - 详见 API.md 文档
 * 
 * 3. 生产环境：
 *    - 配置真实的后端地址
 *    - 关闭请求日志（enableLog: false）
 *    - 配置合适的超时时间
 */
