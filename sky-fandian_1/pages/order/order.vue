<template>
	<view class="page">
		<!-- 自定义导航 -->
		<view class="nav" :style="navStyle">
			<text class="nav-title lz-title">我的订单</text>
		</view>

		<!-- 状态 Tab -->
		<view class="tabs">
			<view
				class="tab-item"
				:class="{'active': currentTab === tab.value}"
				v-for="tab in tabs"
				:key="tab.value"
				@click="currentTab = tab.value"
			>
				<text>{{ tab.label }}</text>
			</view>
		</view>

		<scroll-view scroll-y class="list">
			<view v-if="filteredOrders.length === 0" class="empty">
				<text class="empty-char">无</text>
				<text class="empty-text">暂无订单</text>
			</view>

			<view
				class="order-card lz-card"
				v-for="order in filteredOrders"
				:key="order.id"
				@click="toggleOrder(order.id)"
			>
				<view class="card-head">
					<view class="head-left">
						<text class="order-type">{{ order.type === 'dine_in' ? '堂食' : '外卖' }}</text>
						<text class="order-id">{{ order.order_no }}</text>
					</view>
					<text class="status-tag" :class="statusClass(order.status)">{{ order.status_text }}</text>
				</view>

				<view class="card-body">
					<view class="dish-summary">
						<text class="summary-text" v-if="order.items && order.items.length">
							{{ order.items.map(i => i.name).join('、') }}
						</text>
						<text class="summary-text" v-else>
							{{ order.order_no }}
						</text>
					</view>
					<text class="order-time">{{ order.created_at }}</text>
				</view>

				<view class="card-foot">
					<text class="foot-count">共 {{ orderItemCount(order) }} 件</text>
					<view class="foot-price">
						<text class="price-label">实付</text>
						<text class="price-value">¥{{ Number(order.total).toFixed(2) }}</text>
					</view>
				</view>

				<!-- 展开详情 -->
				<view class="detail" v-if="expandedId === order.id">
					<view class="detail-divider"></view>
					<view class="detail-row" v-if="order.type === 'dine_in'">
						<text class="dl-label">桌号</text>
						<text class="dl-value">{{ order.table_no }}号桌 · {{ order.people_count }}人</text>
					</view>
					<view class="detail-row" v-else>
						<text class="dl-label">地址</text>
						<text class="dl-value">{{ order.address }}</text>
					</view>
					<view class="detail-dish" v-for="(item, idx) in order.items" :key="idx">
						<text class="dd-name">{{ item.name }}</text>
						<text class="dd-spec" v-if="item.spec && item.spec !== '默认'">{{ item.spec }}</text>
						<text class="dd-qty">×{{ item.quantity }}</text>
						<text class="dd-sum">¥{{ Number(item.price).toFixed(2) }}</text>
					</view>
					<view class="detail-cancel" v-if="order.status === 'pending'">
						<text class="cancel-btn" @click.stop="cancelOrder(order)">取消订单</text>
					</view>
				</view>
			</view>

			<view class="list-end">
				<view class="end-line"></view>
				<text class="end-text">仅显示近期订单</text>
				<view class="end-line"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { getOrders, getOrderDetail, cancelOrder } from '@/api/customer'

const STATUS_TEXT = {
	pending: '待支付',
	cooking: '备菜中',
	partial_served: '部分上菜',
	served: '已上齐',
	delivering: '配送中',
	delivered: '已送达',
	done: '已完成',
	canceled: '已取消'
}

