<template>
  <view class="navbar-wrapper">
    <view v-if="placeholder" class="navbar-placeholder" :style="{ height: navbarHeight + 'px' }"></view>
    <view class="navbar">
      <view class="status-bar" :class="[bgClass]" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="navbar-content" :class="[bgClass]" :style="[{ height: navHeightPx + 'px' }, navCapsuleSideStyleValue]">
        <!-- 返回按钮（非tabbar页面显示） -->
        <view v-if="!isTabbar" class="navbar-left" @tap="goBack">
          <custom-icon name="arrow-left" :color="textColor" :size="36"></custom-icon>
        </view>
        <view v-else class="navbar-left"></view>
        
        <!-- 页面标题 -->
        <text class="navbar-title" :style="{color: textColor}">{{title}}</text>
        
        <!-- 右侧操作区域（可自定义） -->
        <view class="navbar-right">
          <slot name="right"></slot>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    title: {
      type: String,
      default: ''
    },
    isTabbar: {
      type: Boolean,
      default: false
    },
    textColor: {
      type: String,
      default: '#333'
    },
    background: {
      type: String,
      default: '' // 可选：primary, transparent, white
    },
    placeholder: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      statusBarHeight: 20,
      navHeightPx: 44
    }
  },
  computed: {
    navbarHeight() {
      return Number(this.statusBarHeight || 0) + Number(this.navHeightPx || 44);
    },
    bgClass() {
      if (this.background === 'primary') {
        return 'bg-primary';
      } else if (this.background === 'transparent') {
        return 'bg-transparent';
      } else if (this.background === 'white') {
        return 'bg-white';
      }
      return 'bg-white';
    }
  },
  created() {
    const navMetrics = this.$getNavMetrics ? this.$getNavMetrics() : {};
    this.statusBarHeight = Number(navMetrics.safeTopPx || 0);
    this.navHeightPx = Number(navMetrics.navHeightPx || 44);
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.switchTab({
            url: '/pages/home/home'
          });
        }
      });
    }
  }
}
</script>

<style lang="scss">
.navbar-wrapper {
  width: 100%;
}

.navbar-placeholder {
  width: 100%;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;

  .status-bar,
  .navbar-content {
    &.bg-primary {
      background: $gradient-primary;
    }

    &.bg-transparent {
      background-color: transparent;
    }

    &.bg-white {
      background-color: #fff;
      border-bottom: 1px solid $border-color;
    }
  }
  
  .navbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .navbar-left, .navbar-right {
      width: 88rpx;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .navbar-title {
      font-size: $font-size-lg;
      font-weight: bold;
      flex: 1;
      text-align: center;
    }
  }
}
</style> 