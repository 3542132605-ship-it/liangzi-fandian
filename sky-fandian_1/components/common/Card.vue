<template>
  <view class="card" :class="[shadow ? 'card-shadow' : '']">
    <!-- 卡片头部 -->
    <view class="card-header" v-if="$slots.header || title">
      <slot name="header">
        <text class="card-title">{{title}}</text>
        <text class="card-subtitle" v-if="subtitle">{{subtitle}}</text>
      </slot>
    </view>
    
    <!-- 卡片内容 -->
    <view class="card-body" :class="[bodyPadding]">
      <slot></slot>
    </view>
    
    <!-- 卡片底部 -->
    <view class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Card',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    padding: {
      type: String,
      default: 'md' // xs, sm, md, lg, xl, none
    },
    shadow: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    bodyPadding() {
      if (this.padding === 'none') {
        return 'no-padding';
      }
      return `padding-${this.padding}`;
    }
  }
}
</script>

<style lang="scss">
.card {
  background-color: $card-background;
  border-radius: $border-radius-md;
  margin-bottom: $spacing-md;
  overflow: hidden;
  
  &.card-shadow {
    box-shadow: $shadow-sm;
  }
  
  .card-header {
    padding: $spacing-md;
    border-bottom: 1px solid $divider-color;
    
    .card-title {
      font-size: $font-size-md;
      font-weight: bold;
      color: $text-color-primary;
      display: block;
    }
    
    .card-subtitle {
      font-size: $font-size-xs;
      color: $text-color-hint;
      margin-top: $spacing-xs;
      display: block;
    }
  }
  
  .card-body {
    &.padding-xs {
      padding: $spacing-xs;
    }
    
    &.padding-sm {
      padding: $spacing-sm;
    }
    
    &.padding-md {
      padding: $spacing-md;
    }
    
    &.padding-lg {
      padding: $spacing-lg;
    }
    
    &.padding-xl {
      padding: $spacing-xl;
    }
    
    &.no-padding {
      padding: 0;
    }
  }
  
  .card-footer {
    padding: $spacing-md;
    border-top: 1px solid $divider-color;
  }
}
</style> 