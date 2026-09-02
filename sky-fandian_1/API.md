# API 接口文档

## 接口规范

### 基础信息

- **协议**：HTTPS
- **请求格式**：JSON / application/x-www-form-urlencoded
- **响应格式**：JSON
- **字符编码**：UTF-8

### 统一响应格式

```json
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```

### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 请求头说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | string | 是 | 用户登录凭证 |
| content-type | string | 是 | 请求内容类型 |

---

## 用户模块

### 用户登录

**接口地址**：`/user/login`  
**请求方式**：POST  
**接口说明**：用户登录获取 token

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| phone | string | 是 | 手机号 |
| code | string | 是 | 验证码 |

**响应示例**：

```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "nickname": "用户昵称",
      "avatar": "头像地址",
      "phone": "13800138000"
    }
  }
}
```

### 获取用户信息

**接口地址**：`/user/info`  
**请求方式**：GET  
**接口说明**：获取当前登录用户信息

**响应示例**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "nickname": "用户昵称",
    "avatar": "头像地址",
    "phone": "13800138000"
  }
}
```

---

## 菜单模块

### 获取菜单分类

**接口地址**：`/menu/categories`  
**请求方式**：GET  
**接口说明**：获取菜品分类列表

**响应示例**：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "烧烤类",
      "sort": 1
    },
    {
      "id": 2,
      "name": "凉菜类",
      "sort": 2
    }
  ]
}
```

### 获取菜品列表

**接口地址**：`/menu/list`  
**请求方式**：GET  
**接口说明**：获取菜品列表

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| category_id | number | 否 | 分类 ID |
| keyword | string | 否 | 搜索关键词 |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |

**响应示例**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "羊肉串",
        "price": 3.00,
        "image": "图片地址",
        "description": "新鲜羊肉串",
        "category_id": 1
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 订单模块

### 创建订单

**接口地址**：`/order/create`  
**请求方式**：POST  
**接口说明**：创建订单

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| items | array | 是 | 订单商品列表 |
| remark | string | 否 | 备注 |

**items 数组元素**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| menu_id | number | 是 | 菜品 ID |
| quantity | number | 是 | 数量 |

**请求示例**：

```json
{
  "items": [
    {
      "menu_id": 1,
      "quantity": 2
    },
    {
      "menu_id": 2,
      "quantity": 1
    }
  ],
  "remark": "少辣"
}
```

**响应示例**：

```json
{
  "code": 200,
  "msg": "下单成功",
  "data": {
    "order_id": 123456,
    "order_no": "202605110001",
    "total_amount": 50.00
  }
}
```

### 获取订单列表

**接口地址**：`/order/list`  
**请求方式**：GET  
**接口说明**：获取用户订单列表

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | number | 否 | 订单状态：0-全部，1-待支付，2-已支付，3-已完成，4-已取消 |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |

**响应示例**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 123456,
        "order_no": "202605110001",
        "status": 2,
        "status_text": "已支付",
        "total_amount": 50.00,
        "create_time": "2026-05-11 12:00:00",
        "items": [
          {
            "menu_name": "羊肉串",
            "quantity": 2,
            "price": 3.00
          }
        ]
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 商家模块

### 获取商家配置

**接口地址**：`/config/getMerchantConfig`  
**请求方式**：GET  
**接口说明**：获取商家基本信息配置

**响应示例**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "name": "商家名称",
    "logo": "商家 Logo",
    "phone": "联系电话",
    "address": "商家地址",
    "business_hours": "营业时间"
  }
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 10001 | 参数错误 |
| 10002 | 用户不存在 |
| 10003 | 密码错误 |
| 10004 | 验证码错误 |
| 10005 | token 无效 |
| 10006 | token 过期 |
| 20001 | 商品不存在 |
| 20002 | 商品库存不足 |
| 30001 | 订单不存在 |
| 30002 | 订单状态异常 |

---

## 注意事项

1. 所有接口都需要在请求头中携带 `token`（除登录接口外）
2. 时间格式统一为：`YYYY-MM-DD HH:mm:ss`
3. 金额单位统一为：元（保留两位小数）
4. 图片地址为相对路径，需要拼接完整的域名
5. 分页参数：page 从 1 开始，pageSize 默认 10
6. 所有 POST 请求默认使用 `application/json` 格式

---

*最后更新：2026-05-11*
