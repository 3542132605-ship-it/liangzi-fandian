<template>
	<view class="page">
		<view class="nav" :style="navStyle">
			<view class="nav-back" @click="goBack"><text class="back-arrow">‹</text></view>
			<text class="nav-title lz-title">员工管理</text>
			<text class="nav-add" @click="openAdd">+ 新增</text>
		</view>

		<view class="staff-list">
			<view class="staff-card lz-card" v-for="s in list" :key="s.id">
				<view class="staff-head">
					<view class="avatar" :class="{ disabled: !s.status }">
						<text class="avatar-char">{{ s.name.charAt(0) }}</text>
					</view>
					<view class="staff-info">
						<view class="info-top">
							<text class="staff-name">{{ s.name }}</text>
							<text class="role-tag" :class="{ admin: s.role === 'admin' }">{{ s.role_text }}</text>
						</view>
						<text class="staff-account">账号 {{ s.username }}</text>
					</view>
					<text class="staff-state" :class="{ off: !s.status }">{{ s.status ? '在职' : '停用' }}</text>
				</view>
				<view class="staff-actions" v-if="s.role !== 'admin'">
					<view class="act" @click="resetPwd(s)"><text>重置密码</text></view>
					<view class="act" @click="toggleStatus(s)"><text>{{ s.status ? '停用' : '启用' }}</text></view>
					<view class="act danger" @click="removeStaff(s)"><text>删除</text></view>
				</view>
				<view class="admin-tip" v-else>
					<text>管理员账号不可删除</text>
				</view>
			</view>
		</view>

		<view style="height:48rpx;"></view>

		<!-- 新增弹窗 -->
		<view class="mask" v-if="addBox" @click="addBox = false"></view>
		<view class="sheet" v-if="addBox">
			<view class="sheet-head">
				<text class="sheet-title lz-title">新增员工</text>
				<text class="sheet-close" @click="addBox = false">×</text>
			</view>
			<view class="sheet-form">
				<view class="s-item">
					<text class="s-label">姓名</text>
					<input class="s-input" v-model="addForm.name" placeholder="如：王姐" placeholder-class="ph" maxlength="6" />
				</view>
				<view class="s-item">
					<text class="s-label">账号</text>
					<input class="s-input" v-model="addForm.username" placeholder="登录用英文账号" placeholder-class="ph" maxlength="16" />
				</view>
				<view class="s-item">
					<text class="s-label">初始密码</text>
					<input class="s-input" v-model="addForm.password" placeholder="默认 123456" placeholder-class="ph" maxlength="20" />
				</view>
				<view class="s-item">
					<text class="s-label">角色</text>
					<view class="role-pick">
						<text class="role-opt" :class="{ active: addForm.role === 'waiter' }" @click="addForm.role = 'waiter'">服务员</text>
						<text class="role-opt" :class="{ active: addForm.role === 'courier' }" @click="addForm.role = 'courier'">配送员</text>
					</view>
				</view>
			</view>
			<view class="sheet-btn lz-btn-primary" @click="confirmAdd"><text>确认新增</text></view>
		</view>
	</view>
</template>

<script>
import { getStaffList, addStaff, updateStaff, deleteStaff, resetStaffPassword } from '@/api/manage'

const roleTextMap = { admin: '管理员', waiter: '服务员', courier: '配送员' }

