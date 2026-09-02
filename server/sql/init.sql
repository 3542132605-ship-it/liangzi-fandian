-- 良子饭店扫码点餐 - 数据库初始化
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS liangzi_restaurant DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE liangzi_restaurant;

-- 顾客表
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  openid VARCHAR(64) NOT NULL DEFAULT '' COMMENT '微信openid(暂mock)',
  nickname VARCHAR(64) NOT NULL DEFAULT '' COMMENT '昵称',
  avatar VARCHAR(512) NOT NULL DEFAULT '' COMMENT '头像URL',
  phone VARCHAR(20) NOT NULL DEFAULT '' COMMENT '手机号',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='顾客表';

-- 收货地址
CREATE TABLE IF NOT EXISTS addresses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL COMMENT '顾客id',
  name VARCHAR(32) NOT NULL DEFAULT '' COMMENT '收货人姓名',
  phone VARCHAR(20) NOT NULL DEFAULT '' COMMENT '收货人电话',
  province VARCHAR(32) NOT NULL DEFAULT '' COMMENT '省',
  city VARCHAR(32) NOT NULL DEFAULT '' COMMENT '市',
  district VARCHAR(32) NOT NULL DEFAULT '' COMMENT '区',
  detail VARCHAR(255) NOT NULL DEFAULT '' COMMENT '详细地址',
  is_default TINYINT NOT NULL DEFAULT 0 COMMENT '是否默认',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址';

-- 菜品分类
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(32) NOT NULL COMMENT '分类名称',
  sort INT NOT NULL DEFAULT 0 COMMENT '排序(越小越前)',
  icon VARCHAR(255) NOT NULL DEFAULT '' COMMENT '图标',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1启用 0禁用',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品分类';

-- 菜品
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL COMMENT '分类id',
  name VARCHAR(64) NOT NULL COMMENT '菜品名称',
  image VARCHAR(512) NOT NULL DEFAULT '' COMMENT '图片URL',
  description VARCHAR(255) NOT NULL DEFAULT '' COMMENT '描述',
  price DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '基础价格',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1上架 2售罄 0下架',
  sort INT NOT NULL DEFAULT 0 COMMENT '排序',
  is_hot TINYINT NOT NULL DEFAULT 0 COMMENT '1招牌推荐',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_category (category_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品';

-- 菜品规格
CREATE TABLE IF NOT EXISTS product_specs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL COMMENT '菜品id',
  name VARCHAR(64) NOT NULL COMMENT '规格组名(如:大小份)',
  value VARCHAR(32) NOT NULL COMMENT '规格值(如:大份)',
  price DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '该规格的绝对价格',
  sort INT NOT NULL DEFAULT 0,
  KEY idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品规格';

-- 桌台
CREATE TABLE IF NOT EXISTS tables (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  table_no INT NOT NULL COMMENT '桌号(1-10)',
  qrcode_url VARCHAR(512) NOT NULL DEFAULT '' COMMENT '二维码URL',
  status ENUM('free','occupied') NOT NULL DEFAULT 'free' COMMENT '空闲/占用',
  UNIQUE KEY uk_table_no (table_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='桌台';

-- 订单
CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(32) NOT NULL COMMENT '订单号',
  user_id INT UNSIGNED NOT NULL COMMENT '顾客id',
  table_id INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '桌台id(外卖为0)',
  type ENUM('dine_in','delivery') NOT NULL COMMENT '堂食/外卖',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '总金额',
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '配送费(0)',
  status ENUM('pending','cooking','partial_served','served','delivered','done','canceled') NOT NULL DEFAULT 'pending' COMMENT '订单状态',
  address_id INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '收货地址id(外卖)',
  people_count INT NOT NULL DEFAULT 1 COMMENT '就餐人数',
  remark VARCHAR(255) NOT NULL DEFAULT '' COMMENT '备注',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_order_no (order_no),
  KEY idx_user (user_id),
  KEY idx_status (status),
  KEY idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单';

-- 订单明细
CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL COMMENT '订单id',
  product_id INT UNSIGNED NOT NULL COMMENT '菜品id',
  product_name VARCHAR(64) NOT NULL COMMENT '菜品名称(快照)',
  spec_name VARCHAR(64) NOT NULL DEFAULT '' COMMENT '规格名(快照)',
  price DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '单价(快照)',
  quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
  status ENUM('pending','served') NOT NULL DEFAULT 'pending' COMMENT '待上菜/已上菜',
  KEY idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细';

-- 订单操作流水
CREATE TABLE IF NOT EXISTS order_flow (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL COMMENT '订单id',
  staff_id INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '操作员工id',
  action VARCHAR(32) NOT NULL COMMENT '操作类型',
  remark VARCHAR(255) NOT NULL DEFAULT '' COMMENT '备注',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单操作流水';

-- 员工
CREATE TABLE IF NOT EXISTS staff (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(32) NOT NULL COMMENT '登录账号',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码hash',
  name VARCHAR(32) NOT NULL DEFAULT '' COMMENT '姓名',
  role ENUM('waiter','admin') NOT NULL DEFAULT 'waiter' COMMENT '角色',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1启用 0停用',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工';

-- 系统配置
CREATE TABLE IF NOT EXISTS config (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(64) NOT NULL COMMENT '配置键',
  value VARCHAR(255) NOT NULL DEFAULT '' COMMENT '配置值',
  UNIQUE KEY uk_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置';

-- ============ 种子数据 ============

-- 初始管理员账号 (密码: admin123, bcrypt hash)
INSERT IGNORE INTO staff (username, password_hash, name, role) VALUES
('admin', '$2a$10$L/xZx2fhbC7ovGNXjS7b1e5xukuh596e5NN1LanjYSOBNX/x5B.K.', '店长', 'admin');

-- 菜品分类
INSERT IGNORE INTO categories (id, name, sort) VALUES
(1, '凉菜', 1),
(2, '热菜', 2),
(3, '汤品', 3),
(4, '主食', 4),
(5, '酒水', 5);

-- 10张桌
INSERT IGNORE INTO tables (table_no, status) VALUES
(1,'free'),(2,'free'),(3,'free'),(4,'free'),(5,'free'),
(6,'free'),(7,'free'),(8,'free'),(9,'free'),(10,'free');

-- 系统配置:起送价
INSERT IGNORE INTO config (`key`, value) VALUES
('delivery_min_price', '20');
