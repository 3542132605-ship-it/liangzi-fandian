<template>
	<view class="page">
		<!-- 顶栏 -->
		<view class="nav" :style="navStyle">
			<text class="nav-title lz-title">堂食订单</text>
			<text class="nav-logout" @click="logout">退出</text>
		</view>

		<!-- 桌号概览 -->
		<view class="overview">
			<view class="ov-head">
				<text class="ov-title">桌台概览</text>
				<text class="ov-tip">在桌 {{ activeCount }} 桌</text>
			</view>
			<view class="ov-grid">
				<view
					class="ov-cell"
					v-for="t in tableOverview"
					:key="t.no"
					:class="{ active: t.hasOrder, cooking: t.status === 'cooking', served: t.status === 'served' }"
					@click="scrollToTable(t.no)"
				>
					<text class="cell-no">{{ t.no }}</text>
					<text class="cell-text">{{ t.label }}</text>
				</view>
			</view>
		</view>

		<!-- 状态筛选 -->
		<view class="filter">
			<view
				class="filter-item"
				v-for="f in filters"
				:key="f.key"
				:class="{ active: currentFilter === f.key }"
				@click="currentFilter = f.key"
			>
				<text>{{ f.text }}</text>
			</view>
		</view>

		<!-- 订单列表 -->
		<view class="order-list" v-if="filteredOrders.length">
			<view
				class="order-card lz-card"
				v-for="order in filteredOrders"
				:key="order.id"
				:id="'table-' + order.table_no"
			>
				<!-- 卡片头 -->
				<view class="card-head">
					<view class="head-left">
						<view class="table-badge">
							<text class="table-no">{{ order.table_no }}</text>
							<text class="table-suffix">号桌</text>
						</view>
						<view class="head-info">
							<text class="info-status" :class="'st-' + order.status">{{ order.status_text }}</text>
							<text class="info-meta">{{ order.people_count }} 人 · {{ order.created_at.slice(11) }}</text>
						</view>
					</view>
					<text class="head-amount">¥{{ order.total }}</text>
				</view>

				<!-- 菜品明细 -->
				<view class="dish-list">
					<view
						class="dish-row"
						v-for="(item, idx) in order.items"
						:key="idx"
						:class="{ served: item.served }"
						@click="toggleDish(order, idx)"
					>
						<view class="dish-check" :class="{ checked: item.served }">
							<text v-if="item.served" class="check-icon">✓</text>
						</view>
						<view class="dish-main">
							<text class="dish-name">{{ item.name }}</text>
							<text class="dish-spec" v-if="item.spec && item.spec !== '默认'">{{ item.spec }}</text>
						</view>
						<text class="dish-price">¥{{ item.price }} ×{{ item.quantity }}</text>
					</view>
				</view>

				<!-- 卡片操作 -->
				<view class="card-actions" v-if="order.status !== 'pending'">
					<view class="act-progress">
						<text class="prog-text">{{ servedCount(order) }}/{{ order.items.length }} 已上</text>
						<view class="prog-bar">
							<view class="prog-fill" :style="{ width: (servedCount(order) / order.items.length * 100) + '%' }"></view>
						</view>
					</view>
					<view class="act-btns">
						<view
							class="act-btn ghost"
							v-if="order.status !== 'done' && order.status !== 'served'"
							@click="serveAll(order)"
						>
							<text>一键全上</text>
						</view>
						<view
							class="act-btn primary"
							v-if="order.status !== 'done'"
							@click="finishOrder(order)"
						>
							<text>标记完成</text>
						</view>
						<text class="done-text" v-else>已完成</text>
					</view>
				</view>
				<!-- 待支付操作 -->
				<view class="card-actions" v-else>
					<view class="pending-hint">
						<text>此订单尚未支付，可取消</text>
					</view>
					<view class="act-btns">
						<view class="act-btn danger" @click="cancelOrder(order)">
							<text>取消订单</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 空态 -->
		<view class="empty" v-else>
			<text class="empty-char">堂</text>
			<text class="empty-text">暂无{{ currentFilter === 'all' ? '' : filters.find(f => f.key === currentFilter).text }}订单</text>
		</view>

		<view style="height: 140rpx;"></view>
		<manage-tabbar active="dine-in"></manage-tabbar>
	</view>
</template>

<script>
import { getDineInOrders, serveItem, serveAll, completeDineIn, cancelDineIn } from '@/api/manage'
import ManageTabbar from '@/components/manage-tabbar/manage-tabbar.vue'

const statusTextMap = {
	pending: '待支付',
	cooking: '备菜中',
	partial_served: '部分上菜',
	served: '已上齐',
	done: '已完成'
}

