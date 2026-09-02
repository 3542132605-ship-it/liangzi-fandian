<template>
	<view class="page" :class="{'has-cart': cartTotal > 0}">
		<!-- 顶部导航 + 店铺信息 -->
		<view class="header" :style="headerStyle">
			<view class="nav-row">
				<view class="brand">
					<text class="brand-name lz-title">良子饭店</text>
					<text class="brand-sub">济宁菜馆</text>
				</view>
				<!-- 堂食/外卖切换 -->
				<view class="dining-switch">
					<view
						class="switch-item"
						:class="{'active': diningType === 'dine-in'}"
						@click="switchDining('dine-in')"
					>
						<text>堂食</text>
					</view>
					<view
						class="switch-item"
						:class="{'active': diningType === 'takeout'}"
						@click="switchDining('takeout')"
					>
						<text>外卖</text>
					</view>
				</view>
			</view>
			<!-- 堂食显示桌号 -->
			<view class="table-row" v-if="diningType === 'dine-in' && tableNo">
				<text class="table-tag">{{ tableNo }}号桌</text>
				<text class="table-tip">落座扫码，下单后厨房即刻备菜</text>
			</view>
			<!-- 外卖提示 -->
			<view class="table-row" v-else-if="diningType === 'takeout'">
				<text class="table-tag tag-takeout">外卖配送</text>
				<text class="table-tip">自有员工配送 · 起送 ¥{{ deliveryMin }}</text>
			</view>
		</view>

		<!-- 双栏菜单 -->
		<view class="menu-body">
			<!-- 左侧分类 -->
			<scroll-view scroll-y class="sidebar">
				<view
					v-for="(cat, idx) in categories"
					:key="cat.id"
					class="cat-item"
					:class="{'active': currentCat === idx}"
					@click="switchCat(idx)"
				>
					<text class="cat-name">{{ cat.name }}</text>
				</view>
			</scroll-view>

			<!-- 右侧菜品 -->
			<scroll-view scroll-y class="dish-list" :scroll-into-view="scrollInto">
				<view
					v-for="cat in visibleGroups"
					:key="cat.id"
					:id="'cat-' + cat.id"
					class="cat-block"
				>
					<view class="cat-title-row">
						<text class="cat-title lz-title">{{ cat.name }}</text>
						<view class="cat-line"></view>
					</view>
					<view
						v-for="dish in cat.list"
						:key="dish.id"
						class="dish"
						:class="{'soldout': dish.status === 2}"
					>
						<!-- 菜品图占位（TODO 替换真实菜品图） -->
						<view class="dish-img" :class="{'img-soldout': dish.status === 2}">
							<text class="dish-img-char">{{ dish.name.charAt(0) }}</text>
						</view>
						<view class="dish-info">
							<text class="dish-name lz-title">{{ dish.name }}</text>
							<text class="dish-desc" v-if="dish.desc">{{ dish.desc }}</text>
							<view class="dish-bottom">
								<view class="dish-price">
									<text class="price-symbol">¥</text>
									<text class="price-value">{{ dish.price }}</text>
									<text class="price-up" v-if="dish.spec_type === 'multi'">起</text>
								</view>
								<!-- 售罄标记 -->
								<view class="soldout-seal lz-seal lz-seal-soldout" v-if="dish.status === 2">
									<text>已售罄</text>
								</view>
								<!-- 多规格 -->
								<view class="spec-btn" v-else-if="dish.spec_type === 'multi'" @click="openSpec(dish)">
									<text>选规格</text>
								</view>
								<!-- 单品加号 -->
								<view class="add-btn" v-else @click="addSingle(dish)">
									<text class="add-icon">+</text>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="list-end">
					<view class="end-line"></view>
					<text class="end-text">供应尽于此</text>
					<view class="end-line"></view>
				</view>
			</scroll-view>
		</view>

		<!-- 底部购物车栏 -->
		<view class="cart-bar" v-if="cartTotal > 0">
			<view class="cart-left" @click="openCart">
				<view class="cart-icon-wrap">
					<text class="cart-icon">筐</text>
					<view class="cart-badge">{{ cartTotal }}</view>
				</view>
			</view>
			<view class="cart-center">
				<view class="cart-price">
					<text class="price-symbol">¥</text>
					<text class="price-value">{{ formatPrice(cartPrice) }}</text>
				</view>
				<text class="cart-tip" v-if="diningType === 'takeout' && cartPrice < deliveryMin">
					还差 ¥{{ (deliveryMin - cartPrice).toFixed(2) }} 起送
				</text>
			</view>
			<view
				class="checkout-btn"
				:class="{'disabled': !canCheckout}"
				@click="goCheckout"
			>
				<text>{{ checkoutText }}</text>
			</view>
		</view>

		<!-- 规格选择弹窗 -->
		<menu-open
			v-if="showSpec"
			:product="selectedDish"
			@close="closeSpec"
			@add-to-cart="handleAddFromSpec"
		></menu-open>

		<!-- 购物车弹窗 -->
		<shopping-cart
			v-if="showCart"
			:cart-list="cartList"
			:total-price="cartPrice"
			:button-text="checkoutText"
			:can-checkout="canCheckout"
			@close="closeCart"
			@update="updateCart"
			@checkout="goCheckout"
		/>
	</view>
