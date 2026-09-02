<template>
	<view class="page">
		<!-- 顶栏 -->
		<view class="nav" :style="navStyle">
			<text class="nav-title lz-title">外卖订单</text>
			<text class="nav-logout" @click="logout">退出</text>
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
				<text class="badge" v-if="countByStatus(f.key)">{{ countByStatus(f.key) }}</text>
			</view>
		</view>

		<!-- 订单列表 -->
		<view class="order-list" v-if="filteredOrders.length">
			<view
				class="order-card lz-card"
				v-for="order in filteredOrders"
				:key="order.id"
				:class="{ 'is-new': order.status === 'cooking' }"
			>
				<!-- 卡片头 -->
				<view class="card-head">
					<view class="head-status">
						<text class="status-tag" :class="'st-' + order.status">{{ order.status_text }}</text>
						<text class="order-time">{{ order.created_at }}</text>
					</view>
					<text class="order-id">单号 {{ order.id }}</text>
				</view>

				<!-- 配送信息 -->
				<view class="delivery-info">
					<view class="info-row" @click="callPhone(order.phone)">
						<text class="info-icon">电</text>
						<text class="info-text">{{ order.name }} · {{ order.phone }}</text>
						<text class="info-action">拨打</text>
					</view>
					<view class="info-row" @click="copyAddress(order.address)">
						<text class="info-icon">址</text>
						<text class="info-text address-text">{{ order.address }}</text>
						<text class="info-action">复制</text>
					</view>
					<view class="info-row remark-row" v-if="order.remark">
						<text class="info-icon">注</text>
						<text class="info-text remark-text">{{ order.remark }}</text>
					</view>
				</view>

				<!-- 菜品明细 -->
				<view class="dish-section">
					<view class="dish-row" v-for="(item, idx) in order.items" :key="idx">
						<text class="dish-name">{{ item.name }}</text>
						<text class="dish-spec" v-if="item.spec && item.spec !== '默认'">{{ item.spec }}</text>
						<text class="dish-qty">×{{ item.quantity }}</text>
						<text class="dish-price">¥{{ item.price * item.quantity }}</text>
					</view>
				</view>

				<!-- 金额 + 操作 -->
				<view class="card-foot">
					<view class="foot-amount">
						<text class="amount-detail">商品合计</text>
						<text class="amount-total">合计 <text class="total-price">¥{{ order.total }}</text></text>
					</view>
					<view class="foot-actions">
					<view class="act-btn primary" v-if="order.status === 'cooking'" @click="startDelivery(order)">
						<text>开始配送</text>
					</view>
					<view class="act-btn primary" v-else-if="order.status === 'delivering'" @click="confirmDeliver(order)">
						<text>确认送达</text>
					</view>
					<view class="act-btn primary" v-else-if="order.status === 'delivered'" @click="completeDeliver(order)">
						<text>完成订单</text>
					</view>
					<text class="done-text" v-else>已完成</text>
				</view>
				</view>
			</view>
		</view>

		<!-- 空态 -->
		<view class="empty" v-else>
			<text class="empty-char">外</text>
			<text class="empty-text">暂无{{ currentFilter === 'all' ? '' : filters.find(f => f.key === currentFilter).text }}订单</text>
		</view>

		<view style="height: 140rpx;"></view>
		<manage-tabbar active="delivery"></manage-tabbar>
	</view>
</template>

<script>
import { getDeliveryOrders, startDelivery, confirmDelivered, completeDelivery } from '@/api/manage'
import ManageTabbar from '@/components/manage-tabbar/manage-tabbar.vue'

const statusTextMap = {
	cooking: '备菜中',
	delivering: '配送中',
	delivered: '已送达',
	done: '已完成'
}