export default {
	components: { ManageTabbar },
	data() {
		return {
			orders: [],
			filters: [
				{ key: 'all', text: '全部' },
				{ key: 'pending', text: '待支付' },
				{ key: 'cooking', text: '备菜中' },
				{ key: 'partial', text: '部分上菜' },
				{ key: 'served', text: '已上齐' },
				{ key: 'done', text: '已完成' }
			],
			currentFilter: 'all',
			refreshTimer: null
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
		tableOverview() {
			const orderMap = {}
			this.orders.forEach(o => { orderMap[o.table_no] = o })
			return Array.from({ length: 10 }, (_, i) => {
				const no = String(i + 1)
				const order = orderMap[no]
				return {
					no,
					hasOrder: !!order && order.status !== 'done',
					status: order ? order.status : '',
					label: order ? order.status_text : '空闲'
				}
			})
		},
		activeCount() {
			return this.orders.filter(o => o.status !== 'done').length
		},
		filteredOrders() {
			if (this.currentFilter === 'all') return this.orders
			return this.orders.filter(o => o.status === this.currentFilter)
		}
	},
	onLoad() {
		// 鉴权
		if (!uni.getStorageSync('staff_token')) {
			uni.reLaunch({ url: '/pages/manage/login/login' })
			return
		}
		this.loadOrders()
	},
	onShow() {
		this.loadOrders()
		// 定时刷新
		this.refreshTimer = setInterval(() => this.loadOrders(), 30000)
	},
	onHide() {
		clearInterval(this.refreshTimer)
	},
	methods: {
		async loadOrders() {
			try {
				const list = await getDineInOrders()
				this.orders = list.map(o => ({
					...o,
					total: Number(o.total_amount),
					status_text: statusTextMap[o.status] || o.status,
					items: (o.items || []).map(it => ({
						...it,
						name: it.product_name,
						spec: it.spec_name,
						served: it.status === 'served'
					}))
				}))
			} catch (e) {
				uni.showToast({ title: '加载订单失败', icon: 'none' })
			}
		},
		servedCount(order) {
			return order.items.filter(i => i.served).length
		},
		async toggleDish(order, idx) {
			if (order.status === 'done') return
			const item = order.items[idx]
			try {
				if (!item.served) {
					await serveItem({ order_id: order.id, item_id: item.id })
				}
				await this.loadOrders()
			} catch (e) {
				uni.showToast({ title: '操作失败', icon: 'none' })
			}
		},
		async serveAll(order) {
			try {
				await serveAll({ order_id: order.id })
				uni.showToast({ title: '已全部上菜', icon: 'none' })
				await this.loadOrders()
			} catch (e) {
				uni.showToast({ title: '操作失败', icon: 'none' })
			}
		},
		finishOrder(order) {
			uni.showModal({
				title: '确认完成',
				content: `${order.table_no}号桌订单确认完成？`,
				success: async (res) => {
					if (res.confirm) {
						try {
							await completeDineIn({ order_id: order.id })
							uni.showToast({ title: '已完成', icon: 'success' })
							await this.loadOrders()
						} catch (e) {
							uni.showToast({ title: '操作失败', icon: 'none' })
						}
					}
				}
			})
		},
		cancelOrder(order) {
			uni.showModal({
				title: '取消订单',
				content: `确认取消 ${order.table_no} 号桌此笔订单？`,
				confirmColor: '#9B2D28',
				success: async (res) => {
					if (res.confirm) {
						try {
							await cancelDineIn({ order_id: order.id })
							uni.showToast({ title: '已取消', icon: 'none' })
							await this.loadOrders()
						} catch (e) {
							uni.showToast({ title: '操作失败', icon: 'none' })
						}
					}
				}
			})
		},
		scrollToTable(no) {
			uni.pageScrollTo({
				selector: '#table-' + no,
				duration: 300
			})
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
	padding-bottom: 0;
}

/* 顶栏 */
.nav {
	background: $lz-paper-light;
	border-bottom: 1rpx solid $lz-line;
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	padding: 0 32rpx 24rpx;

	.nav-title {
		font-size: 38rpx;
		font-weight: 600;
		letter-spacing: 3rpx;
	}
	.nav-logout {
		font-size: 26rpx;
		color: $lz-ink-3;
		padding: 8rpx 0;
	}
}

/* 桌台概览 */
.overview {
	margin: 24rpx 32rpx 0;
	.ov-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 16rpx;
		.ov-title {
			font-size: 28rpx;
			color: $lz-ink;
			font-weight: 600;
		}
		.ov-tip {
			font-size: 24rpx;
			color: $lz-ink-3;
		}
	}
	.ov-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}
	.ov-cell {
		width: calc((100% - 48rpx) / 4);
		padding: 16rpx 0;
		background: $lz-card;
		border: 1rpx solid $lz-line;
		border-radius: $lz-radius-card;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4rpx;
		.cell-no {
			font-family: $lz-font-serif;
			font-size: 36rpx;
			font-weight: 700;
			color: $lz-ink-3;
		}
		.cell-text {
			font-size: 20rpx;
			color: $lz-ink-3;
		}
		&.active {
			background: $lz-primary-bg;
			border-color: $lz-primary;
			.cell-no { color: $lz-primary; }
			.cell-text { color: $lz-primary; }
		}
		&.cooking {
			border-color: $lz-warn;
			.cell-no { color: $lz-warn; }
			.cell-text { color: $lz-warn; }
		}
		&.served {
			border-color: $lz-success;
			.cell-no { color: $lz-success; }
			.cell-text { color: $lz-success; }
		}
	}
}

/* 筛选 */
.filter {
	display: flex;
	gap: 16rpx;
	padding: 28rpx 32rpx 8rpx;
	overflow-x: auto;
	white-space: nowrap;
	.filter-item {
		flex-shrink: 0;
		padding: 12rpx 28rpx;
		border-radius: $lz-radius-pill;
		background: $lz-card;
		border: 1rpx solid $lz-line;
		text {
			font-size: 26rpx;
			color: $lz-ink-2;
		}
		&.active {
			background: $lz-primary;
			border-color: $lz-primary;
			text { color: #fff; font-weight: 500; }
		}
	}
}

/* 订单卡片 */
.order-list {
	padding: 24rpx 32rpx 0;
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}
.order-card {
	padding: 28rpx;

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		.head-left {
			display: flex;
			align-items: center;
			gap: 20rpx;
		}
		.table-badge {
			width: 84rpx;
			height: 84rpx;
			border-radius: $lz-radius-card;
			background: $lz-primary;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			.table-no {
				font-family: $lz-font-serif;
				font-size: 40rpx;
				font-weight: 700;
				color: #fff;
				line-height: 1;
			}
			.table-suffix {
				font-size: 18rpx;
				color: rgba(255,255,255,0.85);
				margin-top: 2rpx;
			}
		}
		.head-info {
			display: flex;
			flex-direction: column;
			gap: 8rpx;
			.info-status {
				font-size: 26rpx;
				font-weight: 600;
				&.st-pending { color: $lz-warn; }
				&.st-cooking { color: $lz-warn; }
				&.st-partial { color: $lz-primary; }
				&.st-served { color: $lz-success; }
				&.st-done { color: $lz-ink-3; }
			}
			.info-meta {
				font-size: 22rpx;
				color: $lz-ink-3;
			}
		}
		.head-amount {
			font-size: 34rpx;
			font-weight: 700;
			color: $lz-primary;
		}
	}
}

/* 菜品列表 */
.dish-list {
	margin-top: 24rpx;
	border-top: 1rpx solid $lz-line-light;
	.dish-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 22rpx 0;
		border-bottom: 1rpx solid $lz-line-light;
		.dish-check {
			width: 40rpx;
			height: 40rpx;
			border-radius: 50%;
			border: 2rpx solid $lz-line;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			.check-icon {
				font-size: 26rpx;
				color: #fff;
				font-weight: 700;
			}
			&.checked {
				background: $lz-success;
				border-color: $lz-success;
			}
		}
		.dish-main {
			flex: 1;
			display: flex;
			align-items: center;
			gap: 12rpx;
			.dish-name {
				font-size: 28rpx;
				color: $lz-ink;
			}
			.dish-spec {
				font-size: 22rpx;
				color: $lz-ink-3;
				background: $lz-paper;
				padding: 2rpx 10rpx;
				border-radius: $lz-radius-tag;
			}
		}
		.dish-price {
			font-size: 26rpx;
			color: $lz-ink-2;
		}
		&.served {
			.dish-name { color: $lz-ink-3; text-decoration: line-through; }
		}
	}
}

