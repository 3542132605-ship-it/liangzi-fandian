<template>
	<view class="page">
		<!-- 顶栏 -->
		<view class="nav" :style="navStyle">
			<view class="nav-back" @click="goBack"><text class="back-arrow">‹</text></view>
			<text class="nav-title lz-title">{{ isEdit ? '编辑菜品' : '新增菜品' }}</text>
			<text class="nav-del" v-if="isEdit" @click="onDelete">删除</text>
			<text v-else style="width:60rpx;"></text>
		</view>

		<!-- 图片 -->
		<view class="section">
			<text class="sec-label">菜品图片</text>
			<view class="img-uploader" @click="chooseImg">
				<image v-if="form.image" class="img-preview" :src="form.image" mode="aspectFill"></image>
				<view class="img-placeholder" v-else>
					<text class="ph-char">{{ form.name ? form.name.charAt(0) : '图' }}</text>
					<text class="ph-tip">点击上传</text>
				</view>
			</view>
		</view>

		<!-- 基本信息 -->
		<view class="form-card lz-card">
			<view class="form-item">
				<text class="form-label">名称</text>
				<input class="form-input" v-model="form.name" placeholder="如：糖醋里脊" placeholder-class="ph" maxlength="12" />
			</view>
			<view class="form-divider"></view>
			<view class="form-item" @click="showCatePicker = true">
				<text class="form-label">分类</text>
				<text class="form-value" :class="{ ph: !cateName }">{{ cateName || '请选择分类' }}</text>
				<text class="form-arrow">›</text>
			</view>
			<view class="form-divider"></view>
			<view class="form-item">
				<text class="form-label">价格</text>
				<text class="price-sym">¥</text>
				<input class="form-input price-input" v-model="form.price" type="digit" placeholder="0" placeholder-class="ph" />
			</view>
			<view class="form-divider"></view>
			<view class="form-item">
				<text class="form-label">描述</text>
				<input class="form-input" v-model="form.desc" placeholder="一句话介绍（选填）" placeholder-class="ph" maxlength="20" />
			</view>
		</view>

		<!-- 规格 -->
		<view class="section">
			<view class="sec-head">
				<text class="sec-label">规格设置</text>
				<view class="spec-switch">
					<text class="switch-opt" :class="{ active: form.spec_type === 'single' }" @click="form.spec_type = 'single'">单品</text>
					<text class="switch-opt" :class="{ active: form.spec_type === 'multi' }" @click="form.spec_type = 'multi'">多规格</text>
				</view>
			</view>

			<view class="spec-list" v-if="form.spec_type === 'multi'">
				<view class="spec-row" v-for="(sp, i) in form.specs" :key="i">
					<input class="spec-name" v-model="sp.name" placeholder="规格名(如大份)" placeholder-class="ph" maxlength="8" />
					<text class="spec-sym">¥</text>
					<input class="spec-price" v-model="sp.price" type="digit" placeholder="0" placeholder-class="ph" />
					<view class="spec-del" @click="form.specs.splice(i, 1)"><text>×</text></view>
				</view>
				<view class="spec-add" @click="form.specs.push({ name: '', price: '' })">
					<text>+ 添加规格</text>
				</view>
			</view>
			<view class="spec-tip" v-else>
				<text>单品模式，顾客直接按统一价格加购</text>
			</view>
		</view>

		<!-- 招牌开关 -->
		<view class="form-card lz-card">
			<view class="form-item">
				<text class="form-label">招牌推荐</text>
				<view class="hot-switch" :class="{ on: form.is_hot }" @click="form.is_hot = !form.is_hot">
					<view class="hot-dot"></view>
				</view>
			</view>
		</view>

		<!-- 保存按钮 -->
		<view class="btn-save lz-btn-primary" :class="{ 'is-disabled': !canSave }" @click="onSave">
			<text>保存{{ isEdit ? '修改' : '上架' }}</text>
		</view>

		<!-- 分类选择 -->
		<view class="mask" v-if="showCatePicker" @click="showCatePicker = false"></view>
		<view class="picker-sheet" v-if="showCatePicker">
			<view class="picker-head"><text class="picker-title">选择分类</text></view>
			<view class="picker-list">
				<view
					class="picker-item"
					v-for="c in categories"
					:key="c.id"
					:class="{ active: form.category_id === c.id }"
					@click="pickCate(c)"
				>
					<text>{{ c.name }}</text>
					<text class="pick-check" v-if="form.category_id === c.id">✓</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getCategories } from '@/api/customer'
import { addProduct, updateProduct, deleteProduct } from '@/api/manage'

