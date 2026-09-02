# 烧烤扫码点餐系统

<p align="center">
  <img src="https://img.shields.io/badge/uniapp-v3.0-brightgreen" alt="uniapp">
  <img src="https://img.shields.io/badge/vue-v2.x-blue" alt="vue">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license">
</p>

基于 uniapp 开发的烧烤扫码点餐系统，支持微信小程序、H5、APP 等多端运行。

## ✨ 功能特性

### 基础功能
- 🏠 **首页展示**：商家信息、推荐菜品、活动展示
- 🍖 **菜单浏览**：分类展示、搜索、购物车
- 📦 **订单管理**：订单列表、订单状态跟踪
- 👤 **个人中心**：个人信息管理

## 📱 技术栈

- **框架**：uniapp + Vue 2.x
- **UI 组件**：uView UI 2.0
- **网络请求**：uni.request 封装
- **开发工具**：HBuilderX / VS Code

## 🚀 快速开始

### 环境要求

- Node.js >= 12.0.0
- HBuilderX 或 VS Code + uniapp 插件

### 安装依赖

```bash
npm install
```

### 运行项目

#### 微信小程序
1. 使用 HBuilderX 打开项目
2. 点击运行 -> 运行到小程序模拟器 -> 微信开发者工具

#### H5
1. 使用 HBuilderX 打开项目
2. 点击运行 -> 运行到浏览器

#### APP
1. 使用 HBuilderX 打开项目
2. 点击运行 -> 运行到手机或模拟器

## 📂 项目结构

```
.
├── api/                    # API 接口封装
│   ├── config.js          # 配置相关接口
│   ├── home.js            # 首页相关接口
│   ├── menu.js            # 菜单相关接口
│   ├── merchant.js        # 商家相关接口
│   ├── order.js           # 订单相关接口
│   └── user.js            # 用户相关接口
├── components/            # 公共组件
│   ├── common/            # 通用组件
│   └── ...
├── pages/                 # 页面文件
│   ├── home/              # 首页
│   ├── login/             # 登录
│   ├── menu/              # 菜单点餐
│   ├── order/             # 订单管理
│   └── my/                # 个人中心
├── static/                # 静态资源
├── utils/                 # 工具函数
│   ├── config.js          # 配置文件
│   └── request.js         # 网络请求封装
├── App.vue                # 应用入口
├── main.js                # 入口文件
├── manifest.json          # 应用配置
└── pages.json             # 页面路由配置
```

## 🔧 配置说明

### 后端接口配置

如需使用自己的后端服务，修改 `utils/config.js`：

```javascript
export const baseUrl = 'https://your-api-domain.com/api';
```

### 小程序 AppID 配置

编辑 `manifest.json`，修改对应平台的 AppID：

```json
{
  "mp-weixin": {
    "appid": "your-wechat-appid"
  }
}
```

## 📖 API 文档

### 接口规范

所有接口遵循统一的响应格式：

```json
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```

### 主要接口模块

- **用户模块**：登录、注册、个人信息
- **菜单模块**：菜品列表、分类、搜索
- **订单模块**：创建订单、订单列表
- **商家模块**：商家信息、配置

详细接口文档请参考 [API.md](./API.md)

## 🎨 UI 组件

项目使用 [uView UI](https://www.uviewui.com/) 组件库，提供丰富的 UI 组件。

### 自定义组件

- **Button**：自定义按钮组件
- **Card**：卡片组件
- **EmptyState**：空状态组件
- **Icon**：图标组件
- **NavBar**：导航栏组件

## 📝 开发规范

### 代码规范

- 使用 ES6+ 语法
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case
- 函数命名使用 camelCase
- 常量命名使用 UPPER_CASE

### 注释规范

- 文件头部添加功能说明
- 函数添加 JSDoc 注释
- 复杂逻辑添加行内注释

### Git 提交规范

- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建/工具链相关

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目基于 [MIT](./LICENSE) 协议开源。

## 🙏 鸣谢

- [uniapp](https://uniapp.dcloud.io/) - 跨平台应用开发框架
- [uView UI](https://www.uviewui.com/) - UI 组件库
- [Vue.js](https://cn.vuejs.org/) - 渐进式 JavaScript 框架

## 技术支持

如有其他问题，请通过以下方式联系我们：

- 官方网站：https://scmls.cn/

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
