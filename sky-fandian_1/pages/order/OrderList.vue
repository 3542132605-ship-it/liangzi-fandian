<template>
    <view class="order-list">
        <view v-for="order in orderList" :key="order.order_no || order.id" class="order-card">
            <view class="order-header">
                <text class="order-no">{{ formatOrderNo(order) }}</text>
                <text class="order-status">{{ order.status_text || '处理中' }}</text>
            </view>

            <view class="product-list">
                <view v-for="item in normalizeProducts(order)" :key="item.id + '-' + item.name" class="product-item">
                    <view class="product-info">
                        <text class="product-name">{{ item.name }}</text>
                        <text v-if="item.specs" class="product-specs">{{ item.specs }}</text>
                    </view>
                    <view class="product-price">
                        <text>¥{{ formatPrice(item.price) }}</text>
                        <text class="product-count">x{{ item.count }}</text>
                    </view>
                </view>
            </view>

            <view class="order-footer">
                <text class="order-type">{{ formatOrderType(order.orderType) }}</text>
                <view class="order-total">
                    <text>合计：</text>
                    <text class="total-price">¥{{ formatPrice(order.total_price || order.totalPrice || order.pay_price) }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: 'OrderList',
    props: {
        orderList: {
            type: Array,
            default: () => []
        },
        currentTab: {
            type: Number,
            default: 0
        }
    },
    methods: {
        formatOrderNo(order) {
            return order.order_no ? `订单号：${order.order_no}` : '订单信息';
        },
        formatPrice(value) {
            const price = Number(value || 0);
            return price.toFixed(2);
        },
        normalizeProducts(order) {
            if (Array.isArray(order.products)) return order.products;
            if (Array.isArray(order.order_products)) return order.order_products;
            if (Array.isArray(order.items)) return order.items;
            return [];
        },
        formatOrderType(type) {
            return type === 'dine-in' ? '堂食' : '外卖';
        }
    }
}
</script>

<style lang="scss" scoped>
.order-list {
    padding: 0 24rpx;
}

.order-card {
    margin-bottom: 24rpx;
    padding: 28rpx;
    background-color: #fff;
    border-radius: 20rpx;
    box-shadow: $shadow-sm;
}

.order-header,
.order-footer,
.product-item,
.product-price {
    display: flex;
    align-items: center;
}

.order-header,
.order-footer {
    justify-content: space-between;
}

.order-no {
    font-size: 26rpx;
    color: $text-color-secondary;
}

.order-status {
    font-size: 26rpx;
    color: $primary-color-dark;
}

.product-list {
    padding: 22rpx 0;
}

.product-item {
    justify-content: space-between;
    padding: 12rpx 0;
}

.product-info {
    flex: 1;
    min-width: 0;
}

.product-name {
    display: block;
    font-size: 30rpx;
    color: $text-color-primary;
}

.product-specs {
    display: block;
    margin-top: 8rpx;
    font-size: 24rpx;
    color: $text-color-hint;
}

.product-price {
    margin-left: 20rpx;
    font-size: 26rpx;
    color: $text-color-secondary;
}

.product-count {
    margin-left: 12rpx;
    color: $text-color-hint;
}

.order-type {
    padding: 6rpx 16rpx;
    font-size: 24rpx;
    color: $primary-color-dark;
    background-color: rgba(140, 213, 72, 0.12);
    border-radius: 999rpx;
}

.order-total {
    font-size: 26rpx;
    color: $text-color-secondary;
}

.total-price {
    font-size: 32rpx;
    font-weight: 600;
    color: $error-color;
}
</style>
