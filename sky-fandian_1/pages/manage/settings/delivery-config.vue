<template>
	<view class="page">
		<view class="nav" :style="navStyle">
			<view class="nav-back" @click="goBack"><text class="back-arrow">‹</text></view>
			<text class="nav-title lz-title">配送设置</text>
			<text style="width:60rpx;"></text>
		</view>

		<view class="form-card lz-card">
			<view class="form-item">
				<view class="item-label">
					<text class="label-title">起送价</text>
					<text class="label-desc">订单商品小计需满此金额方可下单</text>
				</view>
				<view class="item-input">
					<text class="sym">¥</text>
					<input class="ipt" v-model="form.minPrice" type="digit" placeholder="0" placeholder-class="ph" />
				</view>
			</view>
		</view>

		<view class="tips">
			<text class="tips-title">说明</text>
			<text class="tips-line">· 外卖免配送费，顾客无需支付配送费用</text>
			<text class="tips-line">· 堂食订单不受起送价影响</text>
			<text class="tips-line">· 顾客端下单时会校验起送价，不满足则置灰</text>
		</view>

		<view class="btn-save lz-btn-primary" @click="onSave"><text>保存设置</text></view>

		<view style="height:60rpx;"></view>
	</view>
</template>

<script>
import { getDeliveryConfig, updateDeliveryConfig } from '@/api/manage'

export default {
	data() {
		return {
			form: { minPrice: '' }
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
		}
	},
	onLoad() {
		this.loadConfig()
	},
	methods: {
		async loadConfig() {
			try {
				const res = await getDeliveryConfig()
				this.form.minPrice = String(res.delivery_min_price || '0')
			} catch (e) {
				uni.showToast({ title: '加载配置失败', icon: 'none' })
			}
		},
		async onSave() {
			const min = Number(this.form.minPrice)
			if (isNaN(min) || min < 0) { uni.showToast({ title: '起送价无效', icon: 'none' }); return }
			try {
				await updateDeliveryConfig({ delivery_min_price: min })
				uni.showToast({ title: '保存成功', icon: 'success' })
				setTimeout(() => uni.navigateBack(), 800)
			} catch (e) {
				uni.showToast({ title: '保存失败', icon: 'none' })
			}
		},
		goBack() { uni.navigateBack() }
	}
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: $lz-paper; }
.nav {
	background: $lz-paper-light;
	border-bottom: 1rpx solid $lz-line;
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	padding: 0 24rpx 24rpx;
	.nav-back { width: 60rpx; .back-arrow { font-size: 52rpx; color: $lz-ink; line-height: 1; } }
	.nav-title { font-size: 36rpx; font-weight: 600; }
}
.form-card {
	margin: 24rpx 32rpx 0;
	padding: 0 28rpx;
	.form-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 0;
		.item-label {
			flex: 1;
			.label-title { display: block; font-size: 30rpx; color: $lz-ink; font-weight: 600; }
			.label-desc { display: block; margin-top: 6rpx; font-size: 22rpx; color: $lz-ink-3; }
		}
		.item-input {
			display: flex;
			align-items: center;
			gap: 4rpx;
			.sym { font-size: 30rpx; color: $lz-primary; }
			.ipt {
				width: 140rpx;
				text-align: right;
				font-size: 36rpx;
				color: $lz-primary;
				font-weight: 700;
			}
		}
	}
	.form-divider { height: 1rpx; background: $lz-line-light; }
}
.tips {
	margin: 28rpx 32rpx 0;
	padding: 24rpx 28rpx;
	background: $lz-paper-light;
	border-radius: $lz-radius-card;
	border: 1rpx solid $lz-line;
	.tips-title { display: block; font-size: 26rpx; color: $lz-ink-2; font-weight: 600; margin-bottom: 12rpx; }
	.tips-line { display: block; font-size: 24rpx; color: $lz-ink-3; line-height: 1.9; }
}
.btn-save {
	margin: 48rpx 32rpx 0;
	height: 96rpx;
	line-height: 96rpx;
	font-size: 32rpx;
}
</style>
