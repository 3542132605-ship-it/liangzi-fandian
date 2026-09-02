const OFFICIAL_PLATFORM = 'official';
const MINIAPP_PLATFORM = 'miniapp';
const OAUTH_QUERY_KEYS = ['code', 'state', 'errmsg'];

const cleanUrlPart = (value = '') => {
    const [path, query = ''] = String(value).split('?');
    if (!query) {
        return path;
    }
    const params = new URLSearchParams(query);
    OAUTH_QUERY_KEYS.forEach((key) => params.delete(key));
    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
};

const normalizePayParams = (payParams = {}) => ({
    appId: payParams.appId || '',
    timeStamp: String(payParams.timeStamp || ''),
    nonceStr: payParams.nonceStr || '',
    package: payParams.package || '',
    signType: payParams.signType || 'RSA',
    paySign: payParams.paySign || ''
});

const waitForWeixinJSBridge = () => {
    // #ifdef H5
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return Promise.reject(new Error('当前环境不支持公众号支付'));
    }
    if (window.WeixinJSBridge) {
        return Promise.resolve(window.WeixinJSBridge);
    }
    return new Promise((resolve) => {
        const onReady = () => {
            document.removeEventListener('WeixinJSBridgeReady', onReady);
            resolve(window.WeixinJSBridge);
        };
        document.addEventListener('WeixinJSBridgeReady', onReady);
    });
    // #endif
    return Promise.reject(new Error('当前环境不支持公众号支付'));
};

const requestMiniappPayment = (payParams = {}) => {
    const params = normalizePayParams(payParams);
    return new Promise((resolve, reject) => {
        uni.requestPayment({
            provider: 'wxpay',
            timeStamp: params.timeStamp,
            nonceStr: params.nonceStr,
            package: params.package,
            signType: params.signType,
            paySign: params.paySign,
            success: resolve,
            fail: reject
        });
    });
};

const requestOfficialPayment = async (payParams = {}) => {
    const bridge = await waitForWeixinJSBridge();
    const params = normalizePayParams(payParams);
    return new Promise((resolve, reject) => {
        bridge.invoke('getBrandWCPayRequest', params, (res) => {
            const errMsg = String(res?.err_msg || res?.errMsg || '').toLowerCase();
            if (errMsg.includes(':ok')) {
                resolve(res);
                return;
            }
            reject(res || new Error('公众号支付失败'));
        });
    });
};

export const isWechatBrowser = () => {
    // #ifdef H5
    const ua = window.navigator.userAgent.toLowerCase();
    return ua.includes('micromessenger');
    // #endif
    return false;
};

export const getClientPlatform = () => {
    // #ifdef MP-WEIXIN
    return MINIAPP_PLATFORM;
    // #endif
    // #ifdef H5
    return isWechatBrowser() ? OFFICIAL_PLATFORM : '';
    // #endif
    return '';
};

export const getH5CurrentUrl = () => {
    // #ifdef H5
    const currentUrl = window.location.href || '';
    if (!currentUrl) {
        return '';
    }
    const [base, hash = ''] = currentUrl.split('#');
    const cleanBase = cleanUrlPart(base);
    const cleanHash = hash ? `#${cleanUrlPart(hash)}` : '';
    return `${cleanBase}${cleanHash}`;
    // #endif
    return '';
};

export const getWechatOauthParams = () => {
    // #ifdef H5
    const params = {};
    const currentUrl = window.location.href || '';
    if (!currentUrl) {
        return params;
    }
    const [base, hash = ''] = currentUrl.split('#');
    const collectParams = (value = '') => {
        const query = value.includes('?') ? value.slice(value.indexOf('?') + 1) : '';
        if (!query) {
            return;
        }
        const queryParams = new URLSearchParams(query);
        OAUTH_QUERY_KEYS.forEach((key) => {
            const paramValue = queryParams.get(key);
            if (paramValue) {
                params[key] = paramValue;
            }
        });
    };
    collectParams(base);
    collectParams(hash);
    return params;
    // #endif
    return {};
};

export const clearWechatOauthParams = () => {
    // #ifdef H5
    const nextUrl = getH5CurrentUrl();
    if (nextUrl && nextUrl !== window.location.href) {
        window.history.replaceState({}, '', nextUrl);
    }
    // #endif
};

export const requestWechatPayment = (payData = {}, clientPlatform = '') => {
    const paymentData = { ...(payData || {}) };
    const platform = clientPlatform || paymentData.client_platform || getClientPlatform();
    delete paymentData.client_platform;
    if (!paymentData.timeStamp || !paymentData.nonceStr || !paymentData.package || !paymentData.paySign) {
        return Promise.reject(new Error('支付参数不完整'));
    }
    if (platform === OFFICIAL_PLATFORM) {
        return requestOfficialPayment(paymentData);
    }
    if (platform === MINIAPP_PLATFORM) {
        return requestMiniappPayment(paymentData);
    }
    return Promise.reject(new Error('当前环境不支持微信支付'));
};

export const isWechatPayCanceled = (error) => {
    const msg = String(error?.errMsg || error?.err_msg || error?.message || '').toLowerCase();
    return msg.includes('cancel');
};

export { OFFICIAL_PLATFORM, MINIAPP_PLATFORM };