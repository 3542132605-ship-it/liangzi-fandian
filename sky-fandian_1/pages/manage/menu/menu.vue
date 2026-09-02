<template>
	<view class="page">
		<!-- 顶栏 -->
		<view class="nav" :style="navStyle">
			<text class="nav-title lz-title">菜品管理</text>
			<text class="nav-count">共 {{ products.length }} 道</text>
		</view>

		<!-- 分类筛选 -->
		<scroll-view scroll-x class="cate-bar" :show-scrollbar="false">
			<view
				class="cate-item"
				v-for="c in cates"
				:key="c.id"
				:class="{ active: currentCate === c.id }"
				@click="currentCate = c.id"
			>
				<text>{{ c.name }}</text>
			</view>
		</scroll-view>

		<!-- 菜品列表 -->
		<view class="dish-list" v-if="filteredProducts.length">
			<view
				class="dish-swipe"
				v-for="(dish, idx) in filteredProducts"
				:key="dish.id"
			>
				<view
					class="dish-card"
					:class="{ 'is-soldout': dish.status === 2, 'is-off': dish.status === 0 }"
					:style="{ transform: 'translateX(' + (swipeIdx === idx ? -swipeW : 0) + 'rpx)' }"
					@touchstart="onTouchStart($event, idx)"
					@touchmove="onTouchMove($event, idx)"
					@touchend="onTouchEnd($event, idx)"
				>
					<!-- 图 -->
					<view class="dish-img" :class="'cat-' + dish.category_id">
						<text class="img-char">{{ dish.name.charAt(0) }}</text>
						<view class="soldout-mask" v-if="dish.status === 2">
							<text>售罄</text>
						</view>
					</view>

					<!-- 信息 -->
					<view class="dish-info">
						<view class="info-top">
							<text class="dish-name">{{ dish.name }}</text>
							<view class="hot-seal" v-if="dish.is_hot"><text>招牌</text></view>
						</view>
						<view class="info-mid">
							<text class="dish-price" @click.stop="openPricePad(dish)"><text class="sym">¥</text>{{ dish.price }}</text>
							<text class="dish-spec" v-if="dish.spec_type === 'multi'">{{ specText(dish) }}</text>
						</view>
						<view class="info-bottom" v-if="dish.status === 2">
							<text class="recover-tip">明日 0:00 自动恢复上架</text>
						</view>
					</view>

					<!-- 状态切换 -->
					<view class="dish-status" @click.stop="openStatusSheet(dish)">
						<text class="status-text" :class="'st-' + dish.status">{{ statusText(dish.status) }}</text>
						<text class="status-arrow">▼</text>
					</view>
				</view>

				<!-- 左滑操作 -->
				<view class="swipe-actions">
					<view class="swipe-btn edit" @click.stop="goEdit(dish)"><text>编辑</text></view>
					<view class="swipe-btn del" @click.stop="confirmDelete(dish)"><text>删除</text></view>
				</view>
			</view>
		</view>

		<!-- 空态 -->
		<view class="empty" v-else>
			<text class="empty-char">菜</text>
			<text class="empty-text">该分类暂无菜品</text>
		</view>

		<!-- 新增按钮 -->
		<view class="add-btn" @click="goEdit(null)">
			<text class="add-char">+</text>
			<text class="add-text">新增菜品</text>
		</view>

		<view style="height: 200rpx;"></view>
		<manage-tabbar active="menu"></manage-tabbar>

		<!-- 改价数字键盘 -->
		<view class="mask" v-if="pricePad.show" @click="pricePad.show = false"></view>
		<view class="price-pad" v-if="pricePad.show">
			<view class="pad-head">
				<text class="pad-title">{{ pricePad.dish && pricePad.dish.name }}</text>
				<text class="pad-close" @click="pricePad.show = false">×</text>
			</view>
			<view class="pad-display">
				<text class="cur"><text class="sym">¥</text>{{ pricePad.value || '0' }}</text>
			</view>
			<view class="pad-keys">
				<view class="key" v-for="k in keys" :key="k" @click="tapKey(k)">
					<text>{{ k === 'del' ? '←' : k }}</text>
				</view>
			</view>
			<view class="pad-confirm lz-btn-primary" @click="confirmPrice"><text>确定改价</text></view>
		</view>
	</view>
</template>

<script>
import { getProducts, updateProductStatus, updateProductPrice, deleteProduct } from '@/api/manage'
import { getCategories } from '@/api/customer'
import ManageTabbar from '@/components/manage-tabbar/manage-tabbar.vue'

