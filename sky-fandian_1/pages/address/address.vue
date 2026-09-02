<template>
	<view class="page">
		<!-- 导航 -->
		<view class="nav" :style="navStyle">
			<view class="nav-back" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="nav-title lz-title">收货地址</text>
			<view class="nav-add" @click="openAdd">
				<text>新增</text>
			</view>
		</view>

		<scroll-view scroll-y class="list">
			<view v-if="addressList.length === 0" class="empty">
				<text class="empty-char">无</text>
				<text class="empty-text">尚未添加收货地址</text>
				<view class="empty-btn" @click="openAdd"><text>新增地址</text></view>
			</view>

			<view
				class="addr-card lz-card"
				v-for="addr in addressList"
				:key="addr.id"
				@click="selectAddr(addr)"
			>
				<view class="addr-top">
					<view class="addr-user">
						<text class="addr-name">{{ addr.name }}</text>
						<text class="addr-phone">{{ addr.phone }}</text>
					</view>
					<text class="default-tag" v-if="addr.is_default">默认</text>
				</view>
				<text class="addr-detail">{{ addr.detail }}</text>
				<view class="addr-actions" @click.stop>
					<text class="act-btn" @click="openEdit(addr)">编辑</text>
					<text class="act-btn act-del" @click="delAddr(addr)">删除</text>
					<text class="act-btn" v-if="!addr.is_default" @click="setDefault(addr)">设为默认</text>
				</view>
			</view>

			<view style="height: 40rpx;"></view>
		</scroll-view>

		<!-- 新增/编辑弹窗 -->
		<view class="edit-mask" v-if="editing" @click="closeEdit">
			<view class="edit-content" @click.stop>
				<view class="edit-head">
					<text class="edit-title lz-title">{{ editForm.id ? '编辑地址' : '新增地址' }}</text>
					<view class="edit-close" @click="closeEdit"><text>×</text></view>
				</view>
				<view class="form">
					<view class="form-row">
						<text class="form-label">姓名</text>
						<input class="form-input" v-model="editForm.name" placeholder="收货人姓名" placeholder-class="ph" />
					</view>
					<view class="form-row">
						<text class="form-label">电话</text>
						<input class="form-input" v-model="editForm.phone" type="number" maxlength="11" placeholder="手机号码" placeholder-class="ph" />
					</view>
					<view class="form-row">
						<text class="form-label">详细地址</text>
						<textarea class="form-textarea" v-model="editForm.detail" placeholder="小区/楼栋/门牌号" placeholder-class="ph" maxlength="80" />
					</view>
					<view class="form-row form-switch">
						<text class="form-label">设为默认地址</text>
						<view class="switch" :class="{'on': editForm.is_default}" @click="editForm.is_default = !editForm.is_default">
							<view class="switch-dot"></view>
						</view>
					</view>
				</view>
				<view class="edit-foot">
					<view class="btn-ghost" @click="closeEdit"><text>取消</text></view>
					<view class="btn-primary" @click="saveAddr"><text>保存</text></view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getAddresses, addAddress, updateAddress, deleteAddress } from '@/api/customer'

