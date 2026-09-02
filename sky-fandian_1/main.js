import Vue from 'vue';
import App from './App';
import uView from "uview-ui";

// 引入全局样式
import './styles/common.scss';

// 注册全局组件
import NavBar from './components/common/NavBar.vue';
import Card from './components/common/Card.vue';
import CustomButton from './components/common/Button.vue';
import EmptyState from './components/common/EmptyState.vue';
import CustomIcon from './components/common/Icon.vue';

const getWindowWidth = (systemInfo = {}) => Number(systemInfo.windowWidth || 375);
const rpxToPx = (value, windowWidth) => (Number(value || 0) * windowWidth) / 750;

// #ifdef MP-WEIXIN
const getMenuButtonRect = () => {
  if (typeof uni.getMenuButtonBoundingClientRect !== 'function') {
    return null;
  }
  const rect = uni.getMenuButtonBoundingClientRect();
  if (rect && rect.width && rect.height) {
    return rect;
  }
  return null;
};

const resolveMiniProgramNavMetrics = (safeTopPx, defaultNavHeightPx, windowWidth) => {
  const rect = getMenuButtonRect();
  if (!rect) {
    return {
      navHeightPx: defaultNavHeightPx,
      capsuleOffsetPx: safeTopPx + defaultNavHeightPx,
      capsuleRightPx: rpxToPx(30, windowWidth)
    };
  }
  const topGapPx = Math.max(Number(rect.top || 0) - safeTopPx, 0);
  const menuHeightPx = Number(rect.height || 0);
  const navHeightPx = Math.max(defaultNavHeightPx, menuHeightPx + topGapPx * 2);
  const capsuleOffsetPx = Math.max(Number(rect.bottom || 0), safeTopPx);
  return {
    navHeightPx,
    capsuleOffsetPx,
    capsuleRightPx: Math.max(windowWidth - Number(rect.left || windowWidth), 0)
  };
};
// #endif

const createNavMetrics = () => {
  const systemInfo = uni.getSystemInfoSync ? uni.getSystemInfoSync() : {};
  const windowWidth = getWindowWidth(systemInfo);
  const defaultNavHeightPx = rpxToPx(88, windowWidth);
  const metrics = {
    safeTopPx: 0,
    navHeightPx: defaultNavHeightPx,
    offsetPx: defaultNavHeightPx,
    capsuleOffsetPx: 0,
    capsuleRightPx: 0,
    toPx(value) {
      return rpxToPx(value, windowWidth);
    }
  };
  // #ifndef H5
  metrics.safeTopPx = Number(systemInfo.statusBarHeight || 0);
  // #endif
  
  // #ifdef MP-WEIXIN
  // 微信小程序：计算胶囊按钮位置
  Object.assign(
    metrics,
    resolveMiniProgramNavMetrics(metrics.safeTopPx, defaultNavHeightPx, windowWidth)
  );
  // #endif
  
  // #ifndef MP-WEIXIN
  // 非微信小程序：使用默认值
  metrics.capsuleOffsetPx = metrics.safeTopPx;
  // #endif
  
  metrics.offsetPx = metrics.safeTopPx + metrics.navHeightPx;
  return metrics;
};

const resolveNavMetrics = (vm) => {
  if (vm && vm.$getNavMetrics) {
    return vm.$getNavMetrics();
  }
  if (vm && vm.$navMetrics) {
    return vm.$navMetrics;
  }
  return createNavMetrics();
};

// ========== 全局禁用 console 打印 ==========
// 开发调试时可以注释掉这段代码
// console.log = function() {};
// console.info = function() {};
// console.warn = function() {};
// 保留 console.error，方便查看错误信息
// console.error = function() {};
// ==========================================

// 使用uView UI
Vue.use(uView);

// 注册自定义全局组件
Vue.component('nav-bar', NavBar);
Vue.component('ui-card', Card);
Vue.component('custom-button', CustomButton);
Vue.component('empty-state', EmptyState);
Vue.component('custom-icon', CustomIcon);

Vue.prototype.$navMetrics = createNavMetrics();
Vue.prototype.$getNavMetrics = createNavMetrics;
Vue.prototype.$resolveNavMetrics = resolveNavMetrics;