export default {
	data() {
		return {
			tabs: [
				{ label: '全部', value: 'all' },
				{ label: '堂食', value: 'dine_in' },
				{ label: '外卖', value: 'delivery' }
			],
			currentTab: 'all',
			orders: [],
			expandedId: null
		}
	},
	computed: {
		navStyle() {
			return this.navTopBreathStyleValue
		},
		filteredOrders() {
			if (this.currentTab === 'all') return this.orders
			return this.orders.filter(o => o.type === this.currentTab)
		}
	},
	onShow() {
		this.loadOrders()
	},
	onPullDownRefresh() {
		this.loadOrders().finally(() => uni.stopPullDownRefresh())
	},
	methods: {
		async loadOrders() {
			try {
				const list = await getOrders()
				this.orders = list.map(o => ({
					...o,
					status_text: STATUS_TEXT[o.status] || o.status,
					total: o.total_amount,
					type: o.type === 'dine_in' ? 'dine_in' : o.type
				}))
			} catch (e) {
				console.error('加载订单失败:', e)
			}
		},
		async toggleOrder(id) {
			if (this.expandedId === id) {
				this.expandedId = null
				return
			}
			this.expandedId = id
			// 加载详情以获取 items
			const order = this.orders.find(o => o.id === id)
			if (order && !order.items) {
				try {
					const detail = await getOrderDetail(id)
					order.items = (detail.items || []).map(it => ({
						...it,
						name: it.product_name,
						spec: it.spec_name || '默认',
						served: it.status === 'served'
					}))
				} catch (e) {
					console.error('加载订单详情失败:', e)
				}
			}
		},
		orderItemCount(order) {
			return (order.items || []).reduce((s, i) => s + i.quantity, 0)
		},
		statusClass(status) {
			const map = {
				pending: 'st-pending',
				cooking: 'st-cooking',
				partial_served: 'st-cooking',
				served: 'st-done',
				delivering: 'st-done',
				delivered: 'st-done',
				done: 'st-finish',
				canceled: 'st-finish'
			}
			return map[status] || 'st-finish'
		},
		cancelOrder(order) {
			uni.showModal({
				title: '取消订单',
				content: '确定取消该订单吗？',
				confirmColor: '#9B2D28',
				success: async (r) => {
					if (r.confirm) {
						try {
							await cancelOrder(order.id)
							order.status = 'canceled'
							order.status_text = '已取消'
							uni.showToast({ title: '已取消', icon: 'none' })
						} catch (e) {
							uni.showToast({ title: e.message || '取消失败', icon: 'none' })
						}
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
	display: flex;
	flex-direction: column;
}

.nav {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 100px 24rpx 20rpx;
	background: $lz-paper-light;
	border-bottom: 1rpx solid $lz-line;

	.nav-title {
		font-size: 34rpx;
		color: $lz-ink;
		font-weight: 600;
	}
}

.tabs {
	display: flex;
	background: $lz-card;
	padding: 0 32rpx;
	border-bottom: 1rpx solid $lz-line-light;

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 24rpx 0;
		font-size: 28rpx;
		color: $lz-ink-2;
		position: relative;
		transition: color 0.2s;

		&.active {
			color: $lz-primary;
			font-weight: 600;
			&::after {
				content: '';
				position: absolute;
				left: 50%;
				bottom: 0;
				transform: translateX(-50%);
				width: 48rpx;
				height: 4rpx;
				background: $lz-primary;
				border-radius: 2rpx;
			}
		}
	}
}

.list {
	flex: 1;
	padding: 24rpx 32rpx;
}

.empty {
	padding: 120rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;

	.empty-char {
		font-family: $lz-font-serif;
		font-size: 96rpx;
		color: $lz-ink-3;
		opacity: 0.25;
	}
	.empty-text { font-size: 28rpx; color: $lz-ink-3; }
}

.order-card {
	padding: 28rpx;
	margin-bottom: 20rpx;

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.head-left {
			display: flex;
			align-items: center;
			gap: 16rpx;
			.order-type {
				font-size: 22rpx;
				color: #fff;
				background: $lz-ink;
				padding: 4rpx 14rpx;
				border-radius: $lz-radius-tag;
			}
			.order-id { font-size: 24rpx; color: $lz-ink-3; }
		}

		.status-tag {
			font-size: 24rpx;
			font-weight: 600;
			padding: 6rpx 18rpx;
			border-radius: $lz-radius-tag;

			&.st-pending { color: $lz-warn; background: rgba(199, 123, 58, 0.1); }
			&.st-cooking { color: $lz-primary; background: $lz-primary-bg; }
			&.st-done { color: $lz-success; background: rgba(74, 124, 89, 0.1); }
			&.st-finish { color: $lz-ink-3; background: $lz-paper; }
		}
	}

	.card-body {
		margin: 20rpx 0;

		.dish-summary {
			.summary-text {
				font-size: 28rpx;
				color: $lz-ink;
				line-height: 1.5;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
			}
		}
		.order-time {
			display: block;
			margin-top: 12rpx;
			font-size: 22rpx;
			color: $lz-ink-3;
		}
	}

	.card-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.foot-count { font-size: 24rpx; color: $lz-ink-3; }
		.foot-price {
			display: flex;
			align-items: baseline;
			gap: 8rpx;
			.price-label { font-size: 22rpx; color: $lz-ink-3; }
			.price-value { font-size: 34rpx; color: $lz-primary; font-weight: 700; }
		}
	}

	.detail {
		.detail-divider {
			height: 1rpx;
			background: $lz-line-light;
			margin: 20rpx 0;
		}
		.detail-row {
			display: flex;
			align-items: flex-start;
			gap: 20rpx;
			padding: 8rpx 0;
			.dl-label { font-size: 24rpx; color: $lz-ink-3; min-width: 80rpx; flex-shrink: 0; }
			.dl-value { font-size: 26rpx; color: $lz-ink-2; flex: 1; line-height: 1.5; }
		}
		.detail-dish {
			display: flex;
			align-items: center;
			gap: 12rpx;
			padding: 10rpx 0;
			.dd-name { font-size: 26rpx; color: $lz-ink; flex: 1; }
			.dd-spec { font-size: 22rpx; color: $lz-ink-3; }
			.dd-qty { font-size: 24rpx; color: $lz-ink-3; min-width: 50rpx; text-align: right; }
			.dd-sum { font-size: 26rpx; color: $lz-ink; min-width: 90rpx; text-align: right; }
		}
		.detail-cancel {
			margin-top: 20rpx;
			text-align: right;
			.cancel-btn {
				font-size: 26rpx;
				color: $lz-warn;
				padding: 10rpx 24rpx;
				border: 1rpx solid $lz-warn;
				border-radius: $lz-radius-pill;
			}
		}
	}
}

.list-end {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 20rpx;
	padding: 32rpx 0;
	.end-line { width: 60rpx; height: 1rpx; background: $lz-line; }
	.end-text { font-size: 22rpx; color: $lz-ink-3; letter-spacing: 4rpx; }
}
</style>
