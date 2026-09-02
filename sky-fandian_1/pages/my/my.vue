<template>
	<view class="page">
		<!-- 顶部用户区 -->
		<view class="profile" :style="profileStyle">
			<view class="profile-inner">
				<view class="avatar-wrap" @click="handleLogin">
					<image v-if="userInfo.avatarUrl" class="avatar" :src="userInfo.avatarUrl" mode="aspectFill" />
					<view v-else class="avatar avatar-default">
						<text class="avatar-char">客</text>
					</view>
				</view>
				<view class="profile-info">
					<text class="nick-name" v-if="userInfo.nickName">{{ userInfo.nickName }}</text>
					<text class="nick-name nick-login" v-else>点击登录</text>
					<text class="profile-sub">欢迎光临 良子饭店</text>
				</view>
			</view>
		</view>

		<!-- 订单入口 -->
		<view class="menu-card lz-card">
			<view class="menu-item" @click="goOrders('all')">
				<view class="menu-icon icon-order"><text>单</text></view>
				<text class="menu-label">我的订单</text>
				<text class="menu-arrow">›</text>
			</view>
			<view class="menu-divider"></view>
			<view class="menu-item" @click="goOrders('dine_in')">
				<view class="menu-icon icon-dine"><text>堂</text></view>
				<text class="menu-label">堂食订单</text>
				<text class="menu-arrow">›</text>
			</view>
			<view class="menu-divider"></view>
			<view class="menu-item" @click="goOrders('delivery')">
				<view class="menu-icon icon-delivery"><text>外</text></view>
				<text class="menu-label">外卖订单</text>
				<text class="menu-arrow">›</text>
			</view>
		</view>

		<!-- 功能入口 -->
		<view class="menu-card lz-card">
			<view class="menu-item" @click="goAddress">
				<view class="menu-icon icon-addr"><text>址</text></view>
				<text class="menu-label">收货地址</text>
				<text class="menu-arrow">›</text>
			</view>
			<view class="menu-divider"></view>
			<view class="menu-item" @click="goManage">
				<view class="menu-icon icon-manage"><text>管</text></view>
				<text class="menu-label">员工入口</text>
				<text class="menu-arrow">›</text>
			</view>
		</view>

		<!-- 底部 -->
		<view class="footer">
			<text class="footer-name lz-title">良子饭店</text>
			<text class="footer-sub">济宁菜馆 · v1.0</text>
		</view>
	</view>
</template>

<script>
import { customerLogin } from '@/api/customer'

export default {
	data() {
		return {
			userInfo: {}
		}
	},
	computed: {
		profileStyle() {
			return this.navTopBreathStyleValue
		}
	},
	onShow() {
		this.userInfo = uni.getStorageSync('userInfo') || {}
	},
	methods: {
		async handleLogin() {
			if (this.userInfo.nickName) return
			try {
				uni.showLoading({ title: '登录中...' })
				const res = await customerLogin({})
				uni.setStorageSync('token', res.token)
				uni.setStorageSync('userId', res.userId)
				const info = { nickName: res.nickname || '微信用户', avatarUrl: '' }
				this.userInfo = info
				uni.setStorageSync('userInfo', info)
				uni.hideLoading()
				uni.showToast({ title: '登录成功', icon: 'none' })
			} catch (e) {
				uni.hideLoading()
				uni.showToast({ title: e.message || '登录失败', icon: 'none' })
			}
		},
		goOrders(tab) {
			uni.switchTab({ url: '/pages/order/order' })
		},
		goAddress() {
			uni.navigateTo({ url: '/pages/address/address' })
		},
		goManage() {
			if (uni.getStorageSync('staff_token')) {
				uni.reLaunch({ url: '/pages/manage/dine-in/dine-in' })
			} else {
				uni.navigateTo({ url: '/pages/manage/login/login' })
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background: $lz-paper;
	padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
}

/* 用户区 */
.profile {
	background: $lz-paper-light;
	border-bottom: 1rpx solid $lz-line;
	padding-top: 100px;

	.profile-inner {
		padding: 24rpx 40rpx 40rpx;
		display: flex;
		align-items: center;
		gap: 28rpx;
	}

	.avatar-wrap {
		.avatar {
			width: 120rpx;
			height: 120rpx;
			border-radius: 50%;
			border: 3rpx solid $lz-line;
		}
		.avatar-default {
			background: linear-gradient(135deg, $lz-primary-bg, rgba(184, 149, 106, 0.12));
			display: flex;
			align-items: center;
			justify-content: center;
			.avatar-char {
				font-family: $lz-font-serif;
				font-size: 52rpx;
				color: $lz-primary;
				opacity: 0.7;
			}
		}
	}

	.profile-info {
		display: flex;
		flex-direction: column;
		gap: 8rpx;

		.nick-name {
			font-size: 36rpx;
			color: $lz-ink;
			font-weight: 600;
		}
		.nick-login { color: $lz-primary; }
		.profile-sub { font-size: 24rpx; color: $lz-ink-3; }
	}
}

/* 菜单卡片 */
.menu-card {
	margin: 24rpx 32rpx 0;
	padding: 8rpx 28rpx;

	.menu-item {
		display: flex;
		align-items: center;
		padding: 26rpx 0;
		gap: 24rpx;

		&:active { opacity: 0.7; }

		.menu-icon {
			width: 64rpx;
			height: 64rpx;
			border-radius: $lz-radius-tag;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			text {
				font-family: $lz-font-serif;
				font-size: 30rpx;
				font-weight: 700;
			}

			&.icon-order { background: $lz-primary-bg; text { color: $lz-primary; } }
			&.icon-dine { background: $lz-primary-bg; text { color: $lz-primary; } }
			&.icon-delivery { background: rgba(184, 149, 106, 0.14); text { color: $lz-gold; } }
			&.icon-addr { background: rgba(74, 124, 89, 0.12); text { color: $lz-success; } }
			&.icon-manage { background: $lz-paper; text { color: $lz-ink-2; } }
		}

		.menu-label {
			flex: 1;
			font-size: 30rpx;
			color: $lz-ink;
		}
		.menu-arrow {
			font-size: 40rpx;
			color: $lz-ink-3;
			line-height: 1;
		}
	}

	.menu-divider {
		height: 1rpx;
		background: $lz-line-light;
		margin-left: 88rpx;
	}
}

/* 底部 */
.footer {
	margin-top: 80rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;

	.footer-name {
		font-size: 30rpx;
		color: $lz-ink-3;
		letter-spacing: 4rpx;
	}
	.footer-sub {
		font-size: 22rpx;
		color: $lz-ink-3;
		opacity: 0.7;
	}
}
</style>
