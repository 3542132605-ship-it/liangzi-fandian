import request from '@/utils/request';

// 顾客登录（mock 微信登录，支持手机号/游客自动注册）
export const customerLogin = (data) => {
    return request({
        url: '/api/customer/login',
        method: 'POST',
        data
    });
};

// 获取分类列表
export const getCategories = () => {
    return request({
        url: '/api/customer/categories',
        method: 'GET'
    });
};

// 获取菜品列表（支持 category_id 筛选）
export const getProducts = (params) => {
    return request({
        url: '/api/customer/products',
        method: 'GET',
        params
    });
};

// 获取菜品详情
export const getProductDetail = (id) => {
    return request({
        url: '/api/customer/products/' + id,
        method: 'GET'
    });
};

// 创建订单
export const createOrder = (data) => {
    return request({
        url: '/api/customer/orders',
        method: 'POST',
        data
    });
};

// mock 支付
export const mockPay = (orderId) => {
    return request({
        url: '/api/customer/orders/' + orderId + '/pay',
        method: 'POST'
    });
};

// 获取我的订单列表
export const getOrders = (params = {}) => {
    return request({
        url: '/api/customer/orders',
        method: 'GET',
        params
    });
};

// 获取订单详情
export const getOrderDetail = (id) => {
    return request({
        url: '/api/customer/orders/' + id,
        method: 'GET'
    });
};

// 取消订单
export const cancelOrder = (id) => {
    return request({
        url: '/api/customer/orders/' + id + '/cancel',
        method: 'POST'
    });
};

// 获取收货地址列表
export const getAddresses = () => {
    return request({
        url: '/api/customer/addresses',
        method: 'GET'
    });
};

// 新增收货地址
export const addAddress = (data) => {
    return request({
        url: '/api/customer/addresses',
        method: 'POST',
        data
    });
};

// 更新收货地址
export const updateAddress = (id, data) => {
    return request({
        url: '/api/customer/addresses/' + id,
        method: 'PUT',
        data
    });
};

// 删除收货地址
export const deleteAddress = (id) => {
    return request({
        url: '/api/customer/addresses/' + id,
        method: 'DELETE'
    });
};

// 扫码解码桌号
export const decodeTable = (data) => {
    return request({
        url: '/api/customer/table/decode',
        method: 'POST',
        data
    });
};
