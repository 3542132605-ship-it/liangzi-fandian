<template>
	<view class="login-container">
		<!-- 返回按钮 -->
		<view class="back-button" :style="backButtonStyle" @tap="handleBack">
			<image class="back-icon" src="/static/recharge/d2d56def1b7e4daac7adad19dc740323.png" />
		</view>
		
		<!-- 商家名称标题 -->
		<view class="merchant-name" :style="merchantNameStyle">
			<text>{{merchantInfo.name || '点餐小程序'}}</text>
		</view>
		
		<!-- 商家LOGO -->
		<view class="logo-container">
			<image class="logo-image" :src="merchantInfo.logo || '/static/my/default-avatar.png'" mode="aspectFill" />
		</view>
		
		<!-- 商家名称 -->
		<view class="merchant-title">
			<text>{{merchantInfo.name || '点餐小程序'}}</text>
		</view>
		
		<!-- 会员权益宣传 -->
		<view class="benefit-text">
			<text>成为会员，立享更多优惠福利</text>
		</view>
		
		<!-- 授权说明 -->
		<view class="auth-desc">
			<text>授权绑定手机号 为您提供更好的服务</text>
		</view>
		
		<!-- 登录按钮 -->
		<view class="login-btn-wrap">
			<button class="login-btn" @tap="getPhoneNumber">{{ loginButtonText }}</button>
		</view>
		
		<!-- 用户协议选项 -->
		<view class="agreement-wrap">
			<view class="checkbox" @tap="toggleAgreement">
				<view class="checkbox-inner" :class="{'checked': isAgree}"></view>
			</view>
			<text class="agreement-text">已阅读并同意</text>
			<text class="agreement-link" @tap="viewPrivacyPolicy">《{{merchantInfo.name || '点餐小程序'}}个人信息保护政策》</text>
			<text class="agreement-link" @tap="viewUserAgreement">《{{merchantInfo.name || '点餐小程序'}}用户服务协议》</text>
		</view>
		
		<!-- 暂不登录 -->
		<view class="skip-login" @tap="skipLogin">
			<text>暂不登录</text>
		</view>
	</view>
</template>

<script>
import { customerLogin } from '@/api/customer'

export default {
	data() {
		return {
			isAgree: false,
			merchantInfo: {
				name: '良子饭店',
				logo: ''
			},
			redirectUrl: ''
		}
	},
	computed: {
		loginButtonText() {
			return '微信一键登录'
		},
		// 返回按钮样式 - 根据平台使用不同的适配
		backButtonStyle() {
			// #ifdef MP-WEIXIN
			return this.navCapsuleTop32StyleValue;
			// #endif
			// #ifndef MP-WEIXIN
			return this.navTop32StyleValue;
			// #endif
		},
		// 商家名称标题样式 - 根据平台使用不同的适配
		merchantNameStyle() {
			// #ifdef MP-WEIXIN
			return this.navCapsuleMarginTop80StyleValue;
			// #endif
			// #ifndef MP-WEIXIN
			return this.navMarginTop80StyleValue;
			// #endif
		}
	},
	onLoad(options) {
		this.resolveRedirectUrl(options)
	},
	methods: {
		resolveRedirectUrl(options = {}) {
			if (options.redirect) {
				this.redirectUrl = decodeURIComponent(options.redirect)
				return
			}
			const storedRedirect = uni.getStorageSync('redirect_url')
			if (storedRedirect) {
				this.redirectUrl = storedRedirect
			}
		},

		// 切换协议同意状态
		toggleAgreement() {
			this.isAgree = !this.isAgree
		},

		// 查看隐私政策
		viewPrivacyPolicy() {
			uni.showToast({ title: '暂未开放', icon: 'none' })
		},

		// 查看用户协议
		viewUserAgreement() {
			uni.showToast({ title: '暂未开放', icon: 'none' })
		},

		// 获取手机号 / 登录
		async getPhoneNumber() {
			if (!this.isAgree) {
				uni.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
				return
			}
			try {
				uni.showLoading({ title: '登录中...' })
				const res = await customerLogin({})
				uni.setStorageSync('token', res.token)
				uni.setStorageSync('userId', res.userId)
				uni.setStorageSync('userInfo', { nickName: res.nickname || '微信用户', avatarUrl: '' })
				uni.hideLoading()
				uni.showToast({ title: '登录成功', icon: 'none' })
				this.redirectAfterLogin()
			} catch (e) {
				uni.hideLoading()
				uni.showToast({ title: e.message || '登录失败', icon: 'none' })
			}
		},

		// 跳转到目标页面
		redirectAfterLogin() {
			setTimeout(() => {
				if (this.redirectUrl) {
					uni.redirectTo({
						url: this.redirectUrl,
						fail: () => {
							uni.switchTab({ url: '/pages/my/my' })
						}
					})
					uni.removeStorageSync('redirect_url')
				} else {
					uni.switchTab({ url: '/pages/my/my' })
				}
			}, 1500)
		},

		// 返回上一页
		handleBack() {
			const pages = getCurrentPages()
			if (pages.length <= 1) {
				uni.switchTab({ url: '/pages/home/home' })
			} else {
				uni.navigateBack({ delta: 1 })
			}
		},

		// 暂不登录
		skipLogin() {
			const pages = getCurrentPages()
			if (pages.length <= 1) {
				uni.switchTab({ url: '/pages/home/home' })
			} else {
				uni.navigateBack({ delta: 1 })
			}
		}
	}
}
</script>

<style lang="scss">
.login-container {
	min-height: 100vh;
	background-color: #FFFFFF;
	position: relative;
	padding: 0 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.back-button {
	position: absolute;
	left: 30rpx;
	z-index: 10;
}

.back-icon {
	width: 40rpx;
	height: 40rpx;
}

.merchant-name {
	font-size: 36rpx;
	font-weight: bold;
	text-align: center;
	width: 100%;
	padding: 20rpx 0;
}

.logo-container {
	margin-top: 60rpx;
	margin-bottom: 30rpx;
	display: flex;
	justify-content: center;
}

.logo-image {
	width: 180rpx;
	height: 180rpx;
	border-radius: 50%;
	background-color: #f5f5f5;
}

.merchant-title {
	font-size: 34rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}

.benefit-text {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 80rpx;
}

.auth-desc {
	font-size: 28rpx;
	color: #666666;
	margin-bottom: 40rpx;
}

.login-btn-wrap {
	width: 100%;
	padding: 0 20rpx;
	margin-bottom: 40rpx;
}

.login-btn {
	height: 90rpx;
	line-height: 90rpx;
	background-color: #78c238;
	color: #FFFFFF;
	font-size: 32rpx;
	border-radius: 45rpx;
	font-weight: bold;
}

.agreement-wrap {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	margin-bottom: 60rpx;
	flex-wrap: wrap;
	padding: 0 20rpx;
}

.checkbox {
	width: 32rpx;
	height: 32rpx;
	border: 1px solid #CCCCCC;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 10rpx;
}

.checkbox-inner {
	width: 20rpx;
	height: 20rpx;
	border-radius: 50%;
	background-color: transparent;
	
	&.checked {
		background-color: #78c238;
	}
}

.agreement-text {
	font-size: 26rpx;
	color: #666666;
}

.agreement-link {
	font-size: 26rpx;
	color: #FF0000;
}

.skip-login {
	margin-top: 40rpx;
	padding: 20rpx 40rpx;
}

.skip-login text {
	font-size: 28rpx;
	color: #999999;
}
</style>