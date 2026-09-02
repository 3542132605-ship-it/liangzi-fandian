import request from '@/utils/request';

// 员工登录
export const staffLogin = (data) => {
    return request({
        url: '/api/manage/login',
        method: 'POST',
        data
    });
};

// 获取堂食订单列表
export const getDineInOrders = (params = {}) => {
    return request({
        url: '/api/manage/dine-in/orders',
        method: 'GET',
        params
    });
};

// 标记单道菜已上菜
export const serveItem = (data) => {
    return request({
        url: '/api/manage/dine-in/serve-item',
        method: 'POST',
        data
    });
};

// 标记整单全部上菜
export const serveAll = (data) => {
    return request({
        url: '/api/manage/dine-in/serve-all',
        method: 'POST',
        data
    });
};

// 完成堂食订单
export const completeDineIn = (data) => {
    return request({
        url: '/api/manage/dine-in/complete',
        method: 'POST',
        data
    });
};

// 取消堂食订单（仅待支付）
export const cancelDineIn = (data) => {
    return request({
        url: '/api/manage/dine-in/cancel',
        method: 'POST',
        data
    });
};

// 获取外卖订单列表
export const getDeliveryOrders = (params = {}) => {
    return request({
        url: '/api/manage/delivery/orders',
        method: 'GET',
        params
    });
};

// 开始配送
export const startDelivery = (data) => {
    return request({
        url: '/api/manage/delivery/start',
        method: 'POST',
        data
    });
};

// 确认送达
export const confirmDelivered = (data) => {
    return request({
        url: '/api/manage/delivery/delivered',
        method: 'POST',
        data
    });
};

// 完成外卖订单
export const completeDelivery = (data) => {
    return request({
        url: '/api/manage/delivery/complete',
        method: 'POST',
        data
    });
};

// 获取菜品列表（管理端）
export const getProducts = (params = {}) => {
    return request({
        url: '/api/manage/products',
        method: 'GET',
        params
    });
};

// 获取菜品详情
export const getProductDetail = (id) => {
    return request({
        url: '/api/manage/products/' + id,
        method: 'GET'
    });
};

// 新增菜品
export const addProduct = (data) => {
    return request({
        url: '/api/manage/products',
        method: 'POST',
        data
    });
};

// 更新菜品
export const updateProduct = (id, data) => {
    return request({
        url: '/api/manage/products/' + id,
        method: 'PUT',
        data
    });
};

// 删除菜品
export const deleteProduct = (id) => {
    return request({
        url: '/api/manage/products/' + id,
        method: 'DELETE'
    });
};

// 切换菜品状态
export const updateProductStatus = (id, status) => {
    return request({
        url: '/api/manage/products/' + id + '/status',
        method: 'POST',
        data: { status }
    });
};

// 修改菜品价格
export const updateProductPrice = (id, price) => {
    return request({
        url: '/api/manage/products/' + id + '/price',
        method: 'POST',
        data: { price }
    });
};

// 获取桌台列表
export const getTables = () => {
    return request({
        url: '/api/manage/tables',
        method: 'GET'
    });
};

// 获取员工列表
export const getStaffList = () => {
    return request({
        url: '/api/manage/staff',
        method: 'GET'
    });
};

// 新增员工
export const addStaff = (data) => {
    return request({
        url: '/api/manage/staff',
        method: 'POST',
        data
    });
};

// 更新员工信息
export const updateStaff = (id, data) => {
    return request({
        url: '/api/manage/staff/' + id,
        method: 'PUT',
        data
    });
};

// 删除员工
export const deleteStaff = (id) => {
    return request({
        url: '/api/manage/staff/' + id,
        method: 'DELETE'
    });
};

// 重置员工密码
export const resetStaffPassword = (id, password) => {
    return request({
        url: '/api/manage/staff/' + id + '/reset-password',
        method: 'POST',
        data: { password }
    });
};

// 获取配送配置
export const getDeliveryConfig = () => {
    return request({
        url: '/api/manage/delivery-config',
        method: 'GET'
    });
};

// 更新配送配置
export const updateDeliveryConfig = (data) => {
    return request({
        url: '/api/manage/delivery-config',
        method: 'PUT',
        data
    });
};

// 获取营业数据
export const getAnalytics = () => {
    return request({
        url: '/api/manage/analytics',
        method: 'GET'
    });
};
