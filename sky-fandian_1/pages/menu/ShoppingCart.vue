<template>
	<view class="cart-popup" @click.stop>
		<view class="mask" @click="handleClose"></view>
		<view class="content" @click.stop>
			<!-- 标题栏 -->
			<view class="header">
				<view class="clear-btn" v-if="cartList.length > 0" @click="handleClear">
					<text>清空</text>
				</view>
				<text class="title lz-title">购物车</text>
				<view class="close-btn" @click="handleClose">
					<text class="close-icon">×</text>
				</view>
			</view>

			<!-- 列表 -->
			<scroll-view scroll-y class="cart-list" :style="{ maxHeight: cartList.length > 0 ? '58vh' : '30vh' }">
				<view v-if="cartList.length === 0" class="empty">
					<text class="empty-char">空</text>
					<text class="empty-text">购物车空空如也</text>
					<text class="empty-tip">挑几道招牌尝尝</text>
				</view>
				<view v-else class="cart-item" v-for="(item, idx) in cartList" :key="idx">
					<view class="item-info">
						<view class="item-img">
							<text class="img-char">{{ item.name ? item.name.charAt(0) : '' }}</text>
						</view>
						<view class="item-detail">
							<text class="item-name">{{ item.name }}</text>
							<text class="item-spec" v-if="item.props_text && item.props_text !== '默认'">{{ item.props_text }}</text>
							<view class="item-price">
								<text class="symbol">¥</text>
								<text class="value">{{ Number(item.price).toFixed(2) }}</text>
							</view>
						</view>
					</view>
					<view class="qty">
						<view class="qty-btn" :class="{'minus': true}" @click="decQty(idx)">
							<text>−</text>
						</view>
						<text class="qty-num">{{ item.count }}</text>
						<view class="qty-btn qty-plus" @click="incQty(idx)">
							<text>+</text>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- 底部结算 -->
			<view class="footer">
				<view class="total">
					<text class="total-label">合计</text>
					<view class="total-price">
						<text class="symbol">¥</text>
						<text class="value">{{ formatPrice(totalPrice) }}</text>
					</view>
				</view>
				<view class="checkout-btn" :class="{'disabled': !canCheckout}" @click="handleCheckout">
					<text>{{ buttonText }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		cartList: { type: Array, default: () => [] },
		totalPrice: { type: [Number, String], default: 0 },
		buttonText: { type: String, default: '去结算' },
		canCheckout: { type: Boolean, default: true }
	},
	methods: {
		formatPrice(v) { return Number(v || 0).toFixed(2) },
		handleClose() { this.$emit('close') },
		handleClear() {
			uni.showModal({
				title: '清空购物车',
				content: '确定要清空所有菜品吗？',
				confirmColor: '#9B2D28',
				success: r => {
					if (!r.confirm) return
					this.$emit('update', { list: [], total: 0, price: 0 })
				}
			})
		},
		buildData() {
			const list = this.cartList
			const total = list.reduce((s, i) => s + Number(i.count || 0), 0)
			const price = list.reduce((s, i) => s + Number(i.totalPrice || 0), 0)
			return { list, total, price }
		},
		decQty(idx) {
			const item = this.cartList[idx]
			if (item.count <= 1) {
				this.cartList.splice(idx, 1)
				if (this.cartList.length === 0) this.$emit('close')
			} else {
				item.count--
				item.totalPrice = Number(item.price) * item.count
			}
			this.$emit('update', this.buildData())
		},
		incQty(idx) {
			const item = this.cartList[idx]
			item.count++
			item.totalPrice = Number(item.price) * item.count
			this.$emit('update', this.buildData())
		},
		handleCheckout() {
			if (!this.canCheckout) return
			if (this.cartList.length === 0) {
				uni.showToast({ title: '购物车为空', icon: 'none' })
				return
			}
			uni.setStorageSync('cartData', this.buildData())
			this.handleClose()
			this.$emit('checkout')
		}
	}
}
</script>