/* 卡片操作 */
.card-actions {
	margin-top: 8rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	.act-progress {
		flex: 1;
		.prog-text {
			font-size: 22rpx;
			color: $lz-ink-3;
		}
		.prog-bar {
			margin-top: 8rpx;
			height: 8rpx;
			border-radius: 4rpx;
			background: $lz-line;
			overflow: hidden;
			.prog-fill {
				height: 100%;
				background: $lz-success;
				border-radius: 4rpx;
				transition: width 0.25s;
			}
		}
	}
	.act-btns {
		display: flex;
		gap: 16rpx;
		.act-btn {
			padding: 14rpx 28rpx;
			border-radius: $lz-radius-pill;
			text { font-size: 26rpx; }
			&.ghost {
				border: 2rpx solid $lz-line;
				text { color: $lz-ink-2; }
				&:active { background: $lz-paper; }
			}
		&.primary {
			background: $lz-primary;
			text { color: #fff; font-weight: 500; }
			&:active { background: $lz-primary-dark; }
		}
		&.danger {
			background: $lz-primary-bg;
			border: 2rpx solid $lz-primary;
			text { color: $lz-primary; font-weight: 500; }
			&:active { background: rgba(155,45,40,0.1); }
		}
	}
	.done-text {
		font-size: 26rpx;
		color: $lz-ink-3;
		padding: 14rpx 0;
	}
}
.pending-hint {
	font-size: 24rpx;
	color: $lz-warn;
	padding: 8rpx 0;
}
}

/* 空态 */
.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 120rpx 0;
	.empty-char {
		font-family: $lz-font-serif;
		font-size: 96rpx;
		color: $lz-line;
	}
	.empty-text {
		margin-top: 20rpx;
		font-size: 26rpx;
		color: $lz-ink-3;
	}
}
</style>
