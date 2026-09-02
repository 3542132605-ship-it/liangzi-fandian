<template>
	<view class="page">
		<!-- 顶部品牌区 -->
		<view class="hero" :style="heroStyle">
			<view class="hero-inner">
				<view class="brand-row">
					<view class="brand-text">
						<text class="brand-name lz-title">良子饭店</text>
						<text class="brand-sub">济宁菜馆</text>
					</view>
					<view class="brand-seal">
						<text class="seal-char">良</text>
					</view>
				</view>
				<text class="brand-slogan">鲁南风味 · 招牌现做</text>
			</view>
		</view>

		<!-- 公告 -->
		<view class="notice" v-if="merchant.notice">
			<text class="notice-tag">告</text>
			<text class="notice-text">{{ merchant.notice }}</text>
		</view>

		<!-- 堂食 / 外卖 入口 -->
		<view class="entry-section">
			<view class="entry-card" @click="goDineIn">
				<view class="entry-icon icon-dine">
					<text class="icon-char">堂</text>
				</view>
				<view class="entry-content">
					<text class="entry-title lz-title">堂食点餐</text>
					<text class="entry-desc">落座扫码 即刻点餐</text>
				</view>
				<text class="entry-arrow">›</text>
			</view>
			<view class="entry-card" @click="goTakeout">
				<view class="entry-icon icon-takeout">
					<text class="icon-char">外</text>
				</view>
				<view class="entry-content">
					<text class="entry-title lz-title">外卖配送</text>
					<text class="entry-desc">送到家中 自有员工配送</text>
				</view>
				<text class="entry-arrow">›</text>
			</view>
		</view>

		<!-- 店铺信息 -->
		<view class="info-card lz-card">
			<view class="info-row">
				<text class="info-label">营业时间</text>
				<text class="info-value">{{ merchant.business_hours }}</text>
			</view>
			<view class="info-divider"></view>
			<view class="info-row">
				<text class="info-label">订餐电话</text>
				<text class="info-value">{{ merchant.phone }}</text>
			</view>
			<view class="info-divider"></view>
			<view class="info-row">
				<text class="info-label">地址</text>
				<text class="info-value">{{ merchant.address }}</text>
			</view>
		</view>

		<!-- 招牌推荐 -->
		<view class="recommend">
			<view class="rec-head">
				<text class="rec-title lz-title">招牌推荐</text>
				<view class="rec-line"></view>
			</view>
			<scroll-view scroll-x class="rec-scroll" :show-scrollbar="false">
				<view class="rec-card" v-for="dish in hotDishes" :key="dish.id" @click="goMenuDish(dish)">
					<view class="rec-img">
						<text class="rec-img-char">{{ dish.name.charAt(0) }}</text>
					</view>
					<view class="rec-info">
						<text class="rec-name">{{ dish.name }}</text>
						<view class="rec-bottom">
							<view class="rec-price">
								<text class="symbol">¥</text>
								<text class="value">{{ dish.price }}</text>
							</view>
							<view class="rec-add" @click.stop="quickAdd(dish)">
								<text>+</text>
							</view>
						</view>
					</view>
				</view>
				<view class="rec-more" @click="goMenu">
					<text class="more-text">查看全菜单 ›</text>
				</view>
			</scroll-view>
		</view>

	</view>
</template>

<script>
import { customerLogin, getProducts } from '@/api/customer'

