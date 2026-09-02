/**
 * 网络请求封装
 * 支持自动添加 token、统一错误处理、双端鉴权（顾客端/管理端）
 * 适配后端响应格式：{ code: 1, msg, data }
 */

import { baseUrl, config } from './config.js';

export { baseUrl };

/**
 * 获取当前页面路径
 */
const getCurrentPageUrl = () => {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    return currentPage ? currentPage.$page.fullPath : '';
};

/**
 * 判断是否为员工端请求
 */
const isStaffRequest = (options = {}) => {
    const header = options.header || {};
    return Object.prototype.hasOwnProperty.call(header, 'Staff-Token') || (options.url || '').indexOf('/manage/') !== -1;
};

/**
 * 处理未授权情况（401）
 */
const handleUnauthorized = (options = {}) => {
    const currentUrl = getCurrentPageUrl();
    if (isStaffRequest(options)) {
        uni.removeStorageSync('staff_token');
        uni.removeStorageSync('staff_info');
        if (currentUrl && currentUrl !== '/pages/manage/login/login') {
            uni.setStorageSync('staff_redirect_url', currentUrl);
        }
        uni.reLaunch({
            url: '/pages/manage/login/login'
        });
        return;
    }

    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
    if (currentUrl) {
        uni.setStorageSync('redirect_url', currentUrl);
    }
    uni.redirectTo({
        url: '/pages/login/login'
    });
};

/**
 * 网络请求方法
 * @param {Object} options 请求配置
 * @returns {Promise} 返回后端 data 字段（自动解包）
 */
const request = (options) => {
    return new Promise((resolve, reject) => {
        const isStaff = isStaffRequest(options);
        const token = isStaff ? uni.getStorageSync('staff_token') : uni.getStorageSync('token');
        const method = (options.method || 'GET').toUpperCase();
        const header = {
            ...(options.header || {}),
            'content-type': options.contentType || (options.header || {})['content-type'] || 'application/json',
        };
        
        // 注入 token
        if (token) {
            header['Authorization'] = 'Bearer ' + token;
        }
        
        const fullUrl = baseUrl + options.url;
        let requestData = method === 'GET' ? (options.params || options.data) : options.data;
        
        // 处理表单格式的请求
        if (options.contentType === 'application/x-www-form-urlencoded') {
            if (requestData && typeof requestData === 'object') {
                header['content-type'] = 'application/x-www-form-urlencoded';
                const params = [];
                for (let key in requestData) {
                    if (requestData.hasOwnProperty(key) && requestData[key] !== undefined) {
                        params.push(encodeURIComponent(key) + '=' + encodeURIComponent(requestData[key]));
                    }
                }
                requestData = params.join('&');
            }
        }
        
        if (config.enableLog) {
            console.log(`[API] ${method} ${options.url}`, requestData || '');
        }
        
        uni.request({
            url: fullUrl,
            method: options.method || 'GET',
            data: requestData,
            header: header,
            success: (res) => {
                if (config.enableLog) {
                    console.log(`[API] ${method} ${options.url} =>`, res.statusCode, res.data);
                }
                
                if (res.statusCode === 200) {
                    const body = res.data;
                    // 后端返回格式：{ code: 1, msg, data }
                    if (body && typeof body === 'object' && 'code' in body) {
                        if (body.code === 1) {
                            // 成功：自动解包 data 字段
                            resolve(body.data);
                        } else if (body.code === -1) {
                            // 未授权
                            handleUnauthorized(options);
                            reject({ code: -1, msg: body.msg || '未登录或登录已过期' });
                        } else {
                            // 业务错误
                            reject({ code: body.code, msg: body.msg || '操作失败' });
                        }
                    } else {
                        // 兼容非标准响应
                        resolve(body);
                    }
                } else if (res.statusCode === 401) {
                    handleUnauthorized(options);
                    reject({ code: 401, msg: '登录已过期，请重新登录' });
                } else {
                    reject({ code: res.statusCode, msg: '服务器响应异常: ' + res.statusCode });
                }
            },
            fail: (err) => {
                if (config.enableLog) {
                    console.error(`[API] ${method} ${options.url} FAIL`, err);
                }
                reject({ code: -1, msg: err.errMsg || '网络请求失败' });
            }
        });
    });
};

export default request;
