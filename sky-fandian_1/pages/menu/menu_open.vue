<template>
	<view class="spec-popup" @click.stop>
		<view class="mask" @click="handleClose"></view>
		<view class="content" @click.stop>
			<!-- 商品信息 -->
			<view class="product-info">
				<view class="product-img">
					<text class="img-char">{{ product.name ? product.name.charAt(0) : '' }}</text>
				</view>
				<view class="info">
					<text class="name lz-title">{{ product.name }}</text>
					<view class="price">
						<text class="symbol">¥</text>
						<text class="value">{{ currentPrice }}</text>
					</view>
				</view>
				<view class="close-btn" @click="handleClose">
					<text class="close-icon">×</text>
				</view>
			</view>

			<!-- 规格选择 -->
			<scroll-view scroll-y class="specs">
				<view class="spec-group" v-for="(group, gi) in specGroups" :key="gi">
					<view class="group-title">
						<text class="group-name">{{ group.name }}</text>
						<view class="group-line"></view>
					</view>
					<view class="spec-options">
						<view
							class="spec-item"
							:class="{'active': item.is_default}"
							v-for="(item, ii) in group.values"
							:key="ii"
							@click="selectSpec(gi, ii)"
						>
							<text class="spec-value">{{ item.value }}</text>
							<text class="spec-price" v-if="group.name === '规格'">¥{{ item.price }}</text>
						</view>
					</view>
				</view>

				<view class="summary">
					<text class="summary-label">已选</text>
					<text class="summary-text">{{ selectedSummary }}</text>
				</view>
			</scroll-view>

			<!-- 底部操作 -->
			<view class="bottom-action">
				<view class="qty">
					<view class="qty-btn" :class="{'disabled': quantity <= 1}" @click="decQty">
						<text>−</text>
					</view>
					<text class="qty-num">{{ quantity }}</text>
					<view class="qty-btn qty-plus" @click="incQty">
						<text>+</text>
					</view>
				</view>
				<view class="add-cart-btn" @click="handleAdd">
					<text>加入购物车</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		product: { type: Object, required: true }
	},
	data() {
		return {
			specGroups: [],
			quantity: 1
		}
	},
	created() {
		try {
			if (this.product && this.product.property) {
				this.specGroups = JSON.parse(JSON.stringify(this.product.property))
				this.specGroups.forEach(g => {
					if (g.values && g.values.length) {
						g.values.forEach(v => (v.is_default = false))
						g.values[0].is_default = true
					}
				})
			}
			this.quantity = this.product.number || 1
		} catch (e) {
			this.specGroups = []
			this.quantity = 1
		}
	},
	computed: {
		currentPrice() {
			const sizeGroup = this.specGroups.find(g => g.name === '规格')
			if (sizeGroup) {
				const sel = sizeGroup.values.find(v => v.is_default)
				return sel ? sel.price : this.product.price
			}
			return this.product.price
		},
		selectedSummary() {
			const parts = this.specGroups.map(g => {
				const sel = g.values.find(v => v.is_default)
				return sel ? sel.value : ''
			}).filter(Boolean)
			return parts.length ? parts.join(' · ') : '默认'
		}
	},
	methods: {
		handleClose() { this.$emit('close') },
		selectSpec(gi, ii) {
			const g = this.specGroups[gi]
			g.values.forEach(v => (v.is_default = false))
			g.values[ii].is_default = true
		},
		decQty() { if (this.quantity > 1) this.quantity-- },
		incQty() { this.quantity++ },
		handleAdd() {
			const specs = this.specGroups.map(g => {
				const sel = g.values.find(v => v.is_default)
				return { name: g.name, value: sel ? sel.value : '' }
			})
			const specText = specs.filter(s => s.value).map(s => `${s.name}:${s.value}`).join('，')
			this.$emit('add-to-cart', {
				id: this.product.id,
				name: this.product.name,
				price: Number(this.currentPrice),
				image: this.product.image,
				count: this.quantity,
				totalPrice: Number(this.currentPrice) * this.quantity,
				spec_type: 'multi',
				specs: specText || '默认',
				props_text: specText || '默认'
			})
			this.handleClose()
		}
	}
}
</script>