</template>

<script>
import MenuOpen from './menu_open.vue'
import ShoppingCart from './ShoppingCart.vue'
import { getCategories, getProducts } from '@/api/customer'

export default {
	components: { MenuOpen, ShoppingCart },
	data() {
		return {
			categories: [],
			allProducts: [],
			currentCat: 0,
			scrollInto: '',
			diningType: 'dine-in',
			tableNo: '',
			showSpec: false,
			selectedDish: null,
			showCart: false,
			cartList: [],
			cartTotal: 0,
			cartPrice: 0,
			deliveryMin: 30  // 匹配后端 delivery_min_price，后续可从 API 动态获取
		}
	},
	computed: {
		headerStyle() {
			// #ifdef MP-WEIXIN
			const top = this.navCapsuleSafeStyle(this.navRpxToPx(120))
			const right = this.navCapsuleRightStyle()
			return { paddingTop: top.paddingTop, paddingRight: right.paddingRight }
			// #endif
			// #ifndef MP-WEIXIN
			return this.navSafeStyle(this.navRpxToPx(120))
			// #endif
		},
		// 按分类分组，过滤下架菜（顾客端隐藏 status=0）
		visibleGroups() {
			return this.categories.map(cat => ({
				...cat,
				list: this.allProducts.filter(p => p.category_id === cat.id && p.status !== 0)
			})).filter(g => g.list.length > 0)
		},
		canCheckout() {
			if (this.cartTotal <= 0) return false
			if (this.diningType === 'takeout' && this.cartPrice < this.deliveryMin) return false
			return true
		},
		checkoutText() {
			if (this.diningType === 'takeout' && this.cartPrice < this.deliveryMin) return '未达起送'
			return '去结算'
		},
		cartKey() {
			if (this.diningType === 'dine-in' && this.tableNo) return 'cart_' + this.tableNo
			if (this.diningType === 'takeout') return 'cart_takeout'
			return 'cartData'
		}
	},
	onLoad() {
		// 扫码进入：读取桌号
		const tableNo = uni.getStorageSync('tableNo')
		const diningType = uni.getStorageSync('diningType')
		if (tableNo) {
			this.tableNo = tableNo
			this.diningType = 'dine-in'
		}
		if (diningType === 'takeout') {
			this.diningType = 'takeout'
		}
		this.loadCart()
		this.loadMenuData()
	},
	onShow() {
		this.loadCart()
		// 从下单页返回时刷新
		const diningType = uni.getStorageSync('diningType')
		if (diningType) {
			this.diningType = diningType
		}
	},
	methods: {
		async loadMenuData() {
			try {
				const [catList, prodList] = await Promise.all([getCategories(), getProducts()])
				this.categories = catList
				this.allProducts = prodList.map(p => ({
					...p,
					desc: p.description,
					spec_type: p.specs && p.specs.length > 0 ? 'multi' : 'single'
				}))
			} catch (e) {
				console.error('加载菜单失败:', e)
			}
		},
		switchDining(type) {
			if (type === 'dine-in' && !this.tableNo) {
				uni.showToast({ title: '堂食请扫码入座', icon: 'none' })
				return
			}
			if (this.diningType !== type) {
				this.diningType = type
				uni.setStorageSync('diningType', type)
				this.loadCart()
			}
		},
		switchCat(idx) {
			this.currentCat = idx
			const cat = this.categories[idx]
			if (cat && cat.id) {
				this.scrollInto = ''
				this.$nextTick(() => { this.scrollInto = 'cat-' + cat.id })
			}
		},
		// 单品直接加购
		addSingle(dish) {
			this.handleAddFromSpec({
				id: dish.id,
				name: dish.name,
				price: Number(dish.price),
				image: dish.image,
				count: 1,
				totalPrice: Number(dish.price),
				spec_type: 'single',
				specs: '默认',
				props_text: '默认'
			})
		},
		openSpec(dish) {
			if (dish.status === 2) return
			// 构建规格数据给弹窗（使用后端 specs 数组）
			const properties = []
			if (dish.specs && dish.specs.length > 0) {
				properties.push({
					name: '规格',
					values: dish.specs.map(s => ({
						value: s.name || s.value,
						is_default: false,
						price: Number(s.price)
					}))
				})
			}
			// 默认选第一项
			properties.forEach(g => { if (g.values.length) g.values[0].is_default = true })
			const basePrice = dish.specs && dish.specs.length > 0 ? Number(dish.specs[0].price) : Number(dish.price)
			this.selectedDish = { ...dish, number: 1, property: properties, prices: {}, price: basePrice }
			this.showSpec = true
		},
		closeSpec() {
			this.showSpec = false
			this.selectedDish = null
		},
		handleAddFromSpec(item) {
			const exist = this.cartList.find(c => {
				if (c.id !== item.id) return false
				if (item.spec_type === 'single') return true
				return (c.props_text || c.specs) === (item.props_text || item.specs)
			})
			if (exist) {
				exist.count += item.count
				exist.totalPrice = exist.price * exist.count
			} else {
				this.cartList.push({ ...item })
			}
			this.syncCart()
			uni.showToast({ title: '已加入', icon: 'none', duration: 800 })
		},
		openCart() {
			if (this.cartTotal === 0) return
			this.showCart = true
		},
		closeCart() {
			this.showCart = false
		},
		updateCart(data) {
			this.cartList = data.list || []
			this.syncCart(true)
		},
		syncCart(skipStorage) {
			const list = this.cartList
			this.cartTotal = list.reduce((s, i) => s + Number(i.count || 0), 0)
			this.cartPrice = list.reduce((s, i) => s + Number(i.totalPrice || 0), 0)
			if (!skipStorage) {
				uni.setStorageSync(this.cartKey, { list, total: this.cartTotal, price: this.cartPrice })
			}
		},
		loadCart() {
			const data = uni.getStorageSync(this.cartKey)
			if (data && data.list) {
				this.cartList = data.list
				this.syncCart(true)
			}
		},
		formatPrice(v) {
			return Number(v || 0).toFixed(2)
		},
		goCheckout() {
			if (!this.canCheckout) {
				if (this.diningType === 'takeout' && this.cartPrice < this.deliveryMin) {
					uni.showToast({ title: `未达起送价 ¥${this.deliveryMin}`, icon: 'none' })
				}
				return
			}
			uni.setStorageSync(this.cartKey, { list: this.cartList, total: this.cartTotal, price: this.cartPrice })
			uni.setStorageSync('diningType', this.diningType)
			this.showCart = false
			uni.navigateTo({ url: '/pages/order/submit' })
		}
	}
}
</script>

