/**
 * 良子饭店 · 管理端 mock 数据
 *
 * 堂食订单 status：cooking备菜中 / partial部分上菜 / served已上齐 / done已完成
 *   item.served：false待上 / true已上
 * 外卖订单 status：cooking备菜中 / delivering配送中 / done已完成
 *
 * 后端就绪后由 api/manage.js 替换
 */

/* ============ 堂食订单 ============ */
export const dineOrders = [
  {
    id: 'D20260807001',
    table_no: '3',
    status: 'partial',
    status_text: '部分上菜',
    people_count: 2,
    created_at: '2026-08-07 18:42',
    items: [
      { name: '红烧肉', spec: '默认', price: 48, quantity: 1, served: true },
      { name: '拍黄瓜', spec: '默认', price: 16, quantity: 1, served: true },
      { name: '地锅炖鸡', spec: '默认', price: 78, quantity: 1, served: false },
      { name: '米饭', spec: '默认', price: 3, quantity: 2, served: false }
    ],
    total: 148
  },
  {
    id: 'D20260807002',
    table_no: '7',
    status: 'cooking',
    status_text: '备菜中',
    people_count: 4,
    created_at: '2026-08-07 19:05',
    items: [
      { name: '酸菜鱼', spec: '整条', price: 78, quantity: 1, served: false },
      { name: '凉拌木耳', spec: '默认', price: 16, quantity: 1, served: false },
      { name: '九子酥肉', spec: '默认', price: 58, quantity: 1, served: false },
      { name: '米饭', spec: '默认', price: 3, quantity: 4, served: false }
    ],
    total: 162
  },
  {
    id: 'D20260807003',
    table_no: '1',
    status: 'served',
    status_text: '已上齐',
    people_count: 3,
    created_at: '2026-08-07 19:20',
    items: [
      { name: '孜然羊肉', spec: '默认', price: 68, quantity: 1, served: true },
      { name: '京酱肉丝', spec: '默认', price: 38, quantity: 1, served: true },
      { name: '紫菜蛋花汤', spec: '默认', price: 18, quantity: 1, served: true },
      { name: '米饭', spec: '默认', price: 3, quantity: 3, served: true }
    ],
    total: 133
  },
  {
    id: 'D20260807004',
    table_no: '5',
    status: 'cooking',
    status_text: '备菜中',
    people_count: 2,
    created_at: '2026-08-07 19:33',
    items: [
      { name: '赖皮炒笨鸡', spec: '默认', price: 68, quantity: 1, served: false },
      { name: '炒牛肚', spec: '默认', price: 58, quantity: 1, served: false },
      { name: '馒头', spec: '默认', price: 3, quantity: 2, served: false }
    ],
    total: 132
  }
]

/* ============ 外卖订单 ============ */
export const deliveryOrders = [
  {
    id: 'W20260807001',
    status: 'cooking',
    status_text: '备菜中',
    name: '张先生',
    phone: '138****6281',
    address: '任城区新世纪花园 6-2-301',
    remark: '不要辣，多放香菜',
    items: [
      { name: '酸菜鱼', spec: '半条', price: 42, quantity: 1 },
      { name: '酸辣汤', spec: '默认', price: 22, quantity: 1 },
      { name: '米饭', spec: '默认', price: 3, quantity: 1 }
    ],
    total: 67,
    delivery_fee: 0,
    created_at: '2026-08-07 19:10'
  },
  {
    id: 'W20260807002',
    status: 'delivering',
    status_text: '配送中',
    name: '李女士',
    phone: '139****3320',
    address: '任城区古槐路锦绣园 2-1-502',
    remark: '',
    items: [
      { name: '红烧肉', spec: '默认', price: 48, quantity: 1 },
      { name: '地锅炖鸡', spec: '默认', price: 78, quantity: 1 },
      { name: '米饭', spec: '默认', price: 3, quantity: 2 }
    ],
    total: 129,
    delivery_fee: 0,
    created_at: '2026-08-07 18:50'
  },
  {
    id: 'W20260807003',
    status: 'cooking',
    status_text: '备菜中',
    name: '王先生',
    phone: '137****8855',
    address: '任城区万达广场 B 座 1803',
    remark: '开发票，抬头：个人',
    items: [
      { name: '麻辣鱼', spec: '默认', price: 68, quantity: 1 },
      { name: '拍黄瓜', spec: '默认', price: 16, quantity: 1 },
      { name: '米饭', spec: '默认', price: 3, quantity: 1 }
    ],
    total: 87,
    delivery_fee: 0,
    created_at: '2026-08-07 19:25'
  },
  {
    id: 'W20260806001',
    status: 'done',
    status_text: '已完成',
    name: '赵女士',
    phone: '135****1190',
    address: '任城区仙营路 9 号院',
    remark: '',
    items: [
      { name: '九子酥肉', spec: '默认', price: 58, quantity: 1 },
      { name: '酸辣汤', spec: '默认', price: 22, quantity: 1 }
    ],
    total: 80,
    delivery_fee: 0,
    created_at: '2026-08-06 12:18'
  }
]

/* ============ 员工列表 ============ */
export const staffList = [
  { id: 1, username: 'admin', name: '良子', role: 'admin', role_text: '管理员', status: 1, created_at: '2026-07-01' },
  { id: 2, username: 'wangjie', name: '王姐', role: 'waiter', role_text: '服务员', status: 1, created_at: '2026-07-12' },
  { id: 3, username: 'liqiang', name: '李强', role: 'waiter', role_text: '服务员', status: 1, created_at: '2026-07-20' },
  { id: 4, username: 'zhaojun', name: '赵军', role: 'waiter', role_text: '配送员', status: 1, created_at: '2026-07-25' },
  { id: 5, username: 'sunli', name: '孙丽', role: 'waiter', role_text: '服务员', status: 0, created_text: '已停用', created_at: '2026-07-28' }
]

/* ============ 桌台（1-10） ============ */
export const tables = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  table_no: String(i + 1),
  qrcode: '', // 实际由后端生成，占位
  status: 'free'
}))

/* ============ 营业数据 ============ */
export const analytics = {
  today: {
    orderCount: 28,
    revenue: 3268,
    dineCount: 19,
    deliveryCount: 9
  },
  week: [
    { date: '8/1', revenue: 2840 },
    { date: '8/2', revenue: 3120 },
    { date: '8/3', revenue: 2680 },
    { date: '8/4', revenue: 3560 },
    { date: '8/5', revenue: 3010 },
    { date: '8/6', revenue: 3890 },
    { date: '8/7', revenue: 3268 }
  ],
  hotDishes: [
    { name: '红烧肉', count: 18, revenue: 864 },
    { name: '酸菜鱼', count: 12, revenue: 780 },
    { name: '地锅炖鸡', count: 9, revenue: 702 },
    { name: '孜然羊肉', count: 8, revenue: 544 },
    { name: '九子酥肉', count: 7, revenue: 406 }
  ]
}

/* ============ 管理端登录 mock 账号 ============ */
export const mockStaffAccount = {
  username: 'admin',
  password: '123456',
  name: '良子',
  role: 'admin'
}