<style lang="scss" scoped>
.spec-popup {
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
		max-height: 86vh;
		display: flex;
		flex-direction: column;

		.product-info {
			padding: 36rpx 32rpx 28rpx;
			display: flex;
			align-items: flex-start;
			position: relative;
			border-bottom: 1rpx solid $lz-line-light;

			.product-img {
				width: 160rpx;
				height: 160rpx;
				border-radius: $lz-radius-img;
				background: linear-gradient(135deg, $lz-primary-bg, rgba(184, 149, 106, 0.12));
				display: flex;
				align-items: center;
				justify-content: center;
				border: 1rpx solid $lz-line;
				flex-shrink: 0;

				.img-char {
					font-family: $lz-font-serif;
					font-size: 60rpx;
					color: $lz-primary;
					opacity: 0.7;
				}
			}

			.info {
				flex: 1;
				margin-left: 28rpx;
				padding-top: 8rpx;

				.name {
					font-size: 34rpx;
					color: $lz-ink;
					font-weight: 600;
					line-height: 1.4;
					margin-bottom: 20rpx;
				}
				.price {
					display: flex;
					align-items: baseline;
					color: $lz-primary;

					.symbol { font-size: 26rpx; font-weight: 600; }
					.value { font-size: 44rpx; font-weight: 700; margin-left: 4rpx; }
				}
			}

			.close-btn {
				position: absolute;
				top: 24rpx;
				right: 24rpx;
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

		.specs {
			max-height: 52vh;
			padding: 24rpx 32rpx;

			.spec-group {
				margin-bottom: 32rpx;

				.group-title {
					display: flex;
					align-items: center;
					gap: 16rpx;
					margin-bottom: 20rpx;

					.group-name {
						font-size: 28rpx;
						color: $lz-ink;
						font-weight: 600;
						letter-spacing: 1rpx;
					}
					.group-line { flex: 1; height: 1rpx; background: $lz-line-light; }
				}

				.spec-options {
					display: flex;
					flex-wrap: wrap;
					gap: 18rpx;

					.spec-item {
						min-width: 140rpx;
						padding: 16rpx 28rpx;
						background: $lz-paper;
						border: 2rpx solid $lz-line;
						border-radius: $lz-radius-pill;
						display: flex;
						align-items: center;
						gap: 8rpx;
						transition: all 0.2s;

						.spec-value { font-size: 26rpx; color: $lz-ink-2; }
						.spec-price { font-size: 22rpx; color: $lz-ink-3; }

						&.active {
							background: $lz-primary-bg;
							border-color: $lz-primary;
							.spec-value { color: $lz-primary; font-weight: 600; }
							.spec-price { color: $lz-primary; }
						}
						&:active { transform: scale(0.96); }
					}
				}
			}

			.summary {
				margin: 8rpx 0 12rpx;
				padding: 20rpx 24rpx;
				background: $lz-paper;
				border-radius: $lz-radius-card;
				display: flex;
				align-items: center;
				gap: 16rpx;

				.summary-label {
					font-size: 24rpx;
					color: $lz-ink-3;
					flex-shrink: 0;
				}
				.summary-text {
					font-size: 26rpx;
					color: $lz-ink;
					font-weight: 500;
				}
			}
		}

		.bottom-action {
			padding: 20rpx 32rpx;
			display: flex;
			align-items: center;
			gap: 24rpx;
			border-top: 1rpx solid $lz-line-light;

			.qty {
				display: flex;
				align-items: center;
				background: $lz-paper;
				border-radius: $lz-radius-pill;
				padding: 6rpx;

				.qty-btn {
					width: 60rpx;
					height: 60rpx;
					border-radius: 50%;
					background: $lz-card;
					display: flex;
					align-items: center;
					justify-content: center;
					box-shadow: 0 2rpx 8rpx rgba(31, 26, 23, 0.06);

					text { font-size: 34rpx; color: $lz-ink; font-weight: 600; line-height: 1; }
					&:active { transform: scale(0.92); }
					&.disabled { opacity: 0.4; pointer-events: none; }
				}
				.qty-plus {
					background: $lz-primary;
					text { color: #fff; }
				}
				.qty-num {
					min-width: 56rpx;
					text-align: center;
					font-size: 30rpx;
					font-weight: 600;
					color: $lz-ink;
				}
			}

			.add-cart-btn {
				flex: 1;
				height: 84rpx;
				background: $lz-primary;
				border-radius: $lz-radius-pill;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #fff;
				font-size: 30rpx;
				font-weight: 600;
				letter-spacing: 2rpx;
				box-shadow: $lz-shadow-btn;

				&:active { background: $lz-primary-dark; transform: scale(0.98); }
			}
		}
	}
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>
