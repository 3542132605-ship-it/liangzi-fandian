<template>
  <view class="custom-icon" :style="iconStyle">
    <!-- uView 内置图标 -->
    <u-icon v-if="!custom" :name="name" :size="size" :color="color"></u-icon>
    
    <!-- 自定义图标 -->
    <image v-else :src="customSrc" mode="aspectFit" class="custom-image"></image>
  </view>
</template>

<script>
export default {
  name: 'CustomIcon',
  props: {
    // 图标名称（uView图标名称或自定义图标名称）
    name: {
      type: String,
      required: true
    },
    // 是否使用自定义图标
    custom: {
      type: Boolean,
      default: false
    },
    // 图标尺寸
    size: {
      type: [String, Number],
      default: 32
    },
    // 图标颜色
    color: {
      type: String,
      default: ''
    }
  },
  computed: {
    // 自定义图标路径
    customSrc() {
      return `/static/icons/${this.name}.png`;
    },
    // 图标样式
    iconStyle() {
      const style = {};
      if (this.custom) {
        style.width = this.size + 'rpx';
        style.height = this.size + 'rpx';
      }
      return style;
    }
  }
}
</script>

<style lang="scss">
.custom-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  .custom-image {
    width: 100%;
    height: 100%;
  }
}
</style> 