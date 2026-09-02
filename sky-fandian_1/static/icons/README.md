# 图标使用指南

## 图标系统概述

点餐应用使用两种图标系统：
1. **uView内置图标库**：基础UI组件图标，如箭头、星标等
2. **自定义图标**：业务相关图标，如菜单、订单等

## 目录结构

```
/static/icons/
  ├── tabbar/             # Tabbar图标
  │   ├── home.png        # 首页图标
  │   ├── home-active.png # 首页激活图标
  │   ├── menu.png        # 菜单图标
  │   ├── menu-active.png # 菜单激活图标
  │   ├── order.png       # 订单图标
  │   ├── order-active.png# 订单激活图标
  │   ├── my.png          # 我的图标
  │   └── my-active.png   # 我的激活图标
  │
  ├── common/            # 通用图标
  │   ├── logo.png       # 应用Logo
  │   ├── coupon.png     # 优惠券图标
  │   ├── wallet.png     # 钱包图标
  │   ├── location.png   # 位置图标
  │   ├── member.png     # 会员图标
  │   ├── order.png      # 订单图标
  │   └── ...
  │
  └── status/           # 状态图标
      ├── empty.png     # 空状态图标
      ├── error.png     # 错误状态图标
      ├── success.png   # 成功状态图标
      └── ...
```

## 使用方法

### 1. 使用uView内置图标

```html
<custom-icon name="home" size="32" color="#8cd548"></custom-icon>
```

### 2. 使用自定义图标

```html
<custom-icon name="order" custom size="32"></custom-icon>
```

### 3. 图标+文字组合

```html
<view class="icon-text">
  <custom-icon name="location" size="28" color="#8cd548" class="icon"></custom-icon>
  <text class="text">门店地址</text>
</view>
```

## 图标规范

### 尺寸规范

- 极小图标：28rpx (icon-size-xs)
- 小图标：32rpx (icon-size-sm)
- 中图标：40rpx (icon-size-md)
- 大图标：48rpx (icon-size-lg)
- 超大图标：64rpx (icon-size-xl)

### 颜色规范

- 主要图标：$primary-color (#8cd548)
- 普通图标：$text-color-primary (#333333)
- 次要图标：$text-color-hint (#999999)
- 白色图标：#ffffff

## 示例页面

访问应用中的图标使用指南页面可以查看所有可用图标：

```
/pages/demo/icon-guide
``` 