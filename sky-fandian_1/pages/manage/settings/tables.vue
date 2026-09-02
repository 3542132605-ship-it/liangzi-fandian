<template>
	<view class="page">
		<view class="nav" :style="navStyle">
			<view class="nav-back" @click="goBack"><text class="back-arrow">‹</text></view>
			<text class="nav-title lz-title">桌台管理</text>
			<text style="width:60rpx;"></text>
		</view>

		<view class="tip-bar">
			<text class="tip-text">长按二维码图片可保存到相册，用于打印张贴</text>
		</view>

		<view class="grid">
			<view class="qr-card lz-card" v-for="t in tables" :key="t.id" @longpress="saveQr(t)">
				<view class="qr-box">
					<view class="qr-grid">
						<view
							class="qr-cell"
							v-for="(cell, i) in qrPattern(t.table_no)"
							:key="i"
							:class="{ dark: cell }"
						></view>
					</view>
					<view class="qr-center">
						<text class="center-no">{{ t.table_no }}</text>
					</view>
				</view>
				<text class="table-label">{{ t.table_no }} 号桌</text>
			</view>
		</view>
		<view style="height:48rpx;"></view>
	</view>
</template>

<script>
import { getTables } from '@/api/manage'

export default {
	data() {
		return { tables: [] }
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
		this.loadTables()
	},
	methods: {
		async loadTables() {
			try {
				this.tables = await getTables()
			} catch (e) {
				uni.showToast({ title: '加载桌台失败', icon: 'none' })
			}
		},
		// 基于桌号生成稳定的伪二维码图案（演示用，真实二维码由后端生成）
		qrPattern(no) {
			const seed = parseInt(no) * 37 + 11
			const arr = []
			for (let i = 0; i < 49; i++) {
				arr.push((Math.sin(seed + i) * 10000) % 1 > 0.5)
			}
			// 四角定位点
			const set = (r, c) => { arr[r * 7 + c] = true }
			const corners = [[0,0],[0,6],[6,0]]
			corners.forEach(([r,c]) => {
				for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
					const rr = r + i, cc = c + j
					if (i === 0 || i === 2 || j === 0 || j === 2 || (i === 1 && j === 1)) set(rr, cc)
					else arr[rr * 7 + cc] = false
				}
			})
			return arr
		},
		saveQr(t) {
			uni.showActionSheet({
				itemList: ['保存二维码到相册'],
				success: () => {
					uni.showToast({ title: `${t.table_no}号桌二维码已保存`, icon: 'success' })
				}
			})
		},
		goBack() { uni.navigateBack() }
	}
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background: $lz-paper;
}
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
.tip-bar {
	margin: 20rpx 32rpx 0;
	padding: 18rpx 24rpx;
	background: $lz-primary-bg;
	border-radius: $lz-radius-card;
	.tip-text { font-size: 24rpx; color: $lz-primary; }
}
.grid {
	padding: 24rpx 32rpx;
	display: flex;
	flex-wrap: wrap;
	gap: 24rpx;
}
.qr-card {
	width: calc((100% - 24rpx) / 2);
	padding: 28rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 18rpx;
	&:active { transform: scale(0.98); }

	.qr-box {
		position: relative;
		width: 240rpx;
		height: 240rpx;
		background: #fff;
		border: 1rpx solid $lz-line;
		border-radius: $lz-radius-img;
		padding: 16rpx;
		.qr-grid {
			width: 100%;
			height: 100%;
			display: grid;
			grid-template-columns: repeat(7, 1fr);
			grid-template-rows: repeat(7, 1fr);
			gap: 2rpx;
		}
		.qr-cell { background: #fff; &.dark { background: $lz-ink; } }
		.qr-center {
			position: absolute;
			top: 50%; left: 50%;
			transform: translate(-50%, -50%);
			width: 56rpx; height: 56rpx;
			background: $lz-primary;
			border-radius: $lz-radius-tag;
			border: 4rpx solid #fff;
			display: flex;
			align-items: center;
			justify-content: center;
			.center-no {
				font-family: $lz-font-serif;
				font-size: 32rpx;
				color: #fff;
				font-weight: 700;
			}
		}
	}
	.table-label {
		font-size: 28rpx;
		color: $lz-ink;
		font-weight: 600;
	}
}
</style>