Vue.mixin({
  computed: {
    navSafeStyleValue() {
      return this.navSafeStyle();
    },
    navOffsetStyleValue() {
      return this.navOffsetStyle();
    },
    navSpacerStyleValue() {
      return this.navSpacerStyle();
    },
    navBarStyleValue() {
      return this.navBarStyle();
    },
    navSafe32StyleValue() {
      return this.navSafeStyle(this.navRpxToPx(32));
    },
    navTop32StyleValue() {
      return this.navTopStyle(this.navRpxToPx(32));
    },
    navMarginTop80StyleValue() {
      return this.navMarginTopStyle(this.navRpxToPx(80));
    },
    // 顶部呼吸留白：安全区下方统一追加 120rpx，首页/点餐/订单/我的四页共用，保证顶部留白一致且更松弛
    navTopBreathStyleValue() {
      // #ifdef MP-WEIXIN
      return this.navCapsuleSafeStyle(this.navRpxToPx(120));
      // #endif
      // #ifndef MP-WEIXIN
      return this.navSafeStyle(this.navRpxToPx(120));
      // #endif
    },
    // #ifdef MP-WEIXIN
    // 微信小程序专用：胶囊按钮适配
    navCapsuleSafeStyleValue() {
      return this.navCapsuleSafeStyle();
    },
    navCapsuleRightStyleValue() {
      return this.navCapsuleRightStyle();
    },
    navCapsuleSideStyleValue() {
      return this.navCapsuleSideStyle();
    },
    navCapsuleSafe32StyleValue() {
      return this.navCapsuleSafeStyle(this.navRpxToPx(32));
    },
    navCapsuleTop32StyleValue() {
      return this.navCapsuleTopStyle(this.navRpxToPx(32));
    },
    navCapsuleMarginTop80StyleValue() {
      return this.navCapsuleMarginTopStyle(this.navRpxToPx(80));
    }
    // #endif
  },
  methods: {
    navMetrics() {
      return resolveNavMetrics(this);
    },
    navRpxToPx(value) {
      return this.navMetrics().toPx(value);
    },
    navBarHeightPx() {
      return Number(this.navMetrics().navHeightPx || this.navRpxToPx(88));
    },
    navHeaderOffsetPx(extraPx = 0, useCapsule = false) {
      const topPx = useCapsule
        ? this.navCapsuleOffsetPx()
        : Number(this.navMetrics().safeTopPx || 0);
      return topPx + this.navBarHeightPx() + Number(extraPx || 0);
    },
    navCapsuleOffsetPx() {
      const metrics = this.navMetrics();
      if (metrics && metrics.capsuleOffsetPx !== undefined && metrics.capsuleOffsetPx !== null) {
        return Number(metrics.capsuleOffsetPx || 0);
      }
      return Number(metrics.offsetPx || 0);
    },
    navSafeStyle(extraPx = 0) {
      const safeTopPx = Number(this.navMetrics().safeTopPx || 0);
      return {
        paddingTop: `${safeTopPx + Number(extraPx || 0)}px`
      };
    },
    navOffsetStyle(extraPx = 0) {
      return {
        paddingTop: `${this.navHeaderOffsetPx(extraPx)}px`
      };
    },
    navSpacerStyle(extraPx = 0) {
      return {
        height: `${this.navHeaderOffsetPx(extraPx)}px`
      };
    },
    navBarStyle(extraPx = 0) {
      return {
        height: `${this.navBarHeightPx() + Number(extraPx || 0)}px`
      };
    },
    navTopStyle(extraPx = 0) {
      const safeTopPx = Number(this.navMetrics().safeTopPx || 0);
      return {
        top: `${safeTopPx + Number(extraPx || 0)}px`
      };
    },
    navMarginTopStyle(extraPx = 0) {
      const safeTopPx = Number(this.navMetrics().safeTopPx || 0);
      return {
        marginTop: `${safeTopPx + Number(extraPx || 0)}px`
      };
    },
    // #ifdef MP-WEIXIN
    // 微信小程序专用：胶囊按钮适配方法
    navCapsuleSafeStyle(extraPx = 0) {
      const topPx = this.navCapsuleOffsetPx();
      return {
        paddingTop: `${topPx + Number(extraPx || 0)}px`
      };
    },
    navCapsuleRightStyle(extraPx = 0) {
      const metrics = this.navMetrics();
      const capsuleRightPx = Number(metrics.capsuleRightPx || 0);
      const baseRightPx = this.navRpxToPx(30);
      return {
        paddingRight: `${Math.max(capsuleRightPx - baseRightPx, 0) + Number(extraPx || 0)}px`
      };
    },
    navCapsuleSideStyle(extraLeftPx = 0, extraRightPx = 0) {
      const metrics = this.navMetrics();
      const baseSidePx = this.navRpxToPx(30);
      const capsuleRightPx = Number(metrics.capsuleRightPx || 0);
      return {
        paddingLeft: `${baseSidePx + Number(extraLeftPx || 0)}px`,
        paddingRight: `${Math.max(baseSidePx, capsuleRightPx) + Number(extraRightPx || 0)}px`
      };
    },
    navCapsuleTopStyle(extraPx = 0) {
      const topPx = this.navCapsuleOffsetPx();
      return {
        top: `${topPx + Number(extraPx || 0)}px`
      };
    },
    navCapsuleMarginTopStyle(extraPx = 0) {
      const topPx = this.navCapsuleOffsetPx();
      return {
        marginTop: `${topPx + Number(extraPx || 0)}px`
      };
    }
    // #endif
  }
});

Vue.config.productionTip = false;

App.mpType = 'app';

const app = new Vue({
  ...App,
});
app.$mount();