export default {
	components: { ManageTabbar },
	data() {
		return {
			orders: [],
			filters: [
				{ key: 'all', text: '全部' },
				{ key: 'cooking', text: '备菜中' },
				{ key: 'delivering', text: '配送中' },
				{ key: 'delivered', text: '已送达' },
				{ key: 'done', text: '已完成' }
			],
			currentFilter: 'all'
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
		filteredOrders() {
			if (this.currentFilter === 'all') return this.orders
			return this.orders.filter(o => o.status === this.currentFilter)
		}
	},
	onLoad() {
		if (!uni.getStorageSync('staff_token')) {
			uni.reLaunch({ url: '/pages/manage/login/login' })
			return
		}
		this.loadOrders()
	},
	onShow() {
		this.loadOrders()
	},
	methods: {
		async loadOrders() {
			try {
				const list = await getDeliveryOrders()
				this.orders = list.map(o => ({
					...o,
					total: Number(o.total_amount),
					status_text: statusTextMap[o.status] || o.status,
					name: o.addr_name,
					phone: o.addr_phone,
					address: [o.province, o.city, o.district, o.addr_detail].filter(Boolean).join(''),
					items: (o.items || []).map(it => ({
						...it,
						name: it.product_name,
						spec: it.spec_name
					}))
				}))
			} catch (e) {
				uni.showToast({ title: '加载订单失败', icon: 'none' })
			}
		},
		countByStatus(key) {
			if (key === 'all') return 0
			return this.orders.filter(o => o.status === key).length
		},
		async startDelivery(order) {
			try {
				await startDelivery({ order_id: order.id })
				uni.showToast({ title: '已开始配送', icon: 'none' })
				await this.loadOrders()
			} catch (e) {
				uni.showToast({ title: '操作失败', icon: 'none' })
			}
		},
		confirmDeliver(order) {
			uni.showModal({
				title: '送达确认',
				content: '确认已送达顾客手中？',
				success: async (res) => {
					if (res.confirm) {
						try {
							await confirmDelivered({ order_id: order.id })
							uni.showToast({ title: '已确认送达', icon: 'success' })
							await this.loadOrders()
						} catch (e) {
							uni.showToast({ title: '操作失败', icon: 'none' })
						}
					}
				}
			})
		},
		completeDeliver(order) {
			uni.showModal({
				title: '完成订单',
				content: '确认完成此订单？',
				success: async (res) => {
					if (res.confirm) {
						try {
							await completeDelivery({ order_id: order.id })
							uni.showToast({ title: '订单已完成', icon: 'success' })
							await this.loadOrders()
						} catch (e) {
							uni.showToast({ title: '操作失败', icon: 'none' })
						}
					}
				}
			})
		},
		callPhone(phone) {
			uni.makePhoneCall({
				phoneNumber: phone,
				fail: () => {
					uni.setClipboardData({ data: phone })
					uni.showToast({ title: '号码已复制', icon: 'none' })
				}
			})
		},
		copyAddress(address) {
			uni.setClipboardData({
				data: address,
				success: () => uni.showToast({ title: '地址已复制', icon: 'none' })
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
}

/* 顶栏 */
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

/* 新订单提醒 */
.new-alert {
	margin: 20rpx 32rpx 0;
	padding: 18rpx 28rpx;
	background: $lz-primary-bg;
	border: 1rpx solid $lz-primary;
	border-radius: $lz-radius-card;
	display: flex;
	align-items: center;
	gap: 14rpx;
	.alert-dot {
		width: 16rpx; height: 16rpx; border-radius: 50%;
		background: $lz-primary;
		animation: blink 1.2s infinite;
	}
	.alert-text { font-size: 26rpx; color: $lz-primary; font-weight: 600; }
}
@keyframes blink {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.3; }
}

/* 筛选 */
.filter {
	display: flex;
	gap: 16rpx;
	padding: 24rpx 32rpx 8rpx;
	overflow-x: auto;
	white-space: nowrap;
	.filter-item {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 12rpx 28rpx;
		border-radius: $lz-radius-pill;
		background: $lz-card;
		border: 1rpx solid $lz-line;
		text { font-size: 26rpx; color: $lz-ink-2; }
		.badge {
			min-width: 32rpx;
			height: 32rpx;
			line-height: 32rpx;
			text-align: center;
			padding: 0 8rpx;
			border-radius: 16rpx;
			background: $lz-primary;
			color: #fff !important;
			font-size: 22rpx;
			font-weight: 600;
		}
		&.active {
			background: $lz-primary;
			border-color: $lz-primary;
			text { color: #fff; font-weight: 500; }
			.badge { background: #fff; color: $lz-primary !important; }
		}
	}
}

/* 订单列表 */
.order-list {
	padding: 20rpx 32rpx 0;
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}
.order-card {
	padding: 28rpx;
	&.is-new {
		border: 2rpx solid $lz-primary;
		box-shadow: 0 4rpx 24rpx rgba(155,45,40,0.12);
	}

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		.head-status {
			display: flex;
			align-items: center;
			gap: 16rpx;
			.status-tag {
				padding: 6rpx 18rpx;
				border-radius: $lz-radius-tag;
				font-size: 24rpx;
				font-weight: 600;
				&.st-pending { background: $lz-primary-bg; color: $lz-primary; }
				&.st-cooking { background: rgba(199,123,58,0.12); color: $lz-warn; }
				&.st-delivering { background: rgba(184,149,106,0.14); color: $lz-gold; }
				&.st-delivered { background: rgba(76,175,80,0.12); color: $lz-success; }
				&.st-done { background: $lz-paper; color: $lz-ink-3; }
			}
			.order-time { font-size: 24rpx; color: $lz-ink-3; }
		}
		.order-id { font-size: 22rpx; color: $lz-ink-3; }
	}
}

/* 配送信息 */
.delivery-info {
	margin-top: 20rpx;
	padding: 20rpx;
	background: $lz-paper;
	border-radius: $lz-radius-card;
	.info-row {
		display: flex;
		align-items: center;
		gap: 14rpx;
		padding: 10rpx 0;
		.info-icon {
			width: 36rpx; height: 36rpx;
			border-radius: $lz-radius-tag;
			background: $lz-primary-bg;
			color: $lz-primary;
			font-size: 20rpx;
			font-family: $lz-font-serif;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
		}
		.info-text {
			flex: 1;
			font-size: 28rpx;
			color: $lz-ink;
		}
		.address-text {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.info-action {
			font-size: 24rpx;
			color: $lz-primary;
			padding: 4rpx 16rpx;
			border: 1rpx solid $lz-primary;
			border-radius: $lz-radius-pill;
		}
		&.remark-row .info-text { color: $lz-warn; font-size: 26rpx; }
	}
}

/* 菜品明细 */
.dish-section {
	margin-top: 20rpx;
	border-top: 1rpx solid $lz-line-light;
	padding-top: 16rpx;
	.dish-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 12rpx 0;
		.dish-name { flex: 1; font-size: 28rpx; color: $lz-ink; }
		.dish-spec { font-size: 22rpx; color: $lz-ink-3; }
		.dish-qty { font-size: 26rpx; color: $lz-ink-2; width: 60rpx; text-align: center; }
		.dish-price { font-size: 26rpx; color: $lz-ink; width: 120rpx; text-align: right; }
	}
}

/* 底部 */
.card-foot {
	margin-top: 12rpx;
	border-top: 1rpx solid $lz-line-light;
	padding-top: 20rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	.foot-amount {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
		.amount-detail { font-size: 22rpx; color: $lz-ink-3; }
		.amount-total { font-size: 24rpx; color: $lz-ink-2; }
		.total-price { font-size: 34rpx; font-weight: 700; color: $lz-primary; }
	}
	.foot-actions {
		.act-btn {
			padding: 16rpx 36rpx;
			border-radius: $lz-radius-pill;
			&.primary {
				background: $lz-primary;
				text { color: #fff; font-size: 28rpx; font-weight: 500; }
				&:active { background: $lz-primary-dark; }
			}
		}
		.done-text { font-size: 26rpx; color: $lz-ink-3; }
	}
}

/* 空态 */
.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 120rpx 0;
	.empty-char { font-family: $lz-font-serif; font-size: 96rpx; color: $lz-line; }
	.empty-text { margin-top: 20rpx; font-size: 26rpx; color: $lz-ink-3; }
}
</style>