<style lang="scss" scoped>
.page {
	position: relative;
	background-color: $lz-paper;
	width: 100%;
	height: 100vh;
	box-sizing: border-box;
	overflow: hidden;
	display: flex;
	flex-direction: column;

	&.has-cart { padding-bottom: 140rpx; }
}

/* 顶部 */
.header {
	background-color: $lz-paper-light;
	padding: 100px 32rpx 20rpx;
	border-bottom: 1rpx solid $lz-line;

	.nav-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8rpx 0 16rpx;

		.brand {
			display: flex;
			align-items: baseline;
			gap: 12rpx;

			.brand-name {
				font-size: 40rpx;
				color: $lz-ink;
				font-weight: 600;
			}
			.brand-sub {
				font-size: 22rpx;
				color: $lz-ink-3;
				letter-spacing: 2rpx;
			}
		}

		.dining-switch {
			display: flex;
			background: $lz-paper;
			border-radius: $lz-radius-pill;
			padding: 4rpx;
			border: 1rpx solid $lz-line;

			.switch-item {
				padding: 10rpx 28rpx;
				font-size: 26rpx;
				color: $lz-ink-2;
				border-radius: $lz-radius-pill;
				transition: all 0.25s;

				&.active {
					background: $lz-primary;
					color: #fff;
					font-weight: 500;
				}
			}
		}
	}

	.table-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 4rpx 0;

		.table-tag {
			font-size: 24rpx;
			color: #fff;
			background: $lz-primary;
			padding: 6rpx 18rpx;
			border-radius: $lz-radius-tag;
			font-weight: 500;
		}
		.tag-takeout { background: $lz-gold; }

		.table-tip {
			font-size: 22rpx;
			color: $lz-ink-3;
		}
	}
}