<style lang="scss" scoped>
.cart-popup {
	position: fixed;
	inset: 0;
	z-index: 999;

	.mask {
		position: absolute;
		width: 100%;
		height: 100%;
		background: rgba(31, 26, 23, 0.55);
		animation: fadeIn 0.25s ease-out;
	}

	.content {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		background: $lz-card;
		border-radius: 32rpx 32rpx 0 0;
		padding-bottom: env(safe-area-inset-bottom);
		box-shadow: 0 -8rpx 32rpx rgba(31, 26, 23, 0.12);
		animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

		.header {
			position: relative;
			padding: 30rpx 32rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			border-bottom: 1rpx solid $lz-line-light;

			.title {
				font-size: 32rpx;
				color: $lz-ink;
				font-weight: 600;
			}
			.clear-btn {
				position: absolute;
				left: 32rpx;
				text { font-size: 26rpx; color: $lz-ink-3; }
				&:active text { color: $lz-warn; }
			}
			.close-btn {
				position: absolute;
				right: 32rpx;
				width: 56rpx;
				height: 56rpx;
				border-radius: 50%;
				background: $lz-paper;
				display: flex;
				align-items: center;
				justify-content: center;
				.close-icon { font-size: 36rpx; color: $lz-ink-2; line-height: 1; }
				&:active { background: $lz-line-light; }
			}
		}

		.cart-list {
			padding: 8rpx 32rpx;

			.empty {
				padding: 72rpx 0;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 12rpx;

				.empty-char {
					font-family: $lz-font-serif;
					font-size: 80rpx;
					color: $lz-ink-3;
					opacity: 0.3;
					margin-bottom: 8rpx;
				}
				.empty-text { font-size: 30rpx; color: $lz-ink-2; font-weight: 500; }
				.empty-tip { font-size: 24rpx; color: $lz-ink-3; }
			}

			.cart-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 24rpx 0;
				border-bottom: 1rpx solid $lz-line-light;

				.item-info {
					display: flex;
					align-items: center;
					flex: 1;
					min-width: 0;

					.item-img {
						width: 88rpx;
						height: 88rpx;
						border-radius: $lz-radius-img;
						background: linear-gradient(135deg, $lz-primary-bg, rgba(184, 149, 106, 0.12));
						display: flex;
						align-items: center;
						justify-content: center;
						border: 1rpx solid $lz-line;
						flex-shrink: 0;

						.img-char {
							font-family: $lz-font-serif;
							font-size: 38rpx;
							color: $lz-primary;
							opacity: 0.7;
						}
					}
					.item-detail {
						margin-left: 20rpx;
						flex: 1;
						min-width: 0;
						display: flex;
						flex-direction: column;
						gap: 6rpx;

						.item-name {
							font-size: 28rpx;
							color: $lz-ink;
							font-weight: 600;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}
						.item-spec {
							font-size: 22rpx;
							color: $lz-ink-3;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}
						.item-price {
							display: flex;
							align-items: baseline;
							color: $lz-primary;
							.symbol { font-size: 22rpx; font-weight: 600; }
							.value { font-size: 28rpx; font-weight: 700; margin-left: 2rpx; }
						}
					}
				}

				.qty {
					display: flex;
					align-items: center;
					gap: 20rpx;
					flex-shrink: 0;

					.qty-btn {
						width: 48rpx;
						height: 48rpx;
						border-radius: 50%;
						background: $lz-paper;
						border: 1rpx solid $lz-line;
						display: flex;
						align-items: center;
						justify-content: center;

						text { font-size: 30rpx; color: $lz-ink-2; line-height: 1; font-weight: 600; }
						&:active { transform: scale(0.9); }
						&.minus text { color: $lz-ink-3; }
					}
					.qty-plus {
						background: $lz-primary;
						border-color: $lz-primary;
						text { color: #fff; }
					}
					.qty-num {
						min-width: 40rpx;
						text-align: center;
						font-size: 28rpx;
						font-weight: 600;
						color: $lz-ink;
					}
				}
			}
		}

		.footer {
			padding: 20rpx 32rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-top: 1rpx solid $lz-line-light;

			.total {
				display: flex;
				align-items: baseline;
				gap: 12rpx;

				.total-label { font-size: 28rpx; color: $lz-ink-2; }
				.total-price {
					display: flex;
					align-items: baseline;
					color: $lz-primary;
					.symbol { font-size: 26rpx; font-weight: 600; }
					.value { font-size: 42rpx; font-weight: 700; margin-left: 2rpx; }
				}
			}

			.checkout-btn {
				background: $lz-primary;
				color: #fff;
				font-size: 30rpx;
				font-weight: 600;
				padding: 0 56rpx;
				height: 84rpx;
				border-radius: $lz-radius-pill;
				display: flex;
				align-items: center;
				justify-content: center;
				letter-spacing: 2rpx;
				box-shadow: $lz-shadow-btn;
				&:active { background: $lz-primary-dark; transform: scale(0.97); }
				&.disabled {
					background: $lz-disabled;
					color: rgba(255,255,255,0.8);
					box-shadow: none;
				}
			}
		}
	}
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>
