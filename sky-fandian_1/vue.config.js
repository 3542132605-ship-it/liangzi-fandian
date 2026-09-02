module.exports = {
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    disableHostCheck: true
  },
  // 生产环境配置
  productionSourceMap: false,
  // 其他配置
  transpileDependencies: ['uview-ui']
}
