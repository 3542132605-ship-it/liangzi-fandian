<template>
	<view class="page">
		<!-- 顶栏 -->
		<view class="nav" :style="navStyle">
			<text class="nav-title lz-title">经营管理</text>
			<text class="nav-logout" @click="logout">退出</text>
		</view>

		<!-- 今日概览 -->
		<view class="overview lz-card">
			<view class="ov-head">
				<text class="ov-title">今日概览</text>
				<text class="ov-date">{{ today }}</text>
			</view>
			<view class="ov-body">
				<view class="ov-cell main">
					<text class="ov-value">¥{{ analytics.today.revenue }}</text>
					<text class="ov-label">营业额</text>
				</view>
				<view class="ov-divider"></view>
				<view class="ov-cell">
					<text class="ov-value">{{ analytics.today.orderCount }}</text>
					<text class="ov-label">总订单</text>
				</view>
				<view class="ov-divider"></view>
				<view class="ov-cell">
					<text class="ov-value">{{ analytics.today.dineCount }}</text>
					<text class="ov-label">堂食</text>
				</view>
				<view class="ov-divider"></view>
				<view class="ov-cell">
					<text class="ov-value">{{ analytics.today.deliveryCount }}</text>
					<text class="ov-label">外卖</text>
				</view>
			</view>
		</view>

		<!-- 功能入口 -->
		<view class="func-list">
			<view class="func-card lz-card" v-for="f in funcs" :key="f.key" @click="goSub(f)">
				<view class="func-icon" :style="{ background: f.bg }">
					<text class="icon-char" :style="{ color: f.color }">{{ f.char }}</text>
				</view>
				<view class="func-info">
					<text class="func-title">{{ f.title }}</text>
					<text class="func-desc">{{ f.desc }}</text>
				</view>
				<text class="func-arrow">›</text>
			</view>
		</view>

		<view style="height: 140rpx;"></view>
		<manage-tabbar active="settings"></manage-tabbar>
	</view>
</template>

<script>
import { getAnalytics } from '@/api/manage'
import ManageTabbar from '@/components/manage-tabbar/manage-tabbar.vue'

export default {
	components: { ManageTabbar },
	data() {
		return {
			analytics: {
				today: { revenue: 0, orderCount: 0, dineCount: 0, deliveryCount: 0 }
			},
			today: '',
			funcs: [
				{ key: 'tables', title: '桌台管理', desc: '查看 10 桌二维码 · 长按保存', char: '桌', color: '#9B2D28', bg: 'rgba(155,45,40,0.08)', path: '/pages/manage/settings/tables' },
				{ key: 'staff', title: '员工管理', desc: '管理账号 · 重置密码', char: '员', color: '#B8956A', bg: 'rgba(184,149,106,0.14)', path: '/pages/manage/settings/staff' },
				{ key: 'delivery', title: '配送设置', desc: '起送价', char: '配', color: '#4A7C59', bg: 'rgba(74,124,89,0.12)', path: '/pages/manage/settings/delivery-config' },
				{ key: 'analytics', title: '营业数据', desc: '营业额 · 趋势 · 热销榜', char: '数', color: '#9B2D28', bg: 'rgba(155,45,40,0.08)', path: '/pages/manage/settings/analytics' }
			]
		}
	},
	computed: {
		navStyle() {
			// #ifdef MP-WEIXIN
			return this.navCapsuleSafeStyleValue
			// #endif
			// #ifndef MP-WEIXIN
			return this.navSafeStyleValue
			// #endif
		}
	},
	onLoad() {
		if (!uni.getStorageSync('staff_token')) {
			uni.reLaunch({ url: '/pages/manage/login/login' })
			return
		}
		const d = new Date()
		this.today = `${d.getMonth() + 1}月${d.getDate()}日`
		this.loadAnalytics()
	},
	onShow() {
		this.loadAnalytics()
	},
	methods: {
		async loadAnalytics() {
			try {
				const res = await getAnalytics()
				this.analytics = {
					today: {
						revenue: Number(res.today.total_revenue) || 0,
						orderCount: Number(res.today.order_count) || 0,
						dineCount: 0,
						deliveryCount: 0
					}
				}
			} catch (e) {
				// 静默失败，保留默认值
			}
		},
		goSub(f) {
			uni.navigateTo({ url: f.path })
		},
		logout() {
			uni.showModal({
				title: '退出登录',
				content: '确定退出管理后台？',
				success: (res) => {
					if (res.confirm) {
						uni.removeStorageSync('staff_token')
						uni.removeStorageSync('staff_info')
						uni.reLaunch({ url: '/pages/home/home' })
					}
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background: $lz-paper;
}

.nav {
	background: $lz-paper-light;
	border-bottom: 1rpx solid $lz-line;
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	padding: 0 32rpx 24rpx;
	.nav-title { font-size: 38rpx; font-weight: 600; letter-spacing: 3rpx; }
	.nav-logout { font-size: 26rpx; color: $lz-ink-3; padding: 8rpx 0; }
}

/* 概览 */
.overview {
	margin: 24rpx 32rpx 0;
	padding: 28rpx;
	.ov-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 24rpx;
		.ov-title { font-size: 30rpx; color: $lz-ink; font-weight: 600; }
		.ov-date { font-size: 24rpx; color: $lz-ink-3; }
	}
	.ov-body {
		display: flex;
		align-items: center;
	}
	.ov-cell {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
		.ov-value {
			font-size: 32rpx;
			color: $lz-ink;
			font-weight: 600;
		}
		.ov-label { font-size: 22rpx; color: $lz-ink-3; }
		&.main {
			.ov-value { font-size: 44rpx; color: $lz-primary; font-weight: 700; }
		}
	}
	.ov-divider {
		width: 1rpx;
		height: 56rpx;
		background: $lz-line;
	}
}

/* 功能列表 */
.func-list {
	padding: 28rpx 32rpx 0;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}
.func-card {
	display: flex;
	align-items: center;
	gap: 24rpx;
	padding: 28rpx;
	&:active { transform: scale(0.98); }
	.func-icon {
		width: 88rpx;
		height: 88rpx;
		border-radius: $lz-radius-card;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		.icon-char {
			font-family: $lz-font-serif;
			font-size: 44rpx;
			font-weight: 700;
		}
	}
	.func-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		.func-title { font-size: 32rpx; color: $lz-ink; font-weight: 600; }
		.func-desc { font-size: 24rpx; color: $lz-ink-3; }
	}
	.func-arrow { font-size: 40rpx; color: $lz-ink-3; line-height: 1; }
}
</style>