export default {
	data() {
		return {
			isEdit: false,
			originId: null,
			categories: [],
			showCatePicker: false,
			form: {
				id: null,
				name: '',
				category_id: null,
				price: '',
				desc: '',
				image: '',
				spec_type: 'single',
				specs: [],
				is_hot: false,
				status: 1
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
		cateName() {
			const c = this.categories.find(c => c.id === this.form.category_id)
			return c ? c.name : ''
		},
		canSave() {
			return this.form.name && Number(this.form.price) > 0
		}
	},
	async onLoad() {
		// 加载分类
		try {
			this.categories = await getCategories()
		} catch (e) {
			uni.showToast({ title: '加载分类失败', icon: 'none' })
		}
		const payload = uni.getStorageSync('dish_edit_payload')
		uni.removeStorageSync('dish_edit_payload')
		if (payload && payload.mode === 'edit') {
			this.isEdit = true
			const d = payload.dish
			this.originId = d.id
			this.form = {
				id: d.id,
				name: d.name,
				category_id: d.category_id,
				price: String(d.price),
				desc: d.desc || d.description || '',
				image: d.image || '',
				spec_type: d.spec_type || (d.specs && d.specs.length ? 'multi' : 'single'),
				specs: this.parseSpecs(d),
				is_hot: !!d.is_hot,
				status: d.status
			}
		}
	},
	methods: {
		parseSpecs(d) {
			if (d.specs && d.specs.length) {
				return d.specs.map(s => ({ name: s.name || '', price: String(s.price) }))
			}
			if (d.spec_type !== 'multi' || !d.spec_config) return []
			const prices = d.spec_config['价格'] || {}
			return Object.keys(prices).map(k => ({ name: k, price: String(prices[k]) }))
		},
		chooseImg() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				success: (res) => {
					this.form.image = res.tempFilePaths[0]
				}
			})
		},
		pickCate(c) {
			this.form.category_id = c.id
			this.showCatePicker = false
		},
		buildSpecs() {
			if (this.form.spec_type !== 'multi' || !this.form.specs.length) return []
			return this.form.specs
				.filter(s => s.name && Number(s.price) > 0)
				.map((s, i) => ({ name: s.name, value: s.name, price: Number(s.price), sort: i + 1 }))
		},
		async onSave() {
			if (!this.canSave) {
				uni.showToast({ title: '请填写名称和价格', icon: 'none' })
				return
			}
			if (this.form.spec_type === 'multi') {
				const valid = this.form.specs.filter(s => s.name && Number(s.price) > 0)
				if (!valid.length) {
					uni.showToast({ title: '请至少添加一个规格', icon: 'none' })
					return
				}
			}
			const data = {
				name: this.form.name,
				category_id: this.form.category_id,
				price: Number(this.form.price),
				image: this.form.image,
				description: this.form.desc,
				is_hot: this.form.is_hot ? 1 : 0,
				specs: this.buildSpecs()
			}
			try {
				if (this.isEdit) {
					await updateProduct(this.originId, data)
				} else {
					await addProduct(data)
				}
				uni.showToast({ title: '保存成功', icon: 'success', duration: 800 })
				setTimeout(() => uni.navigateBack(), 700)
			} catch (e) {
				uni.showToast({ title: e.message || '保存失败', icon: 'none' })
			}
		},
		onDelete() {
			uni.showModal({
				title: '删除菜品',
				content: `确定删除「${this.form.name}」？此操作不可恢复。`,
				confirmColor: '#9B2D28',
				success: async (res) => {
					if (res.confirm) {
						try {
							await deleteProduct(this.originId)
							uni.showToast({ title: '已删除', icon: 'success', duration: 800 })
							setTimeout(() => uni.navigateBack(), 700)
						} catch (e) {
							uni.showToast({ title: '删除失败', icon: 'none' })
						}
					}
				}
			})
		},
		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background: $lz-paper;
	padding-bottom: calc(60rpx + env(safe-area-inset-bottom));
}

/* 顶栏 */
.nav {
	background: $lz-paper-light;
	border-bottom: 1rpx solid $lz-line;
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	padding: 0 24rpx 24rpx;
	.nav-back {
		width: 60rpx;
		.back-arrow { font-size: 52rpx; color: $lz-ink; line-height: 1; }
	}
	.nav-title { font-size: 36rpx; font-weight: 600; }
	.nav-del { font-size: 26rpx; color: $lz-primary; padding: 8rpx 0; }
}

/* 区块 */
.section {
	padding: 28rpx 32rpx 0;
	.sec-label {
		display: block;
		font-size: 26rpx;
		color: $lz-ink-2;
		margin-bottom: 16rpx;
	}
	.sec-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16rpx;
		.sec-label { margin-bottom: 0; }
	}
}