export default {
	components: { ManageTabbar },
	data() {
		return {
			products: [],
			cates: [{ id: 0, name: '全部' }],
			currentCate: 0,
			swipeIdx: -1,
			swipeW: 280,
			touchStartX: 0,
			touchStartY: 0,
			touchCurX: 0,
			keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'],
			pricePad: { show: false, dish: null, value: '' }
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
		filteredProducts() {
			if (this.currentCate === 0) return this.products
			return this.products.filter(p => p.category_id === this.currentCate)
		}
	},
	onLoad() {
		if (!uni.getStorageSync('staff_token')) {
			uni.reLaunch({ url: '/pages/manage/login/login' })
			return
		}
		this.loadData()
	},
	onShow() {
		this.loadData()
	},
	methods: {
		async loadData() {
			try {
				const [products, categories] = await Promise.all([getProducts(), getCategories()])
				this.products = products.map(p => ({
					...p,
					desc: p.description,
					price: Number(p.price),
					spec_type: p.specs && p.specs.length ? 'multi' : 'single'
				}))
				this.cates = [{ id: 0, name: '全部' }, ...categories]
			} catch (e) {
				uni.showToast({ title: '加载失败', icon: 'none' })
			}
		},
		statusText(s) {
			return { 1: '上架', 2: '售罄', 0: '下架' }[s] || '上架'
		},
		specText(dish) {
			if (!dish.specs || !dish.specs.length) return '多规格'
			return dish.specs.map(s => s.name + '¥' + s.price).join(' / ')
		},
		async openStatusSheet(dish) {
			uni.showActionSheet({
				itemList: ['上架', '售罄', '下架'],
				success: async (res) => {
					const map = [1, 2, 0]
					const newStatus = map[res.tapIndex]
					try {
						await updateProductStatus(dish.id, newStatus)
						dish.status = newStatus
						uni.showToast({ title: '已切换为' + this.statusText(dish.status), icon: 'none' })
					} catch (e) {
						uni.showToast({ title: '操作失败', icon: 'none' })
					}
				}
			})
		},
		openPricePad(dish) {
			this.pricePad = { show: true, dish, value: String(dish.price) }
			this.swipeIdx = -1
		},
		tapKey(k) {
			if (k === 'del') {
				this.pricePad.value = this.pricePad.value.slice(0, -1)
			} else if (k === 'ok') {
				this.confirmPrice()
			} else {
				let v = this.pricePad.value
				if (v === '0') v = ''
				if (v.length >= 5) return
				this.pricePad.value = v + k
			}
		},
		async confirmPrice() {
			const v = Number(this.pricePad.value)
			if (!v || v <= 0) {
				uni.showToast({ title: '请输入有效价格', icon: 'none' })
				return
			}
			try {
				await updateProductPrice(this.pricePad.dish.id, v)
				this.pricePad.dish.price = v
				this.pricePad.show = false
				uni.showToast({ title: '改价成功', icon: 'success' })
			} catch (e) {
				uni.showToast({ title: '改价失败', icon: 'none' })
			}
		},
		goEdit(dish) {
			this.swipeIdx = -1
			uni.setStorageSync('dish_edit_payload', dish ? { mode: 'edit', dish } : { mode: 'add' })
			uni.navigateTo({ url: '/pages/manage/menu/edit' })
		},
		confirmDelete(dish) {
			this.swipeIdx = -1
			uni.showModal({
				title: '删除菜品',
				content: `确定删除「${dish.name}」？此操作不可恢复。`,
				confirmColor: '#9B2D28',
				success: async (res) => {
					if (res.confirm) {
						try {
							await deleteProduct(dish.id)
							const i = this.products.findIndex(p => p.id === dish.id)
							if (i > -1) this.products.splice(i, 1)
							uni.showToast({ title: '已删除', icon: 'none' })
						} catch (e) {
							uni.showToast({ title: '删除失败', icon: 'none' })
						}
					}
				}
			})
		},
		/* 左滑手势 */
		onTouchStart(e, idx) {
			this.touchStartX = e.touches[0].clientX
			this.touchStartY = e.touches[0].clientY
			this.touchCurX = this.touchStartX
		},
		onTouchMove(e, idx) {
			this.touchCurX = e.touches[0].clientX
		},
		onTouchEnd(e, idx) {
			const dx = this.touchCurX - this.touchStartX
			if (dx < -40) {
				this.swipeIdx = idx
			} else if (dx > 40 || this.swipeIdx === idx) {
				this.swipeIdx = -1
			}
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
	.nav-title {
		font-size: 38rpx;
		font-weight: 600;
		letter-spacing: 3rpx;
	}
	.nav-count {
		font-size: 24rpx;
		color: $lz-ink-3;
		padding-bottom: 4rpx;
	}
}

/* 分类筛选 */
.cate-bar {
	white-space: nowrap;
	padding: 24rpx 32rpx 12rpx;
	.cate-item {
		display: inline-block;
		padding: 12rpx 32rpx;
		margin-right: 16rpx;
		border-radius: $lz-radius-pill;
		background: $lz-card;
		border: 1rpx solid $lz-line;
		text { font-size: 26rpx; color: $lz-ink-2; }
		&.active {
			background: $lz-primary;
			border-color: $lz-primary;
			text { color: #fff; font-weight: 500; }
		}
	}
}

/* 菜品列表 */
.dish-list {
	padding: 12rpx 32rpx 0;
}
.dish-swipe {
	position: relative;
	margin-bottom: 20rpx;
	overflow: hidden;
}
.dish-card {
	position: relative;
	z-index: 2;
	display: flex;
	align-items: center;
	gap: 22rpx;
	background: $lz-card;
	border: 1rpx solid $lz-line;
	border-radius: $lz-radius-card;
	padding: 22rpx;
	box-shadow: $lz-shadow-card;
	transition: transform 0.22s ease;

	&.is-off {
		opacity: 0.55;
	}

	.dish-img {
		width: 120rpx;
		height: 120rpx;
		border-radius: $lz-radius-img;
		background: linear-gradient(135deg, $lz-primary-bg, rgba(184,149,106,0.12));
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		flex-shrink: 0;
		.img-char {
			font-family: $lz-font-serif;
			font-size: 56rpx;
			color: $lz-primary;
			font-weight: 600;
		}
		.soldout-mask {
			position: absolute;
			inset: 0;
			background: rgba(199,123,58,0.85);
			border-radius: $lz-radius-img;
			display: flex;
			align-items: center;
			justify-content: center;
			text { color: #fff; font-size: 28rpx; font-weight: 600; }
		}
	}

	.dish-info {
		flex: 1;
		min-width: 0;
		.info-top {
			display: flex;
			align-items: center;
			gap: 12rpx;
			.dish-name {
				font-size: 30rpx;
				color: $lz-ink;
				font-weight: 600;
			}
			.hot-seal {
				padding: 2rpx 12rpx;
				border: 2rpx solid $lz-gold;
				border-radius: $lz-radius-tag;
				background: rgba(184,149,106,0.1);
				text { font-size: 18rpx; color: $lz-gold; }
			}
		}
		.info-mid {
			margin-top: 10rpx;
			display: flex;
			align-items: center;
			gap: 16rpx;
			.dish-price {
				color: $lz-primary;
				font-weight: 600;
				.sym { font-size: 22rpx; }
				font-size: 32rpx;
			}
			.dish-spec {
				font-size: 22rpx;
				color: $lz-ink-3;
			}
		}
		.info-bottom {
			margin-top: 8rpx;
			.recover-tip {
				font-size: 20rpx;
				color: $lz-soldout;
			}
		}
	}

	.dish-status {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rpx;
		padding: 12rpx 16rpx;
		border-radius: $lz-radius-tag;
		background: $lz-paper;
		.status-text {
			font-size: 24rpx;
			font-weight: 600;
			&.st-1 { color: $lz-success; }
			&.st-2 { color: $lz-soldout; }
			&.st-0 { color: $lz-ink-3; }
		}
		.status-arrow {
			font-size: 16rpx;
			color: $lz-ink-3;
		}
	}
}

/* 左滑操作 */
.swipe-actions {
	position: absolute;
	right: 0;
	top: 0;
	bottom: 0;
	z-index: 1;
	display: flex;
	align-items: center;
	.swipe-btn {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 140rpx;
		text { color: #fff; font-size: 26rpx; }
		&.edit { background: $lz-gold; }
		&.del { background: $lz-primary; }
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

/* 新增按钮 */
.add-btn {
	position: fixed;
	right: 32rpx;
	bottom: calc(140rpx + env(safe-area-inset-bottom));
	z-index: 100;
	display: flex;
	align-items: center;
	gap: 10rpx;
	padding: 22rpx 32rpx;
	border-radius: $lz-radius-pill;
	background: $lz-primary;
	box-shadow: $lz-shadow-btn;
	.add-char { color: #fff; font-size: 36rpx; line-height: 1; }
	.add-text { color: #fff; font-size: 28rpx; font-weight: 500; }
	&:active { transform: scale(0.96); }
}

/* 数字键盘 */
.mask {
	position: fixed;
	inset: 0;
	z-index: 200;
	background: rgba(31,26,23,0.45);
}
.price-pad {
	position: fixed;
	left: 0; right: 0; bottom: 0;
	z-index: 201;
	background: $lz-card;
	border-radius: 32rpx 32rpx 0 0;
	padding-bottom: env(safe-area-inset-bottom);
	.pad-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 32rpx 16rpx;
		.pad-title { font-size: 30rpx; color: $lz-ink; font-weight: 600; }
		.pad-close { font-size: 44rpx; color: $lz-ink-3; line-height: 1; }
	}
	.pad-display {
		text-align: center;
		padding: 16rpx 0 24rpx;
		.cur { font-size: 64rpx; color: $lz-primary; font-weight: 700; .sym { font-size: 32rpx; } }
	}
	.pad-keys {
		display: flex;
		flex-wrap: wrap;
		padding: 0 24rpx;
		.key {
			width: calc((100% - 32rpx) / 3);
			margin: 0 8rpx 16rpx;
			height: 96rpx;
			border-radius: $lz-radius-input;
			background: $lz-paper;
			display: flex;
			align-items: center;
			justify-content: center;
			text { font-size: 40rpx; color: $lz-ink; font-weight: 500; }
			&:active { background: $lz-line-light; }
		}
	}
	.pad-confirm {
		margin: 8rpx 32rpx 32rpx;
		height: 92rpx;
		line-height: 92rpx;
	}
}
</style>
