<template>
	<view class="page">
		<view class="nav" :style="navStyle">
			<view class="nav-back" @click="goBack"><text class="back-arrow">‹</text></view>
			<text class="nav-title lz-title">营业数据</text>
			<text style="width:60rpx;"></text>
		</view>

		<!-- 今日数据 -->
		<view class="today-card lz-card">
			<text class="card-title">今日数据</text>
			<view class="today-grid">
				<view class="t-cell main">
					<text class="t-value">¥{{ analytics.today.revenue }}</text>
					<text class="t-label">营业额</text>
				</view>
				<view class="t-cell">
					<text class="t-value">{{ analytics.today.orderCount }}</text>
					<text class="t-label">订单数</text>
				</view>
				<view class="t-cell">
					<text class="t-value">{{ analytics.today.dineCount }}</text>
					<text class="t-label">堂食</text>
				</view>
				<view class="t-cell">
					<text class="t-value">{{ analytics.today.deliveryCount }}</text>
					<text class="t-label">外卖</text>
				</view>
			</view>
		</view>

		<!-- 近7天趋势 -->
		<view class="trend-card lz-card">
			<view class="card-head">
				<text class="card-title">近 7 天营业额</text>
				<text class="card-sub">合计 ¥{{ weekTotal }}</text>
			</view>
			<view class="chart">
				<view class="bar-col" v-for="d in analytics.week" :key="d.date">
					<view class="bar-wrap">
						<view class="bar" :style="{ height: barHeight(d.revenue) + '%' }">
							<text class="bar-val">¥{{ d.revenue }}</text>
						</view>
					</view>
					<text class="bar-date">{{ d.date }}</text>
				</view>
			</view>
		</view>

		<!-- 热销排行 -->
		<view class="hot-card lz-card">
			<text class="card-title">热销菜品 Top 5</text>
			<view class="hot-list">
				<view class="hot-row" v-for="(d, i) in analytics.hotDishes" :key="d.name">
					<view class="hot-rank" :class="'r-' + (i + 1)">
						<text>{{ i + 1 }}</text>
					</view>
					<view class="hot-info">
						<view class="hot-top">
							<text class="hot-name">{{ d.name }}</text>
							<text class="hot-revenue">¥{{ d.revenue }}</text>
						</view>
						<view class="hot-bar-bg">
							<view class="hot-bar" :style="{ width: (d.count / maxCount * 100) + '%' }"></view>
						</view>
						<text class="hot-count">售 {{ d.count }} 份</text>
					</view>
				</view>
			</view>
		</view>
		<view style="height:48rpx;"></view>
	</view>
</template>

<script>
import { getAnalytics } from '@/api/manage'

export default {
	data() {
		return {
			analytics: {
				today: { revenue: 0, orderCount: 0, dineCount: 0, deliveryCount: 0 },
				week: [],
				hotDishes: []
			}
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
		},
		weekTotal() {
			return this.analytics.week.reduce((s, d) => s + d.revenue, 0)
		},
		maxRevenue() {
			return Math.max(...this.analytics.week.map(d => d.revenue), 1)
		},
		maxCount() {
			return Math.max(...this.analytics.hotDishes.map(d => d.count), 1)
		}
	},
	onLoad() {
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
					},
					week: (res.trend || []).map(d => ({
						date: d.date ? d.date.slice(5) : '',
						revenue: Number(d.revenue) || 0
					})),
					hotDishes: (res.hotProducts || []).map(d => ({
						name: d.product_name,
						count: Number(d.total_qty) || 0,
						revenue: Number(d.total_revenue) || 0
					}))
				}
			} catch (e) {
				uni.showToast({ title: '加载数据失败', icon: 'none' })
			}
		},
		barHeight(v) {
			return Math.max(20, Math.round(v / this.maxRevenue * 100))
		},
		goBack() { uni.navigateBack() }
	}
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: $lz-paper; }
.nav {
	background: $lz-paper-light;
	border-bottom: 1rpx solid $lz-line;
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	padding: 0 24rpx 24rpx;
	.nav-back { width: 60rpx; .back-arrow { font-size: 52rpx; color: $lz-ink; line-height: 1; } }
	.nav-title { font-size: 36rpx; font-weight: 600; }
}

.card-title { display: block; font-size: 30rpx; color: $lz-ink; font-weight: 600; margin-bottom: 24rpx; }

/* 今日 */
.today-card {
	margin: 24rpx 32rpx 0;
	padding: 28rpx;
	.today-grid {
		display: flex;
		.t-cell {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 8rpx;
			.t-value { font-size: 32rpx; color: $lz-ink; font-weight: 600; }
			.t-label { font-size: 22rpx; color: $lz-ink-3; }
			&.main .t-value { font-size: 44rpx; color: $lz-primary; font-weight: 700; }
		}
	}
}

/* 趋势 */
.trend-card {
	margin: 24rpx 32rpx 0;
	padding: 28rpx;
	.card-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 24rpx;
		.card-title { margin-bottom: 0; }
		.card-sub { font-size: 24rpx; color: $lz-primary; font-weight: 600; }
	}
	.chart {
		display: flex;
		align-items: flex-end;
		height: 320rpx;
		padding-top: 20rpx;
	}
	.bar-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		.bar-wrap {
			flex: 1;
			width: 100%;
			display: flex;
			align-items: flex-end;
			justify-content: center;
			padding: 0 6rpx;
		}
		.bar {
			width: 100%;
			max-width: 56rpx;
			background: linear-gradient(180deg, $lz-primary-light, $lz-primary);
			border-radius: 8rpx 8rpx 0 0;
			display: flex;
			justify-content: center;
			min-height: 40rpx;
			.bar-val {
				position: relative;
				top: -36rpx;
				font-size: 18rpx;
				color: $lz-ink-2;
				white-space: nowrap;
			}
		}
		.bar-date {
			margin-top: 12rpx;
			font-size: 22rpx;
			color: $lz-ink-3;
		}
	}
}

/* 热销 */
.hot-card {
	margin: 24rpx 32rpx 0;
	padding: 28rpx;
	.hot-list {
		display: flex;
		flex-direction: column;
		gap: 28rpx;
	}
	.hot-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
		.hot-rank {
			width: 48rpx; height: 48rpx;
			border-radius: 50%;
			background: $lz-paper;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			text { font-size: 28rpx; color: $lz-ink-3; font-weight: 700; font-family: $lz-font-serif; }
			&.r-1 { background: $lz-primary; text { color: #fff; } }
			&.r-2 { background: $lz-gold; text { color: #fff; } }
			&.r-3 { background: $lz-warn; text { color: #fff; } }
		}
		.hot-info {
			flex: 1;
			.hot-top {
				display: flex;
				align-items: baseline;
				justify-content: space-between;
				.hot-name { font-size: 28rpx; color: $lz-ink; font-weight: 600; }
				.hot-revenue { font-size: 26rpx; color: $lz-primary; font-weight: 600; }
			}
			.hot-bar-bg {
				margin-top: 10rpx;
				height: 10rpx;
				border-radius: 5rpx;
				background: $lz-line;
				overflow: hidden;
				.hot-bar {
					height: 100%;
					background: $lz-primary;
					border-radius: 5rpx;
				}
			}
			.hot-count {
				margin-top: 6rpx;
				font-size: 22rpx;
				color: $lz-ink-3;
			}
		}
	}
}
</style>
