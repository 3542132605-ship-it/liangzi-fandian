<template>
  <view class="empty-state">
    <image 
      class="empty-state-image" 
      :src="image || '/static/common/empty-data.png'" 
      mode="aspectFit"
    />
    <text class="empty-state-text">{{text || '暂无数据'}}</text>
    <view class="empty-state-action" v-if="showAction">
      <slot name="action">
        <custom-button 
          :type="actionType" 
          size="sm"
          :round="true"
          @click="onActionClick"
        >{{actionText}}</custom-button>
      </slot>
    </view>
  </view>
</template>

<script>
import CustomButton from './Button.vue';

export default {
  name: 'EmptyState',
  components: {
    CustomButton
  },
  props: {
    text: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    showAction: {
      type: Boolean,
      default: false
    },
    actionText: {
      type: String,
      default: '刷新'
    },
    actionType: {
      type: String,
      default: 'primary'
    }
  },
  methods: {
    onActionClick() {
      this.$emit('action');
    }
  }
}
</script>

<style lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl 0;
  
  .empty-state-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: $spacing-md;
  }
  
  .empty-state-text {
    font-size: $font-size-sm;
    color: $text-color-hint;
    margin-bottom: $spacing-md;
  }
  
  .empty-state-action {
    margin-top: $spacing-sm;
  }
}
</style> 