export default {
	data() {
		return {
			merchant: {
				name: '良子饭店',
				sub: '济宁菜馆',
				notice: '欢迎光临！本店招牌菜每日限量供应，建议提前下单。',
				business_hours: '10:00 - 22:00',
				phone: '18266832723',
				address: '中国石油济北新区加油站南44米'
			},
			hotDishes: []
		}
	},
	computed: {
		heroStyle() {
			// TODO 诊断：临时硬编码验证渲染管道
			return { paddingTop: '300px' }
		}
	},
	async onLoad(options) {
		await this.ensureLogin()
		this.loadHotDishes()
		// 扫码进入：解析桌号
		let tableNo = ''
		if (options && options.table_no) {
			tableNo = decodeURIComponent(options.table_no)
		} else if (options && options.scene) {
			tableNo = decodeURIComponent(options.scene)
		}
		if (tableNo) {
			uni.setStorageSync('tableNo', tableNo)
			uni.setStorageSync('diningType', 'dine-in')
			uni.showToast({
				title: `${tableNo}号桌 欢迎光临`,
				icon: 'none',
				duration: 1500
			})
			setTimeout(() => {
				uni.switchTab({ url: '/pages/menu/menu' })
			}, 1200)
		}
	},
	methods: {
		async ensureLogin() {
			const token = uni.getStorageSync('token')
			if (token) return
			try {
				const res = await customerLogin({})
				uni.setStorageSync('token', res.token)
				uni.setStorageSync('userId', res.userId)
				uni.setStorageSync('userInfo', { nickName: res.nickname || '微信用户', avatarUrl: '' })
			} catch (e) {
				console.error('自动登录失败:', e)
			}
		},
		async loadHotDishes() {
			try {
				const list = await getProducts()
				this.hotDishes = list
					.filter(p => p.is_hot && p.status !== 0)
					.map(p => ({
						...p,
						desc: p.description,
						spec_type: p.specs && p.specs.length > 0 ? 'multi' : 'single'
					}))
					.slice(0, 6)
			} catch (e) {
				console.error('加载推荐菜品失败:', e)
			}
		},
		goDineIn() {
			const tableNo = uni.getStorageSync('tableNo')
			if (!tableNo) {
				uni.showToast({ title: '请扫描桌上二维码入座', icon: 'none' })
				return
			}
			uni.setStorageSync('diningType', 'dine-in')
			uni.switchTab({ url: '/pages/menu/menu' })
		},
		goTakeout() {
			uni.setStorageSync('diningType', 'takeout')
			uni.switchTab({ url: '/pages/menu/menu' })
		},
		goMenu() {
			uni.switchTab({ url: '/pages/menu/menu' })
		},
		goMenuDish(dish) {
			uni.switchTab({ url: '/pages/menu/menu' })
		},
		quickAdd(dish) {
			if (dish.status === 2) {
				uni.showToast({ title: '已售罄', icon: 'none' })
				return
			}
			if (dish.spec_type === 'multi') {
				uni.switchTab({ url: '/pages/menu/menu' })
				return
			}
			// 单品直接加购
			const cart = uni.getStorageSync('cartData') || { list: [], total: 0, price: 0 }
			const exist = cart.list.find(c => c.id === dish.id)
			if (exist) {
				exist.count++
				exist.totalPrice = exist.price * exist.count
			} else {
				cart.list.push({
					id: dish.id, name: dish.name, price: Number(dish.price),
					image: dish.image, count: 1, totalPrice: Number(dish.price),
					spec_type: 'single', specs: '默认', props_text: '默认'
				})
			}
			cart.total = cart.list.reduce((s, i) => s + i.count, 0)
			cart.price = cart.list.reduce((s, i) => s + i.totalPrice, 0)
			uni.setStorageSync('cartData', cart)
			uni.showToast({ title: '已加入', icon: 'none', duration: 800 })
		}
	}
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background-color: $lz-paper;
	padding-bottom: calc(60rpx + env(safe-area-inset-bottom));
}

/* 顶部品牌区 */
.hero {
	background: $lz-paper-light;
	border-bottom: 1rpx solid $lz-line;
	padding-top: 100px;

	.hero-inner {
		padding: 24rpx 40rpx 36rpx;
	}

	.brand-row {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.brand-text {
			display: flex;
			flex-direction: column;
			gap: 8rpx;

			.brand-name {
				font-size: 64rpx;
				color: $lz-ink;
				font-weight: 700;
				letter-spacing: 6rpx;
			}
			.brand-sub {
				font-size: 24rpx;
				color: $lz-ink-3;
				letter-spacing: 4rpx;
			}
		}

		.brand-seal {
			width: 96rpx;
			height: 96rpx;
			border-radius: $lz-radius-tag;
			background: $lz-primary;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: $lz-shadow-btn;
			transform: rotate(-3deg);

			.seal-char {
				font-family: $lz-font-serif;
				font-size: 56rpx;
				color: #fff;
				font-weight: 700;
			}
		}
	}

	.brand-slogan {
		display: block;
		margin-top: 20rpx;
		font-size: 22rpx;
		color: $lz-primary;
		letter-spacing: 4rpx;
	}
}

