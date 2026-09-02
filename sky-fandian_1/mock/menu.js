/**
 * 良子饭店 · 济宁菜馆 mock 数据
 * 来源：店内菜谱照片（2026-08-06 实拍）
 * 左列 19 道 + 右列 18 道 = 热菜 37 道全部录入
 * 凉菜/汤品/主食/酒水为小程序结构补全
 * 菜品状态：1 上架 / 2 售罄 / 0 下架
 */

export const merchant = {
  name: '良子饭店',
  subtitle: '济宁菜馆',
  notice: '招牌：红烧肉、酸菜鱼、地锅炖鸡、孜然羊肉、九子酥肉',
  business_hours: '10:30 - 21:30',
  phone: '0537-2388****',
  address: '济宁市任城区古槐路'
}

export const categories = [
  { id: 1, name: '凉菜', sort: 1 },
  { id: 2, name: '热菜', sort: 2 },
  { id: 3, name: '汤品', sort: 3 },
  { id: 4, name: '主食', sort: 4 },
  { id: 5, name: '酒水', sort: 5 }
]

export const products = [
  // ===== 凉菜 =====
  { id: 101, category_id: 1, name: '拍黄瓜', desc: '爽脆开胃', price: 16, image: '', spec_type: 'single', status: 1 },
  { id: 102, category_id: 1, name: '凉拌木耳', desc: '山木耳爽脆', price: 16, image: '', spec_type: 'single', status: 1 },
  { id: 103, category_id: 1, name: '口水鸡', desc: '麻辣川味', price: 28, image: '', spec_type: 'single', status: 1 },

  // ===== 热菜（菜谱照全部 37 道）=====
  // 左列
  { id: 201, category_id: 2, name: '香酥大虾', desc: '酥脆椒盐', price: 58, image: '', spec_type: 'single', status: 1 },
  { id: 202, category_id: 2, name: '赖皮炒笨鸡', desc: '散养笨鸡现炒', price: 68, image: '', spec_type: 'single', is_hot: true, status: 1 },
  { id: 203, category_id: 2, name: '干煸鸡', desc: '麻辣干煸', price: 48, image: '', spec_type: 'single', status: 1 },
  { id: 204, category_id: 2, name: '地锅炖鸡', desc: '柴火铁锅贴饼', price: 78, image: '', spec_type: 'single', is_hot: true, status: 1 },
  { id: 205, category_id: 2, name: '老味辣子鸡', desc: '传统老味', price: 48, image: '', spec_type: 'single', status: 1 },
  { id: 206, category_id: 2, name: '醋溜肉丝', desc: '酸甜爽口', price: 38, image: '', spec_type: 'single', status: 1 },
  { id: 207, category_id: 2, name: '京酱肉丝', desc: '京味甜面酱', price: 38, image: '', spec_type: 'single', status: 1 },
  { id: 208, category_id: 2, name: '鱼香肉丝', desc: '川味鱼香', price: 38, image: '', spec_type: 'single', status: 1 },
  { id: 209, category_id: 2, name: '香辣肉丝', desc: '麻辣下饭', price: 42, image: '', spec_type: 'single', status: 1 },
  { id: 210, category_id: 2, name: '韭香湖虾', desc: '微山湖小河虾', price: 48, image: '', spec_type: 'single', status: 1 },
  { id: 211, category_id: 2, name: '回锅肉', desc: '川味经典', price: 42, image: '', spec_type: 'single', status: 1 },
  { id: 212, category_id: 2, name: '炒牛肚', desc: '脆嫩有嚼劲', price: 58, image: '', spec_type: 'single', status: 1 },
  { id: 213, category_id: 2, name: '花蛤', desc: '辣炒花蛤', price: 32, image: '', spec_type: 'single', status: 1 },
  { id: 214, category_id: 2, name: '葱爆大肠', desc: '鲁菜经典', price: 58, image: '', spec_type: 'single', status: 1 },
  { id: 215, category_id: 2, name: '大肠炖豆腐', desc: '卤味慢炖', price: 48, image: '', spec_type: 'single', status: 1 },
  { id: 216, category_id: 2, name: '干炸鲈鱼', desc: '外酥里嫩', price: 68, image: '', spec_type: 'single', status: 1 },
  { id: 217, category_id: 2, name: '软煎鲈鱼', desc: '香煎慢火', price: 68, image: '', spec_type: 'single', status: 1 },
  { id: 218, category_id: 2, name: '炒腊肉', desc: '湘味腊香', price: 48, image: '', spec_type: 'single', status: 1 },
  { id: 219, category_id: 2, name: '小蘑菇炒肉', desc: '菌香肉嫩', price: 38, image: '', spec_type: 'single', status: 1 },
  // 右列
  { id: 220, category_id: 2, name: '红烧肉', desc: '本店招牌 肥而不腻', price: 48, image: '', spec_type: 'single', is_hot: true, status: 1 },
  { id: 221, category_id: 2, name: '玉米粒炒虾仁', desc: '清甜鲜嫩', price: 42, image: '', spec_type: 'single', status: 1 },
  { id: 222, category_id: 2, name: '孜然鱿鱼', desc: '烧烤风味', price: 48, image: '', spec_type: 'single', status: 1 },
  { id: 223, category_id: 2, name: '毛血旺', desc: '川味麻辣', price: 58, image: '', spec_type: 'single', status: 1 },
  { id: 224, category_id: 2, name: '麻辣牛肉', desc: '麻辣鲜香', price: 68, image: '', spec_type: 'single', status: 1 },
  { id: 225, category_id: 2, name: '孜然羊肉', desc: '孜然焦香', price: 68, image: '', spec_type: 'single', is_hot: true, status: 1 },
  { id: 226, category_id: 2, name: '炸鱼排', desc: '金黄酥脆', price: 42, image: '', spec_type: 'single', status: 1 },
  { id: 227, category_id: 2, name: '炸鸡柳拼盘', desc: '酥脆小食', price: 38, image: '', spec_type: 'single', status: 1 },
  { id: 228, category_id: 2, name: '麻辣鱼', desc: '麻辣水煮', price: 68, image: '', spec_type: 'single', status: 1 },
  { id: 229, category_id: 2, name: '酸菜鱼', desc: '本店招牌 酸辣开胃', price: 78, image: '', spec_type: 'multi', is_hot: true, status: 1,
    spec_config: { 规格: ['整条', '半条'], 价格: { '整条': 78, '半条': 42 } } },
  { id: 230, category_id: 2, name: '香辣鲤鱼', desc: '红烧香辣', price: 68, image: '', spec_type: 'single', status: 1 },
  { id: 231, category_id: 2, name: '草鱼粉条', desc: '炖粉条入味', price: 58, image: '', spec_type: 'single', status: 1 },
  { id: 232, category_id: 2, name: '红烧带鱼', desc: '海味红烧', price: 68, image: '', spec_type: 'single', status: 1 },
  { id: 233, category_id: 2, name: '炸黄花鱼', desc: '酥炸小黄鱼', price: 38, image: '', spec_type: 'single', status: 1 },
  { id: 234, category_id: 2, name: '窝头培根', desc: '粗粮配咸香', price: 42, image: '', spec_type: 'single', status: 1 },
  { id: 235, category_id: 2, name: '九子酥肉', desc: '鲁南特色酥肉', price: 58, image: '', spec_type: 'single', is_hot: true, status: 1 },
  { id: 236, category_id: 2, name: '老味酥肉', desc: '传统老味', price: 58, image: '', spec_type: 'single', status: 1 },
  { id: 237, category_id: 2, name: '红烧皮肚', desc: 'Q弹入味', price: 48, image: '', spec_type: 'single', status: 1 },

  // ===== 汤品 =====
  { id: 301, category_id: 3, name: '紫菜蛋花汤', desc: '清淡家常', price: 18, image: '', spec_type: 'single', status: 1 },
  { id: 302, category_id: 3, name: '酸辣汤', desc: '酸辣开胃', price: 22, image: '', spec_type: 'single', status: 1 },
  { id: 303, category_id: 3, name: '玉米羹', desc: '清甜浓稠', price: 16, image: '', spec_type: 'single', status: 1 },

  // ===== 主食 =====
  { id: 401, category_id: 4, name: '米饭', desc: '', price: 3, image: '', spec_type: 'single', status: 1 },
  { id: 402, category_id: 4, name: '馒头', desc: '北方手工', price: 3, image: '', spec_type: 'single', status: 1 },
  { id: 403, category_id: 4, name: '煎饼', desc: '山东大煎饼', price: 8, image: '', spec_type: 'single', status: 1 },

  // ===== 酒水 =====
  { id: 501, category_id: 5, name: '雪花啤酒', desc: '清爽型', price: 6, image: '', spec_type: 'multi', status: 1,
    spec_config: { 规格: ['瓶装', '听装'], 价格: { '瓶装': 6, '听装': 5 } } },
  { id: 502, category_id: 5, name: '可乐', desc: '冰镇可乐', price: 6, image: '', spec_type: 'single', status: 1 },
  { id: 503, category_id: 5, name: '酸梅汤', desc: '本店自制', price: 12, image: '', spec_type: 'single', status: 1 }
]