/* 图片上传 */
.img-uploader {
	width: 100%;
	height: 280rpx;
	border-radius: $lz-radius-card;
	overflow: hidden;
	.img-preview { width: 100%; height: 100%; }
	.img-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, $lz-primary-bg, rgba(184,149,106,0.12));
		border: 2rpx dashed $lz-line;
		border-radius: $lz-radius-card;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		.ph-char { font-family: $lz-font-serif; font-size: 88rpx; color: $lz-primary; opacity: 0.5; }
		.ph-tip { font-size: 24rpx; color: $lz-ink-3; }
	}
}

/* 表单卡片 */
.form-card {
	margin: 24rpx 32rpx 0;
	padding: 4rpx 28rpx;
	.form-item {
		display: flex;
		align-items: center;
		padding: 26rpx 0;
		.form-label {
			width: 140rpx;
			font-size: 30rpx;
			color: $lz-ink;
			flex-shrink: 0;
		}
		.form-input {
			flex: 1;
			font-size: 30rpx;
			color: $lz-ink;
		}
		.form-value {
			flex: 1;
			font-size: 30rpx;
			color: $lz-ink;
			&.ph { color: $lz-ink-3; }
		}
		.form-arrow { font-size: 40rpx; color: $lz-ink-3; }
		.price-sym { font-size: 30rpx; color: $lz-primary; margin-right: 4rpx; }
		.price-input { color: $lz-primary; font-weight: 600; }
		.ph { color: $lz-ink-3; }
	}
	.form-divider { height: 1rpx; background: $lz-line-light; }
}

/* 规格开关 */
.spec-switch {
	display: flex;
	border: 2rpx solid $lz-line;
	border-radius: $lz-radius-pill;
	overflow: hidden;
	.switch-opt {
		padding: 10rpx 28rpx;
		font-size: 24rpx;
		color: $lz-ink-2;
		&.active { background: $lz-primary; color: #fff; }
	}
}

/* 规格列表 */
.spec-list {
	.spec-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 16rpx;
		.spec-name {
			flex: 1;
			height: 80rpx;
			background: $lz-card;
			border: 1rpx solid $lz-line;
			border-radius: $lz-radius-input;
			padding: 0 20rpx;
			font-size: 28rpx;
			color: $lz-ink;
		}
		.spec-sym { font-size: 28rpx; color: $lz-primary; }
		.spec-price {
			width: 160rpx;
			height: 80rpx;
			background: $lz-card;
			border: 1rpx solid $lz-line;
			border-radius: $lz-radius-input;
			padding: 0 20rpx;
			font-size: 28rpx;
			color: $lz-primary;
			font-weight: 600;
		}
		.spec-del {
			width: 56rpx;
			height: 56rpx;
			border-radius: 50%;
			background: $lz-paper;
			border: 1rpx solid $lz-line;
			display: flex;
			align-items: center;
			justify-content: center;
			text { font-size: 32rpx; color: $lz-ink-3; }
		}
	}
	.spec-add {
		text-align: center;
		padding: 20rpx;
		border: 2rpx dashed $lz-line;
		border-radius: $lz-radius-input;
		text { font-size: 26rpx; color: $lz-primary; }
		&:active { background: $lz-primary-bg; }
	}
}
.spec-tip {
	padding: 20rpx;
	text { font-size: 24rpx; color: $lz-ink-3; }
}

/* 招牌开关 */
.hot-switch {
	width: 88rpx;
	height: 48rpx;
	border-radius: 24rpx;
	background: $lz-line;
	position: relative;
	transition: background 0.2s;
	.hot-dot {
		position: absolute;
		top: 4rpx;
		left: 4rpx;
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.15);
		transition: left 0.2s;
	}
	&.on { background: $lz-primary; .hot-dot { left: 44rpx; } }
}

/* 保存 */
.btn-save {
	margin: 48rpx 32rpx 0;
	height: 96rpx;
	line-height: 96rpx;
	font-size: 32rpx;
	letter-spacing: 4rpx;
}

/* 分类选择 */
.mask {
	position: fixed; inset: 0; z-index: 200;
	background: rgba(31,26,23,0.45);
}
.picker-sheet {
	position: fixed; left: 0; right: 0; bottom: 0; z-index: 201;
	background: $lz-card;
	border-radius: 32rpx 32rpx 0 0;
	padding-bottom: env(safe-area-inset-bottom);
	.picker-head {
		padding: 28rpx 32rpx 12rpx;
		.picker-title { font-size: 30rpx; color: $lz-ink; font-weight: 600; }
	}
	.picker-list { padding: 0 32rpx 32rpx; }
	.picker-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 0;
		border-bottom: 1rpx solid $lz-line-light;
		text { font-size: 30rpx; color: $lz-ink; }
		.pick-check { color: $lz-primary; font-size: 32rpx; font-weight: 700; }
		&.active text { color: $lz-primary; font-weight: 600; }
	}
}
</style>