/* 双栏 */
.menu-body {
	flex: 1;
	min-height: 0;
	display: flex;
	overflow: hidden;

	.sidebar {
		width: 168rpx;
		height: 100%;
		background: $lz-paper;

		.cat-item {
			padding: 36rpx 0;
			text-align: center;
			font-size: 28rpx;
			color: $lz-ink-2;
			position: relative;

			&.active {
				background: $lz-card;
				color: $lz-primary;
				font-weight: 600;

				&::before {
					content: '';
					position: absolute;
					left: 0;
					top: 50%;
					transform: translateY(-50%);
					width: 6rpx;
					height: 40rpx;
					background: $lz-primary;
					border-radius: 0 4rpx 4rpx 0;
				}
			}
		}
	}

	.dish-list {
		flex: 1;
		height: 100%;
		padding: 0 28rpx;
		background: $lz-card;

		.cat-block {
			padding-top: 24rpx;
		}

		.cat-title-row {
			display: flex;
			align-items: center;
			gap: 16rpx;
			padding: 8rpx 0 12rpx;

			.cat-title {
				font-size: 30rpx;
				color: $lz-ink;
				font-weight: 600;
			}
			.cat-line {
				flex: 1;
				height: 1rpx;
				background: $lz-line;
			}
		}

		.dish {
			display: flex;
			padding: 24rpx 0;
			border-bottom: 1rpx solid $lz-line-light;

			.dish-img {
				width: 160rpx;
				height: 160rpx;
				border-radius: $lz-radius-img;
				background: linear-gradient(135deg, $lz-primary-bg, rgba(184, 149, 106, 0.12));
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				border: 1rpx solid $lz-line;

				.dish-img-char {
					font-family: $lz-font-serif;
					font-size: 56rpx;
					color: $lz-primary;
					opacity: 0.7;
				}

				&.img-soldout {
					background: $lz-paper;
					.dish-img-char { color: $lz-ink-3; opacity: 0.4; }
				}
			}

			.dish-info {
				flex: 1;
				margin-left: 24rpx;
				display: flex;
				flex-direction: column;
				min-width: 0;

				.dish-name {
					font-size: 30rpx;
					color: $lz-ink;
					font-weight: 600;
					margin-bottom: 8rpx;
				}
				.dish-desc {
					font-size: 22rpx;
					color: $lz-ink-3;
					margin-bottom: auto;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.dish-bottom {
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-top: 16rpx;

					.dish-price {
						display: flex;
						align-items: baseline;
						color: $lz-primary;

						.price-symbol { font-size: 24rpx; font-weight: 600; }
						.price-value { font-size: 38rpx; font-weight: 700; margin-left: 4rpx; }
						.price-up { font-size: 20rpx; color: $lz-ink-3; margin-left: 6rpx; font-weight: 400; }
					}

					.soldout-seal { font-size: 22rpx; }

					.spec-btn {
						background: $lz-primary;
						color: #fff;
						font-size: 24rpx;
						padding: 12rpx 28rpx;
						border-radius: $lz-radius-pill;
						&:active { background: $lz-primary-dark; transform: scale(0.96); }
					}

					.add-btn {
						width: 52rpx;
						height: 52rpx;
						border-radius: 50%;
						background: $lz-primary;
						display: flex;
						align-items: center;
						justify-content: center;
						box-shadow: $lz-shadow-btn;

						.add-icon {
							color: #fff;
							font-size: 36rpx;
							line-height: 1;
							font-weight: 500;
						}
						&:active { transform: scale(0.9); background: $lz-primary-dark; }
					}
				}
			}

			&.soldout {
				.dish-name, .dish-desc { color: $lz-ink-3; }
			}
		}

		.list-end {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 20rpx;
			padding: 48rpx 0;

			.end-line { width: 60rpx; height: 1rpx; background: $lz-line; }
			.end-text { font-size: 22rpx; color: $lz-ink-3; letter-spacing: 4rpx; }
		}
	}
}

/* 底部购物车栏 */
.cart-bar {
	position: fixed;
	left: 24rpx;
	right: 24rpx;
	bottom: calc(24rpx + env(safe-area-inset-bottom));
	height: 104rpx;
	background: $lz-ink;
	border-radius: $lz-radius-pill;
	display: flex;
	align-items: center;
	padding: 0 12rpx 0 24rpx;
	box-shadow: 0 8rpx 32rpx rgba(31, 26, 23, 0.18);
	z-index: 100;

	.cart-left {
		position: relative;
		margin-top: -28rpx;

		.cart-icon-wrap {
			width: 96rpx;
			height: 96rpx;
			border-radius: 50%;
			background: $lz-primary;
			display: flex;
			align-items: center;
			justify-content: center;
			border: 4rpx solid $lz-ink;
			box-shadow: $lz-shadow-btn;

			.cart-icon {
				color: #fff;
				font-size: 40rpx;
				font-family: $lz-font-serif;
				font-weight: 600;
			}

			.cart-badge {
				position: absolute;
				top: -6rpx;
				right: -6rpx;
				min-width: 36rpx;
				height: 36rpx;
				padding: 0 8rpx;
				background: $lz-warn;
				border-radius: $lz-radius-pill;
				color: #fff;
				font-size: 22rpx;
				line-height: 36rpx;
				text-align: center;
				font-weight: 600;
				border: 2rpx solid $lz-ink;
			}
		}
	}

	.cart-center {
		flex: 1;
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;

		.cart-price {
			display: flex;
			align-items: baseline;
			color: #fff;

			.price-symbol { font-size: 24rpx; font-weight: 600; }
			.price-value { font-size: 38rpx; font-weight: 700; margin-left: 4rpx; }
		}
		.cart-tip { font-size: 20rpx; color: $lz-warn; margin-top: 2rpx; }
	}

	.checkout-btn {
		background: $lz-primary;
		color: #fff;
		font-size: 30rpx;
		font-weight: 600;
		padding: 0 44rpx;
		height: 84rpx;
		border-radius: $lz-radius-pill;
		display: flex;
		align-items: center;
		justify-content: center;
		letter-spacing: 2rpx;
		&:active { background: $lz-primary-dark; transform: scale(0.97); }
		&.disabled {
			background: $lz-disabled;
			color: rgba(255,255,255,0.8);
		}
	}
}
</style>