/* 配送设置 mock · 外卖免配送费 */
export const deliveryConfig = {
  minPrice: 30   // 起送价（元）
}

/* mock 订单（菜品匹配新菜单） */
export const mockOrders = [
  {
    id: '20260806001',
    type: 'dine_in',
    table_no: '3',
    status: 'served',
    status_text: '已上齐',
    people_count: 2,
    items: [
      { name: '红烧肉', spec: '默认', price: 48, quantity: 1 },
      { name: '拍黄瓜', spec: '默认', price: 16, quantity: 1 },
      { name: '米饭', spec: '默认', price: 3, quantity: 2 }
    ],
    total: 70,
    delivery_fee: 0,
    created_at: '2026-08-06 18:42'
  },
  {
    id: '20260805002',
    type: 'delivery',
    status: 'finished',
    status_text: '已完成',
    address: '任城区新世纪花园 6-2-301 张先生 138****6281',
    items: [
      { name: '酸菜鱼', spec: '半条', price: 42, quantity: 1 },
      { name: '酸辣汤', spec: '默认', price: 22, quantity: 1 }
    ],
    total: 64,
    delivery_fee: 0,
    created_at: '2026-08-05 12:18'
  },
  {
    id: '20260804003',
    type: 'dine_in',
    table_no: '7',
    status: 'cooking',
    status_text: '备菜中',
    people_count: 4,
    items: [
      { name: '地锅炖鸡', spec: '默认', price: 78, quantity: 1 },
      { name: '凉拌木耳', spec: '默认', price: 16, quantity: 1 },
      { name: '米饭', spec: '默认', price: 3, quantity: 4 }
    ],
    total: 106,
    delivery_fee: 0,
    created_at: '2026-08-04 19:05'
  }
]