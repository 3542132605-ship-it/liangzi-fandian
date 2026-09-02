<template>
	<view class="page">
		<!-- 自定义导航 -->
		<view class="nav" :style="navStyle">
			<view class="nav-back" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="nav-title lz-title">确认订单</text>
		</view>

		<scroll-view scroll-y class="body">
			<!-- 堂食信息 -->
			<view class="section lz-card" v-if="diningType === 'dine-in'">
				<view class="sec-title-row">
					<text class="sec-title lz-title">堂食信息</text>
				</view>
				<view class="info-line">
					<text class="info-label">桌号</text>
					<text class="info-value strong">{{ tableNo }}号桌</text>
				</view>
			</view>

			<!-- 外卖信息 -->
			<view class="section lz-card" v-else>
				<view class="sec-title-row">
					<text class="sec-title lz-title">收货地址</text>
					<text class="sec-action" @click="goAddress">{{ address ? '更换' : '新增' }} ›</text>
				</view>
				<view v-if="address" class="address-block">
					<view class="addr-row">
						<text class="addr-name">{{ address.name }}</text>
						<text class="addr-phone">{{ address.phone }}</text>
					</view>
					<text class="addr-detail">{{ address.detail }}</text>
				</view>
				<view v-else class="address-empty" @click="goAddress">
					<text class="empty-text">请添加收货地址</text>
					<text class="empty-arrow">›</text>
				</view>
			</view>

			<!-- 备注 -->
			<view class="section lz-card">
				<view class="sec-title-row">
					<text class="sec-title lz-title">订单备注</text>
				</view>
				<textarea
					class="remark-input"
					v-model="remark"
					placeholder="口味偏好、忌口等（选填）"
					placeholder-class="remark-ph"
					maxlength="50"
				/>
			</view>

			<!-- 菜品清单 -->
			<view class="section lz-card">
				<view class="sec-title-row">
					<text class="sec-title lz-title">菜品清单</text>
					<text class="sec-count">共 {{ cartTotal }} 件</text>
				</view>
				<view class="dish-row" v-for="(item, idx) in cartList" :key="idx">
					<view class="dish-img">
						<text class="img-char">{{ item.name ? item.name.charAt(0) : '' }}</text>
					</view>
					<view class="dish-info">
						<text class="dish-name">{{ item.name }}</text>
						<text class="dish-spec" v-if="item.props_text && item.props_text !== '默认'">{{ item.props_text }}</text>
					</view>
					<text class="dish-qty">×{{ item.count }}</text>
					<text class="dish-sum">¥{{ Number(item.totalPrice).toFixed(2) }}</text>
				</view>
			</view>

			<!-- 价格汇总 -->
			<view class="section lz-card">
				<view class="price-line">
					<text class="price-label">菜品小计</text>
					<text class="price-val">¥{{ subtotal.toFixed(2) }}</text>
				</view>
				<view class="price-line total-line">
					<text class="price-label strong">合计</text>
					<text class="price-val total">¥{{ total.toFixed(2) }}</text>
				</view>
			</view>

			<view class="pay-tip">
				<text>先付后吃 · 仅支持微信支付 · 支付后厨房即刻备菜</text>
			</view>
		</scroll-view>

		<!-- 底部支付 -->
		<view class="footer">
			<view class="footer-total">
				<text class="ft-label">应付</text>
				<view class="ft-price">
					<text class="symbol">¥</text>
					<text class="value">{{ total.toFixed(2) }}</text>
				</view>
			</view>
			<view class="pay-btn" :class="{'disabled': !canPay}" @click="handlePay">
				<text>{{ payBtnText }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { createOrder, mockPay, getAddresses } from '@/api/customer'

export default {
	data() {
		return {
			diningType: 'dine-in',
			tableNo: '',
			remark: '',
			cartList: [],
			cartTotal: 0,
			cartPrice: 0,
			address: null,
			paying: false,
			deliveryMin: 30
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
		subtotal() { return Number(this.cartPrice || 0) },
		total() {
			return this.subtotal
		},
		canPay() {
			if (this.paying) return false
			if (this.cartTotal === 0) return false
			if (this.diningType === 'takeout' && !this.address) return false
			if (this.diningType === 'takeout' && this.cartPrice < this.deliveryMin) return false
			if (this.diningType === 'dine-in' && !this.tableNo) return false
			return true
		},
		payBtnText() {
			if (this.paying) return '支付中...'
			if (this.diningType === 'takeout' && !this.address) return '请先填地址'
			if (this.diningType === 'takeout' && this.cartPrice < this.deliveryMin) return '未达起送'
			if (this.cartTotal === 0) return '购物车为空'
			return '微信支付'
		}
	},
	onLoad() {
		this.diningType = uni.getStorageSync('diningType') || 'dine-in'
		this.tableNo = uni.getStorageSync('tableNo') || ''
		const cartKey = this.getCartKey()
		const cart = uni.getStorageSync(cartKey)
		if (cart) {
			this.cartList = cart.list || []
			this.cartTotal = cart.total || 0
			this.cartPrice = cart.price || 0
		}
	},
	onShow() {
		// 从地址页返回时读取选中地址
		const addr = uni.getStorageSync('selectedAddress')
		if (addr) {
			this.address = addr
		} else {
			this.loadDefaultAddress()
		}
	},
	methods: {
		goBack() { uni.navigateBack() },
		goAddress() {
			uni.navigateTo({ url: '/pages/address/address?from=submit' })
		},
		getCartKey() {
			if (this.diningType === 'dine-in' && this.tableNo) return 'cart_' + this.tableNo
			if (this.diningType === 'takeout') return 'cart_takeout'
			return 'cartData'
		},
		async loadDefaultAddress() {
			try {
				const list = await getAddresses()
				this.address = list.find(a => a.is_default) || list[0] || null
			} catch (e) {
				console.error('加载地址失败:', e)
			}
		},
		async handlePay() {
			if (!this.canPay) {
				if (this.diningType === 'takeout' && !this.address) {
					uni.showToast({ title: '请先填写收货地址', icon: 'none' })
				} else if (this.diningType === 'takeout' && this.cartPrice < this.deliveryMin) {
					uni.showToast({ title: `未达起送价 ¥${this.deliveryMin}`, icon: 'none' })
				}
				return
			}
			this.paying = true
			uni.showLoading({ title: '支付中', mask: true })
			try {
				// 构建订单数据
				const orderData = {
					type: this.diningType === 'dine-in' ? 'dine_in' : 'delivery',
					table_no: this.diningType === 'dine-in' ? this.tableNo : undefined,
					address_id: this.diningType === 'takeout' && this.address ? this.address.id : undefined,
					remark: this.remark || undefined,
					items: this.cartList.map(item => ({
						product_id: item.id,
						spec_id: item.spec_id || undefined,
						quantity: item.count
					}))
				}
				const order = await createOrder(orderData)
				// mock 支付（使用后端返回的 orderId）
				await mockPay(order.orderId)
				uni.hideLoading()
				this.paying = false
				// 清空购物车
				uni.removeStorageSync(this.getCartKey())
				uni.showToast({ title: '支付成功', icon: 'success', duration: 1500 })
				// 跳转订单页
				setTimeout(() => {
					uni.redirectTo({ url: '/pages/order/order' })
				}, 1200)
			} catch (e) {
				uni.hideLoading()
				this.paying = false
				uni.showToast({ title: e.message || '支付失败', icon: 'none' })
			}
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
	padding: 0 24rpx;
	height: 88rpx;
	background: $lz-paper-light;
	border-bottom: 1rpx solid $lz-line;
	position: relative;

	.nav-back {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		.back-icon { font-size: 56rpx; color: $lz-ink; line-height: 1; }
	}
	.nav-title {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		font-size: 32rpx;
		color: $lz-ink;
		font-weight: 600;
	}
}

.body {
	flex: 1;
	padding: 24rpx 32rpx 200rpx;
}

.section {
	padding: 28rpx;
	margin-bottom: 20rpx;

	.sec-title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;

		.sec-title {
			font-size: 30rpx;
			color: $lz-ink;
			font-weight: 600;
		}
		.sec-action { font-size: 26rpx; color: $lz-primary; }
		.sec-count { font-size: 24rpx; color: $lz-ink-3; }
	}

	.info-line {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16rpx 0;

		.info-label { font-size: 28rpx; color: $lz-ink-2; }
		.info-value {
			font-size: 28rpx;
			color: $lz-ink;
			&.strong { font-weight: 600; font-size: 30rpx; }
			&.price { color: $lz-primary; font-weight: 600; }
		}
	}

	.people-stepper {
		display: flex;
		align-items: center;
		gap: 24rpx;

		.step-btn {
			width: 48rpx; height: 48rpx;
			border-radius: 50%;
			border: 1rpx solid $lz-line;
			background: $lz-paper;
			display: flex; align-items: center; justify-content: center;
			text { font-size: 30rpx; color: $lz-ink-2; line-height: 1; }
			&:active { transform: scale(0.9); }
		}
		.people-num { min-width: 40rpx; text-align: center; font-size: 28rpx; font-weight: 600; color: $lz-ink; }
	}

	.address-block {
		padding: 20rpx;
		background: $lz-paper;
		border-radius: $lz-radius-card;
		border: 1rpx solid $lz-line-light;

		.addr-row {
			display: flex;
			align-items: center;
			gap: 20rpx;
			margin-bottom: 10rpx;
			.addr-name { font-size: 28rpx; color: $lz-ink; font-weight: 600; }
			.addr-phone { font-size: 26rpx; color: $lz-ink-2; }
		}
		.addr-detail { font-size: 26rpx; color: $lz-ink-2; line-height: 1.5; }
	}

	.address-empty {
		padding: 28rpx;
		background: $lz-paper;
		border-radius: $lz-radius-card;
		border: 1rpx dashed $lz-line;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		.empty-text { font-size: 28rpx; color: $lz-ink-3; }
		.empty-arrow { font-size: 32rpx; color: $lz-ink-3; }
	}

	.remark-input {
		width: 100%;
		min-height: 80rpx;
		padding: 16rpx 20rpx;
		background: $lz-paper;
		border-radius: $lz-radius-input;
		border: 1rpx solid $lz-line-light;
		font-size: 26rpx;
		color: $lz-ink;
		box-sizing: border-box;
	}
	.remark-ph { color: $lz-ink-3; }

	.dish-row {
		display: flex;
		align-items: center;
		padding: 18rpx 0;
		border-bottom: 1rpx solid $lz-line-light;
		gap: 16rpx;

		&:last-child { border-bottom: none; }

		.dish-img {
			width: 72rpx; height: 72rpx;
			border-radius: $lz-radius-img;
			background: linear-gradient(135deg, $lz-primary-bg, rgba(184, 149, 106, 0.12));
			display: flex; align-items: center; justify-content: center;
			border: 1rpx solid $lz-line;
			flex-shrink: 0;
			.img-char { font-family: $lz-font-serif; font-size: 32rpx; color: $lz-primary; opacity: 0.7; }
		}
		.dish-info {
			flex: 1; min-width: 0;
			display: flex; flex-direction: column; gap: 4rpx;
			.dish-name { font-size: 28rpx; color: $lz-ink; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
			.dish-spec { font-size: 22rpx; color: $lz-ink-3; }
		}
		.dish-qty { font-size: 26rpx; color: $lz-ink-3; }
		.dish-sum { font-size: 28rpx; color: $lz-ink; font-weight: 600; min-width: 100rpx; text-align: right; }
	}

	.price-line {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12rpx 0;

		.price-label { font-size: 28rpx; color: $lz-ink-2; &.strong { color: $lz-ink; font-weight: 600; font-size: 30rpx; } }
		.price-val { font-size: 28rpx; color: $lz-ink; &.total { color: $lz-primary; font-weight: 700; font-size: 36rpx; } }
		&.total-line { border-top: 1rpx solid $lz-line; margin-top: 8rpx; padding-top: 20rpx; }
	}
}

.pay-tip {
	text-align: center;
	padding: 8rpx 0;
	text { font-size: 22rpx; color: $lz-ink-3; letter-spacing: 1rpx; }
}

.footer {
	position: fixed;
	left: 0; right: 0; bottom: 0;
	background: $lz-card;
	padding: 16rpx 32rpx;
	padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0 -4rpx 20rpx rgba(31, 26, 23, 0.05);
	z-index: 50;

	.footer-total {
		display: flex;
		align-items: baseline;
		gap: 12rpx;
		.ft-label { font-size: 26rpx; color: $lz-ink-2; }
		.ft-price {
			display: flex; align-items: baseline;
			color: $lz-primary;
			.symbol { font-size: 26rpx; font-weight: 600; }
			.value { font-size: 42rpx; font-weight: 700; margin-left: 2rpx; }
		}
	}

	.pay-btn {
		background: $lz-primary;
		color: #fff;
		font-size: 30rpx;
		font-weight: 600;
		letter-spacing: 2rpx;
		padding: 0 64rpx;
		height: 84rpx;
		border-radius: $lz-radius-pill;
		display: flex; align-items: center; justify-content: center;
		box-shadow: $lz-shadow-btn;
		&:active { background: $lz-primary-dark; transform: scale(0.97); }
		&.disabled { background: $lz-disabled; box-shadow: none; }
	}
}
</style>
