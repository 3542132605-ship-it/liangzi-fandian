<template>
	<view class="m-tabbar">
		<view
			class="tab-item"
			v-for="tab in tabs"
			:key="tab.key"
			:class="{ active: active === tab.key }"
			@click="switchTab(tab)"
		>
			<view class="tab-icon">
				<text class="tab-char">{{ tab.char }}</text>
			</view>
			<text class="tab-text">{{ tab.text }}</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'ManageTabbar',
	props: {
		active: {
			type: String,
			default: 'dine-in'
		}
	},
	data() {
		return {
			tabs: [
				{ key: 'dine-in', text: '堂食', char: '堂', path: '/pages/manage/dine-in/dine-in' },
				{ key: 'delivery', text: '外卖', char: '外', path: '/pages/manage/delivery/delivery' },
				{ key: 'menu', text: '菜品', char: '菜', path: '/pages/manage/menu/menu' },
				{ key: 'settings', text: '经营', char: '营', path: '/pages/manage/settings/settings' }
			]
		}
	},
	methods: {
		switchTab(tab) {
			if (this.active === tab.key) return
			uni.redirectTo({ url: tab.path })
		}
	}
}
</script>

<style lang="scss" scoped>
.m-tabbar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 999;
	display: flex;
	background: $lz-card;
	border-top: 1rpx solid $lz-line;
	padding-bottom: env(safe-area-inset-bottom);
	box-shadow: $lz-shadow-float;

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 14rpx 0 10rpx;

		.tab-icon {
			width: 56rpx;
			height: 56rpx;
			border-radius: $lz-radius-tag;
			display: flex;
			align-items: center;
			justify-content: center;
			background: transparent;
			transition: all 0.18s;

			.tab-char {
				font-family: $lz-font-serif;
				font-size: 36rpx;
				font-weight: 600;
				color: $lz-ink-3;
			}
		}

		.tab-text {
			margin-top: 6rpx;
			font-size: 22rpx;
			color: $lz-ink-3;
			letter-spacing: 1rpx;
		}

		&.active {
			.tab-icon {
				background: $lz-primary-bg;
				.tab-char { color: $lz-primary; }
			}
			.tab-text { color: $lz-primary; font-weight: 600; }
		}
	}
}
</style>
