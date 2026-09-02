<template>
	<view class="popup-wrapper">
		<!-- 遮罩层 -->
		<view class="mask" @click="handleClose"></view>
		
		<!-- 弹窗内容 -->
		<view class="popup-content">
			<view class="wp_-flex-col section_2">
				<!-- 关闭按钮 -->
				<view class="close-btn" @click="handleClose">
					<image src="/static/menu_open/close.png" mode="aspectFit"></image>
				</view>
				
				<view class="wp_-flex-col wp_-self-stretch section_6 mt-39">
					<!-- 原有内容 -->
					<view class="product-info">
						<image class="product-image" :src="product.image" />
						<text class="product-name">{{product.name}}</text>
						<text class="product-spec">规格：{{product.spec}}</text>
						<!-- ... 其他内容 ... -->
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		product: {
			type: Object,
			required: true
		}
	},
	methods: {
		handleClose() {
			this.$emit('close')
		}
	}
}
</script>

<style scoped lang="scss">
.popup-wrapper {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9999; // 确保弹窗在最上层
	
	// 遮罩层
	.mask {
		position: fixed; // 改为fixed定位
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.6);
		z-index: 9999; // 遮罩层z-index
	}
	
	// 弹窗内容
	.popup-content {
		position: fixed; // 改为fixed定位
		left: 0;
		right: 0;
		bottom: 0;
		max-height: 90vh;
		overflow-y: auto;
		background-color: #fff;
		border-radius: 40rpx 40rpx 0 0;
		animation: slideUp 0.3s ease-out;
		z-index: 10000; // 内容层z-index要比遮罩层高
	}
	
	// 关闭按钮
	.close-btn {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		width: 60rpx;
		height: 60rpx;
		padding: 15rpx;
		z-index: 10001; // 确保关闭按钮在最上层
		
		image {
			width: 100%;
			height: 100%;
		}
	}
}

// 上滑动画
@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}

// 修改原有样式
.section_2 {
	padding-top: 20rpx;
	background-color: #ffffff;
}

.section_6 {
	border-radius: 0;
}
</style>