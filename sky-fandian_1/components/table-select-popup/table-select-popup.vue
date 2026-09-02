<template>
	<view class="popup-mask" v-if="visible" @tap="handleMaskClick">
		<view class="popup-content" @tap.stop>
			<view class="popup-header">
				<text class="title">选择就餐信息</text>
			</view>
			
			<view class="popup-body">
				<view class="table-info">
					<text class="label">桌台号</text>
					<text class="table-no">{{ tableNo }}</text>
				</view>
				
				<view class="people-selector">
					<text class="label">就餐人数</text>
					<view class="stepper-wrap">
						<view class="stepper-btn" @tap="decreasePeople">
							<text class="icon">-</text>
						</view>
						<input 
							class="people-input" 
							type="number" 
							v-model="peopleCount" 
							@input="handleInput"
						/>
						<view class="stepper-btn" @tap="increasePeople">
							<text class="icon">+</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="popup-footer">
				<view class="confirm-btn" @tap="handleConfirm">
					<text>确认</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'TableSelectPopup',
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		tableNo: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			peopleCount: 2,
			minPeople: 1,
			maxPeople: 20
		}
	},
	methods: {
		handleMaskClick() {
			// 点击遮罩层不关闭，强制用户选择
		},
		
		decreasePeople() {
			if (this.peopleCount > this.minPeople) {
				this.peopleCount--
			}
		},
		
		increasePeople() {
			if (this.peopleCount < this.maxPeople) {
				this.peopleCount++
			}
		},
		
		handleInput(e) {
			let value = e.detail.value
			
			// 处理空值
			if (!value || value === '') {
				this.peopleCount = this.minPeople
				return
			}
			
			// 转换为整数
			value = parseInt(value)
			
			// 验证并限制范围
			if (isNaN(value) || value < this.minPeople) {
				this.peopleCount = this.minPeople
			} else if (value > this.maxPeople) {
				this.peopleCount = this.maxPeople
			} else {
				this.peopleCount = value
			}
		},
		
		handleConfirm() {
			// 数据验证
			if (!this.tableNo || this.tableNo.trim() === '') {
				uni.showToast({
					title: '桌台号无效',
					icon: 'none'
				})
				return
			}
			
			if (this.peopleCount < this.minPeople || this.peopleCount > this.maxPeople) {
				uni.showToast({
					title: '人数范围1-20人',
					icon: 'none'
				})
				return
			}
			
			this.$emit('confirm', {
				tableNo: this.tableNo,
				peopleCount: this.peopleCount
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.popup-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
}

.popup-content {
	width: 600rpx;
	background: #fff;
	border-radius: 24rpx;
	overflow: hidden;
	animation: popup-show 0.3s ease;
}

@keyframes popup-show {
	from {
		transform: scale(0.8);
		opacity: 0;
	}
	to {
		transform: scale(1);
		opacity: 1;
	}
}

.popup-header {
	padding: 40rpx 30rpx 30rpx;
	text-align: center;
	border-bottom: 1rpx solid #f0f0f0;
	
	.title {
		font-size: 32rpx;
		color: #333;
		font-weight: bold;
	}
}

.popup-body {
	padding: 40rpx 30rpx;
	
	.table-info {
		margin-bottom: 40rpx;
		text-align: center;
		
		.label {
			display: block;
			font-size: 28rpx;
			color: #666;
			margin-bottom: 16rpx;
		}
		
		.table-no {
			display: block;
			font-size: 56rpx;
			color: #8cd548;
			font-weight: bold;
		}
	}
	
	.people-selector {
		.label {
			display: block;
			font-size: 28rpx;
			color: #666;
			margin-bottom: 20rpx;
			text-align: center;
		}
		
		.stepper-wrap {
			display: flex;
			align-items: center;
			justify-content: center;
			
			.stepper-btn {
				width: 80rpx;
				height: 80rpx;
				background: #f5f5f5;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.icon {
					font-size: 40rpx;
					color: #333;
					font-weight: bold;
				}
				
				&:active {
					background: #e0e0e0;
				}
			}
			
			.people-input {
				width: 120rpx;
				height: 80rpx;
				text-align: center;
				font-size: 40rpx;
				color: #333;
				font-weight: bold;
				margin: 0 30rpx;
			}
		}
	}
}

.popup-footer {
	padding: 0 30rpx 40rpx;
	
	.confirm-btn {
		width: 100%;
		height: 88rpx;
		background: linear-gradient(135deg, #8cd548 0%, #6ab52e 100%);
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 16rpx rgba(140, 213, 72, 0.3);
		
		text {
			font-size: 32rpx;
			color: #fff;
			font-weight: bold;
		}
		
		&:active {
			transform: scale(0.98);
			opacity: 0.9;
		}
	}
}
</style>