export default {
	data() {
		return {
			list: [],
			addBox: false,
			addForm: { name: '', username: '', password: '123456', role: 'waiter' }
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
		this.loadStaff()
	},
	methods: {
		async loadStaff() {
			try {
				const list = await getStaffList()
				this.list = list.map(s => ({
					...s,
					role_text: roleTextMap[s.role] || s.role
				}))
			} catch (e) {
				uni.showToast({ title: '加载员工列表失败', icon: 'none' })
			}
		},
		openAdd() {
			this.addForm = { name: '', username: '', password: '123456', role: 'waiter' }
			this.addBox = true
		},
		async confirmAdd() {
			if (!this.addForm.name || !this.addForm.username) {
				uni.showToast({ title: '请填写姓名和账号', icon: 'none' }); return
			}
			try {
				await addStaff(this.addForm)
				this.addBox = false
				uni.showToast({ title: '已新增', icon: 'success' })
				await this.loadStaff()
			} catch (e) {
				uni.showToast({ title: e.message || '新增失败', icon: 'none' })
			}
		},
		resetPwd(s) {
			uni.showModal({
				title: '重置密码',
				content: `将「${s.name}」的密码重置为 123456？`,
				success: async (res) => {
					if (res.confirm) {
						try {
							await resetStaffPassword(s.id, '123456')
							uni.showToast({ title: '密码已重置', icon: 'success' })
						} catch (e) {
							uni.showToast({ title: '重置失败', icon: 'none' })
						}
					}
				}
			})
		},
		async toggleStatus(s) {
			const newStatus = s.status ? 0 : 1
			try {
				await updateStaff(s.id, { status: newStatus })
				s.status = newStatus
				uni.showToast({ title: newStatus ? '已启用' : '已停用', icon: 'none' })
			} catch (e) {
				uni.showToast({ title: '操作失败', icon: 'none' })
			}
		},
		removeStaff(s) {
			uni.showModal({
				title: '删除员工',
				content: `确定删除「${s.name}」？此操作不可恢复。`,
				confirmColor: '#9B2D28',
				success: async (res) => {
					if (res.confirm) {
						try {
							await deleteStaff(s.id)
							const i = this.list.findIndex(x => x.id === s.id)
							if (i > -1) this.list.splice(i, 1)
							uni.showToast({ title: '已删除', icon: 'none' })
						} catch (e) {
							uni.showToast({ title: '删除失败', icon: 'none' })
						}
					}
				}
			})
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
	.nav-add { font-size: 28rpx; color: $lz-primary; font-weight: 500; padding: 8rpx 0; }
}
.staff-list { padding: 24rpx 32rpx 0; display: flex; flex-direction: column; gap: 20rpx; }
.staff-card {
	padding: 28rpx;
	.staff-head {
		display: flex;
		align-items: center;
		gap: 20rpx;
		.avatar {
			width: 80rpx; height: 80rpx;
			border-radius: $lz-radius-card;
			background: $lz-primary;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			.avatar-char { font-family: $lz-font-serif; font-size: 40rpx; color: #fff; font-weight: 700; }
			&.disabled { background: $lz-disabled; }
		}
		.staff-info {
			flex: 1;
			.info-top {
				display: flex;
				align-items: center;
				gap: 12rpx;
				.staff-name { font-size: 30rpx; color: $lz-ink; font-weight: 600; }
				.role-tag {
					padding: 2rpx 12rpx;
					border-radius: $lz-radius-tag;
					background: rgba(184,149,106,0.14);
					color: $lz-gold;
					font-size: 20rpx;
					&.admin { background: $lz-primary-bg; color: $lz-primary; }
				}
			}
			.staff-account { margin-top: 6rpx; font-size: 24rpx; color: $lz-ink-3; }
		}
		.staff-state {
			font-size: 24rpx;
			color: $lz-success;
			&.off { color: $lz-ink-3; }
		}
	}
	.staff-actions {
		margin-top: 20rpx;
		border-top: 1rpx solid $lz-line-light;
		padding-top: 20rpx;
		display: flex;
		justify-content: flex-end;
		gap: 16rpx;
		.act {
			padding: 12rpx 28rpx;
			border-radius: $lz-radius-pill;
			border: 1rpx solid $lz-line;
			text { font-size: 24rpx; color: $lz-ink-2; }
			&:active { background: $lz-paper; }
			&.danger { border-color: $lz-primary; text { color: $lz-primary; } }
		}
	}
	.admin-tip {
		margin-top: 20rpx;
		border-top: 1rpx solid $lz-line-light;
		padding-top: 20rpx;
		text-align: right;
		text { font-size: 22rpx; color: $lz-ink-3; }
	}
}

/* 弹窗 */
.mask { position: fixed; inset: 0; z-index: 200; background: rgba(31,26,23,0.45); }
.sheet {
	position: fixed; left: 0; right: 0; bottom: 0; z-index: 201;
	background: $lz-card;
	border-radius: 32rpx 32rpx 0 0;
	padding-bottom: env(safe-area-inset-bottom);
	.sheet-head {
		display: flex; align-items: center; justify-content: space-between;
		padding: 28rpx 32rpx 16rpx;
		.sheet-title { font-size: 32rpx; font-weight: 600; }
		.sheet-close { font-size: 44rpx; color: $lz-ink-3; line-height: 1; }
	}
	.sheet-form { padding: 8rpx 32rpx 24rpx; }
	.s-item {
		display: flex; align-items: center;
		padding: 24rpx 0;
		border-bottom: 1rpx solid $lz-line-light;
		.s-label { width: 160rpx; font-size: 28rpx; color: $lz-ink; flex-shrink: 0; }
		.s-input { flex: 1; font-size: 28rpx; color: $lz-ink; }
		.role-pick { display: flex; gap: 16rpx; }
		.role-opt {
			padding: 10rpx 28rpx;
			border-radius: $lz-radius-pill;
			border: 1rpx solid $lz-line;
			font-size: 24rpx; color: $lz-ink-2;
			&.active { background: $lz-primary; border-color: $lz-primary; color: #fff; }
		}
	}
	.sheet-btn { margin: 8rpx 32rpx 32rpx; height: 92rpx; line-height: 92rpx; }
}
</style>