/* 公告 */
.notice {
	margin: 20rpx 32rpx 0;
	padding: 18rpx 24rpx;
	background: $lz-paper-light;
	border-radius: $lz-radius-card;
	border: 1rpx solid $lz-line;
	display: flex;
	align-items: center;
	gap: 14rpx;

	.notice-tag {
		flex-shrink: 0;
		width: 40rpx;
		height: 40rpx;
		border-radius: $lz-radius-tag;
		background: $lz-primary;
		color: #fff;
		font-size: 22rpx;
		font-family: $lz-font-serif;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
	}
	.notice-text {
		font-size: 24rpx;
		color: $lz-ink-2;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

/* 入口卡片 */
.entry-section {
	margin: 24rpx 32rpx 0;
	display: flex;
	flex-direction: column;
	gap: 20rpx;

	.entry-card {
		background: $lz-card;
		border-radius: $lz-radius-card;
		border: 1rpx solid $lz-line;
		padding: 32rpx 28rpx;
		display: flex;
		align-items: center;
		gap: 24rpx;
		box-shadow: $lz-shadow-card;
		transition: transform 0.15s;

		&:active { transform: scale(0.98); }

		.entry-icon {
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

			&.icon-dine {
				background: $lz-primary-bg;
				.icon-char { color: $lz-primary; }
			}
			&.icon-takeout {
				background: rgba(184, 149, 106, 0.14);
				.icon-char { color: $lz-gold; }
			}
		}

		.entry-content {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 8rpx;

			.entry-title {
				font-size: 34rpx;
				color: $lz-ink;
				font-weight: 600;
			}
			.entry-desc {
				font-size: 24rpx;
				color: $lz-ink-3;
			}
		}

		.entry-arrow {
			font-size: 40rpx;
			color: $lz-ink-3;
			line-height: 1;
		}
	}
}

/* 店铺信息 */
.info-card {
	margin: 24rpx 32rpx 0;
	padding: 8rpx 28rpx;

	.info-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 0;

		.info-label {
			font-size: 26rpx;
			color: $lz-ink-3;
			letter-spacing: 1rpx;
		}
		.info-value {
			font-size: 28rpx;
			color: $lz-ink;
		}
	}
	.info-divider {
		height: 1rpx;
		background: $lz-line-light;
	}
}

/* 招牌推荐 */
.recommend {
	margin: 32rpx 0 0;

	.rec-head {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 0 32rpx;
		margin-bottom: 24rpx;

		.rec-title {
			font-size: 34rpx;
			color: $lz-ink;
			font-weight: 600;
			letter-spacing: 2rpx;
		}
		.rec-line {
			flex: 1;
			height: 1rpx;
			background: $lz-line;
		}
	}

	.rec-scroll {
		white-space: nowrap;
		padding: 0 32rpx;

		.rec-card {
			display: inline-block;
			width: 240rpx;
			margin-right: 24rpx;
			background: $lz-card;
			border-radius: $lz-radius-card;
			border: 1rpx solid $lz-line;
			overflow: hidden;
			vertical-align: top;

			.rec-img {
				width: 100%;
				height: 180rpx;
				background: linear-gradient(135deg, $lz-primary-bg, rgba(184, 149, 106, 0.12));
				display: flex;
				align-items: center;
				justify-content: center;

				.rec-img-char {
					font-family: $lz-font-serif;
					font-size: 72rpx;
					color: $lz-primary;
					opacity: 0.6;
				}
			}
			.rec-info {
				padding: 16rpx 20rpx 20rpx;

				.rec-name {
					font-size: 26rpx;
					color: $lz-ink;
					font-weight: 600;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				.rec-bottom {
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-top: 12rpx;

					.rec-price {
						display: flex;
						align-items: baseline;
						color: $lz-primary;
						.symbol { font-size: 20rpx; font-weight: 600; }
						.value { font-size: 30rpx; font-weight: 700; margin-left: 2rpx; }
					}
					.rec-add {
						width: 44rpx;
						height: 44rpx;
						border-radius: 50%;
						background: $lz-primary;
						color: #fff;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 32rpx;
						line-height: 1;
						&:active { transform: scale(0.9); }
					}
				}
			}
		}

		.rec-more {
			display: inline-block;
			width: 160rpx;
			height: 100%;
			vertical-align: top;
			margin-left: 8rpx;
			display: inline-flex;
			align-items: center;
			justify-content: center;

			.more-text {
				font-size: 24rpx;
				color: $lz-primary;
				letter-spacing: 1rpx;
			}
		}
	}
}

</style>
