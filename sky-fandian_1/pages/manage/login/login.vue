<template>
	<view class="page">
		<!-- 顶栏 -->
		<view class="nav" :style="navStyle">
			<view class="nav-back" @click="goBack">
				<text class="back-arrow">‹</text>
			</view>
		</view>

		<!-- 品牌区 -->
		<view class="brand">
			<view class="brand-seal">
				<text class="seal-char">良</text>
			</view>
			<text class="brand-name lz-title">良子饭店</text>
			<text class="brand-sub">管理后台</text>
		</view>

		<!-- 登录表单 -->
		<view class="form lz-card">
			<view class="form-item">
				<text class="form-label">账号</text>
				<input
					class="form-input"
					v-model="form.username"
					placeholder="请输入员工账号"
					placeholder-class="ph"
					maxlength="20"
				/>
			</view>
			<view class="form-divider"></view>
			<view class="form-item">
				<text class="form-label">密码</text>
				<input
					class="form-input"
					v-model="form.password"
					password
					placeholder="请输入密码"
					placeholder-class="ph"
					maxlength="20"
				/>
			</view>
		</view>

		<view class="btn-login lz-btn-primary" :class="{ 'is-disabled': loading }" @click="handleLogin">
			<text>{{ loading ? '登录中…' : '登 录' }}</text>
		</view>

		<!-- 测试账号提示 -->
		<view class="tip">
			<text class="tip-text">测试账号：admin / admin123</text>
		</view>

		<view class="to-customer" @click="goBack">
			<text>返回顾客端</text>
		</view>
	</view>
</template>

<script>
import { staffLogin } from '@/api/manage'

export default {
	data() {
		return {
			form: { username: '', password: '' },
			loading: false
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
		// 已登录直接进管理端
		const token = uni.getStorageSync('staff_token')
		if (token) {
			uni.reLaunch({ url: '/pages/manage/dine-in/dine-in' })
		}
	},
	methods: {
		async handleLogin() {
			if (this.loading) return
			if (!this.form.username || !this.form.password) {
				uni.showToast({ title: '请输入账号和密码', icon: 'none' })
				return
			}
			this.loading = true
			try {
				const res = await staffLogin({ username: this.form.username, password: this.form.password })
				uni.setStorageSync('staff_token', res.token)
				uni.setStorageSync('staff_info', { staffId: res.staffId, name: res.name, role: res.role })
				uni.showToast({ title: '登录成功', icon: 'success', duration: 1000 })
				setTimeout(() => {
					uni.reLaunch({ url: '/pages/manage/dine-in/dine-in' })
				}, 800)
			} catch (e) {
				this.loading = false
				uni.showToast({ title: e.message || '账号或密码错误', icon: 'none' })
			}
		},
		goBack() {
			uni.switchTab({ url: '/pages/home/home' })
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

.nav {
	.nav-back {
		width: 72rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		.back-arrow {
			font-size: 52rpx;
			color: $lz-ink;
			line-height: 1;
		}
	}
}

.brand {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40rpx 0 64rpx;

	.brand-seal {
		width: 128rpx;
		height: 128rpx;
		border-radius: $lz-radius-card;
		background: $lz-primary;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: $lz-shadow-btn;
		transform: rotate(-3deg);

		.seal-char {
			font-family: $lz-font-serif;
			font-size: 72rpx;
			color: #fff;
			font-weight: 700;
		}
	}
	.brand-name {
		margin-top: 28rpx;
		font-size: 52rpx;
		font-weight: 700;
		letter-spacing: 6rpx;
	}
	.brand-sub {
		margin-top: 10rpx;
		font-size: 26rpx;
		color: $lz-ink-3;
		letter-spacing: 6rpx;
	}
}

.form {
	margin: 0 48rpx;
	padding: 8rpx 32rpx;

	.form-item {
		display: flex;
		align-items: center;
		padding: 28rpx 0;

		.form-label {
			width: 96rpx;
			font-size: 30rpx;
			color: $lz-ink;
			font-weight: 500;
			flex-shrink: 0;
		}
		.form-input {
			flex: 1;
			font-size: 30rpx;
			color: $lz-ink;
		}
		.ph { color: $lz-ink-3; }
	}
	.form-divider {
		height: 1rpx;
		background: $lz-line-light;
	}
}

.btn-login {
	margin: 56rpx 48rpx 0;
	height: 96rpx;
	line-height: 96rpx;
	font-size: 34rpx;
	letter-spacing: 8rpx;
}

.tip {
	margin-top: 32rpx;
	text-align: center;
	.tip-text {
		font-size: 24rpx;
		color: $lz-ink-3;
	}
}

.to-customer {
	margin-top: 48rpx;
	text-align: center;
	text {
		font-size: 24rpx;
		color: $lz-primary;
		text-decoration: underline;
		text-underline-offset: 6rpx;
	}
}
</style>
