<template>
  <button
    class="custom-btn"
    :class="[
      `btn-${type}`,
      size ? `btn-${size}` : '',
      block ? 'btn-block' : '',
      round ? 'btn-round' : '',
      disabled ? 'btn-disabled' : ''
    ]"
    :disabled="disabled"
    :form-type="formType"
    :open-type="openType"
    @tap="onClick"
  >
    <custom-icon v-if="icon" :name="icon" :color="iconColor" :size="iconSize" class="btn-icon"></custom-icon>
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'CustomButton',
  props: {
    type: {
      type: String,
      default: 'primary' // primary, outline, info, success, warning, danger
    },
    size: {
      type: String,
      default: '' // sm, md, lg
    },
    block: {
      type: Boolean,
      default: false
    },
    round: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: ''
    },
    iconSize: {
      type: [String, Number],
      default: 28
    },
    formType: {
      type: String,
      default: ''
    },
    openType: {
      type: String,
      default: ''
    }
  },
  computed: {
    iconColor() {
      if (this.type === 'outline') {
        return '#8cd548';
      }
      return '#ffffff';
    }
  },
  methods: {
    onClick() {
      if (!this.disabled) {
        this.$emit('click');
      }
    }
  }
}
</script>

<style lang="scss">
.custom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-md;
  height: 80rpx;
  padding: 0 $spacing-lg;
  border-radius: $border-radius-md;
  border: none;
  margin: 0;
  position: relative;
  overflow: hidden;
  
  &::after {
    border: none;
  }
  
  .btn-icon {
    margin-right: $spacing-xs;
  }
  
  // 类型样式
  &.btn-primary {
    background: $gradient-primary;
    color: #fff;
  }
  
  &.btn-outline {
    background-color: transparent;
    border: 1px solid $primary-color;
    color: $primary-color;
  }
  
  &.btn-info {
    background-color: $info-color;
    color: #fff;
  }
  
  &.btn-success {
    background-color: $success-color;
    color: #fff;
  }
  
  &.btn-warning {
    background-color: $warning-color;
    color: #fff;
  }
  
  &.btn-danger {
    background-color: $error-color;
    color: #fff;
  }
  
  // 尺寸样式
  &.btn-sm {
    height: 60rpx;
    font-size: $font-size-sm;
    padding: 0 $spacing-md;
  }
  
  &.btn-lg {
    height: 100rpx;
    font-size: $font-size-lg;
    padding: 0 $spacing-xl;
  }
  
  // 块级样式
  &.btn-block {
    width: 100%;
    display: flex;
  }
  
  // 圆角样式
  &.btn-round {
    border-radius: $border-radius-pill;
  }
  
  // 禁用样式
  &.btn-disabled {
    opacity: 0.6;
    background-color: $text-color-disabled;
    color: #fff;
    
    &.btn-outline {
      background-color: transparent;
      border-color: $text-color-disabled;
      color: $text-color-disabled;
    }
  }
}
</style> 