export default {
	data() {
		return {
			from: '',
			addressList: [],
			editing: false,
			editForm: { id: '', name: '', phone: '', detail: '', is_default: false }
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
	onLoad(options) {
		this.from = options && options.from ? options.from : ''
		this.loadList()
	},
	onShow() {
		this.loadList()
	},
	methods: {
		goBack() { uni.navigateBack() },
		async loadList() {
			try {
				this.addressList = await getAddresses()
			} catch (e) {
				console.error('加载地址失败:', e)
				this.addressList = []
			}
		},
		selectAddr(addr) {
			if (this.from === 'submit') {
				uni.setStorageSync('selectedAddress', addr)
				uni.navigateBack()
			}
		},
		openAdd() {
			this.editForm = { id: '', name: '', phone: '', detail: '', is_default: this.addressList.length === 0 }
			this.editing = true
		},
		openEdit(addr) {
			this.editForm = { ...addr }
			this.editing = true
		},
		closeEdit() { this.editing = false },
		async saveAddr() {
			const f = this.editForm
			if (!f.name.trim()) { uni.showToast({ title: '请填写姓名', icon: 'none' }); return }
			if (!/^1\d{10}$/.test(f.phone)) { uni.showToast({ title: '手机号有误', icon: 'none' }); return }
			if (!f.detail.trim()) { uni.showToast({ title: '请填写详细地址', icon: 'none' }); return }

			try {
				const data = {
					name: f.name,
					phone: f.phone,
					detail: f.detail,
					is_default: f.is_default ? 1 : 0
				}
				if (f.id) {
					await updateAddress(f.id, data)
				} else {
					await addAddress(data)
				}
				this.closeEdit()
				await this.loadList()
				uni.showToast({ title: '已保存', icon: 'none' })
			} catch (e) {
				uni.showToast({ title: e.message || '保存失败', icon: 'none' })
			}
		},
		delAddr(addr) {
			uni.showModal({
				title: '删除地址',
				content: `删除 ${addr.name} 的地址？`,
				confirmColor: '#9B2D28',
				success: async (r) => {
					if (r.confirm) {
						try {
							await deleteAddress(addr.id)
							await this.loadList()
							uni.showToast({ title: '已删除', icon: 'none' })
						} catch (e) {
							uni.showToast({ title: e.message || '删除失败', icon: 'none' })
						}
					}
				}
			})
		},
		async setDefault(addr) {
			try {
				await updateAddress(addr.id, { is_default: 1 })
				await this.loadList()
				uni.showToast({ title: '已设为默认', icon: 'none' })
			} catch (e) {
				uni.showToast({ title: e.message || '设置失败', icon: 'none' })
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background: $lz-paper;
	display: flex;
	flex-direction: column;
}

.nav {
	display: flex;
	align-items: center;
	padding: 0 24rpx;
	height: 88rpx;
	background: $lz-paper-light;
	border-bottom: 1rpx solid $lz-line;
	position: relative;

	.nav-back {
		width: 64rpx; height: 64rpx;
		display: flex; align-items: center; justify-content: center;
		.back-icon { font-size: 56rpx; color: $lz-ink; line-height: 1; }
	}
	.nav-title {
		position: absolute; left: 50%; transform: translateX(-50%);
		font-size: 32rpx; color: $lz-ink; font-weight: 600;
	}
	.nav-add {
		position: absolute; right: 24rpx;
		text { font-size: 28rpx; color: $lz-primary; }
	}
}

.list {
	flex: 1;
	padding: 24rpx 32rpx;
}

.empty {
	padding: 120rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;

	.empty-char { font-family: $lz-font-serif; font-size: 96rpx; color: $lz-ink-3; opacity: 0.25; }
	.empty-text { font-size: 28rpx; color: $lz-ink-3; }
	.empty-btn {
		margin-top: 16rpx;
		padding: 20rpx 56rpx;
		background: $lz-primary;
		border-radius: $lz-radius-pill;
		text { color: #fff; font-size: 28rpx; }
		&:active { transform: scale(0.97); }
	}
}

.addr-card {
	padding: 28rpx;
	margin-bottom: 20rpx;

	.addr-top {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.addr-user {
			display: flex;
			align-items: baseline;
			gap: 20rpx;
			.addr-name { font-size: 32rpx; color: $lz-ink; font-weight: 600; }
			.addr-phone { font-size: 26rpx; color: $lz-ink-2; }
		}
		.default-tag {
			font-size: 20rpx;
			color: $lz-primary;
			border: 1rpx solid $lz-primary;
			padding: 2rpx 12rpx;
			border-radius: $lz-radius-tag;
		}
	}
	.addr-detail {
		display: block;
		margin-top: 14rpx;
		font-size: 26rpx;
		color: $lz-ink-2;
		line-height: 1.5;
	}
	.addr-actions {
		display: flex;
		align-items: center;
		gap: 28rpx;
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid $lz-line-light;

		.act-btn {
			font-size: 24rpx;
			color: $lz-ink-2;
			&.act-del { color: $lz-warn; }
			&:active { opacity: 0.6; }
		}
	}
}

/* 编辑弹窗 */
.edit-mask {
	position: fixed;
	inset: 0;
	background: rgba(31, 26, 23, 0.55);
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 48rpx;
	animation: fadeIn 0.2s;
}

.edit-content {
	width: 100%;
	background: $lz-card;
	border-radius: $lz-radius-card;
	padding: 32rpx;
	animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);

	.edit-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;

		.edit-title { font-size: 32rpx; color: $lz-ink; font-weight: 600; }
		.edit-close {
			width: 56rpx; height: 56rpx; border-radius: 50%;
			background: $lz-paper;
			display: flex; align-items: center; justify-content: center;
			text { font-size: 36rpx; color: $lz-ink-2; line-height: 1; }
		}
	}

	.form {
		.form-row {
			display: flex;
			flex-direction: column;
			gap: 12rpx;
			margin-bottom: 24rpx;

			.form-label { font-size: 24rpx; color: $lz-ink-3; }
			.form-input {
				height: 80rpx;
				padding: 0 20rpx;
				background: $lz-paper;
				border: 1rpx solid $lz-line;
				border-radius: $lz-radius-input;
				font-size: 28rpx;
				color: $lz-ink;
			}
			.form-textarea {
				min-height: 120rpx;
				padding: 16rpx 20rpx;
				background: $lz-paper;
				border: 1rpx solid $lz-line;
				border-radius: $lz-radius-input;
				font-size: 28rpx;
				color: $lz-ink;
				box-sizing: border-box;
				width: 100%;
			}
			.ph { color: $lz-ink-3; }

			&.form-switch {
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
				.form-label { font-size: 28rpx; color: $lz-ink; }
			}
		}
	}

	.switch {
		width: 80rpx; height: 44rpx;
		border-radius: $lz-radius-pill;
		background: $lz-line;
		position: relative;
		transition: background 0.2s;
		.switch-dot {
			position: absolute;
			top: 4rpx; left: 4rpx;
			width: 36rpx; height: 36rpx;
			border-radius: 50%;
			background: #fff;
			box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.15);
			transition: left 0.2s;
		}
		&.on {
			background: $lz-primary;
			.switch-dot { left: 40rpx; }
		}
	}

	.edit-foot {
		display: flex;
		gap: 20rpx;
		margin-top: 8rpx;

		.btn-ghost {
			flex: 1;
			height: 80rpx;
			border: 2rpx solid $lz-line;
			border-radius: $lz-radius-pill;
			display: flex; align-items: center; justify-content: center;
			text { font-size: 28rpx; color: $lz-ink-2; }
			&:active { background: $lz-paper; }
		}
		.btn-primary {
			flex: 1;
			height: 80rpx;
			background: $lz-primary;
			border-radius: $lz-radius-pill;
			display: flex; align-items: center; justify-content: center;
			text { font-size: 28rpx; color: #fff; font-weight: 600; }
			&:active { background: $lz-primary-dark; transform: scale(0.97); }
		}
	}
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
