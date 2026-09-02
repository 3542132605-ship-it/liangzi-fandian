<template>
  <view class="area-picker">
    <u-popup :show="show" @close="onClose" mode="bottom">
      <view class="area-picker-header">
        <text class="cancel-btn" @tap="onCancel">取消</text>
        <text class="title">{{title}}</text>
        <text class="confirm-btn" @tap="onConfirm">确定</text>
      </view>
      
      <view class="area-picker-body">
        <view class="area-column">
          <scroll-view 
            scroll-y 
            class="area-scroll" 
            :scroll-top="provinceScrollTop"
            :scroll-with-animation="true"
            :id="'province-scroll'"
          >
            <view class="area-loading" v-if="loading && provinces.length === 0">
              <text>加载中...</text>
            </view>
            <view 
              v-for="(item, index) in provinces" 
              :key="item.id"
              :class="['area-item', provinceIndex === index ? 'active' : '']"
              @tap="selectProvince(index)"
              :id="'province-item-' + index"
            >
              {{item.name}}
            </view>
            <view class="area-empty" v-if="!loading && provinces.length === 0">
              <text>暂无数据</text>
            </view>
          </scroll-view>
        </view>
        
        <view class="area-column">
          <scroll-view 
            scroll-y 
            class="area-scroll" 
            :scroll-top="cityScrollTop"
            :scroll-with-animation="true"
            :id="'city-scroll'"
          >
            <view class="area-loading" v-if="loading && cities.length === 0">
              <text>加载中...</text>
            </view>
            <view 
              v-for="(item, index) in cities" 
              :key="item.id"
              :class="['area-item', cityIndex === index ? 'active' : '']"
              @tap="selectCity(index)"
              :id="'city-item-' + index"
            >
              {{item.name}}
            </view>
            <view class="area-empty" v-if="!loading && selectedProvince && cities.length === 0">
              <text>暂无数据</text>
            </view>
          </scroll-view>
        </view>
        
        <view class="area-column">
          <scroll-view 
            scroll-y 
            class="area-scroll" 
            :scroll-top="districtScrollTop"
            :scroll-with-animation="true"
            :id="'district-scroll'"
          >
            <view class="area-loading" v-if="loading && districts.length === 0">
              <text>加载中...</text>
            </view>
            <view 
              v-for="(item, index) in districts" 
              :key="item.id"
              :class="['area-item', districtIndex === index ? 'active' : '']"
              @tap="selectDistrict(index)"
              :id="'district-item-' + index"
            >
              {{item.name}}
            </view>
            <view class="area-empty" v-if="!loading && selectedCity && districts.length === 0">
              <text>暂无数据</text>
            </view>
          </scroll-view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import { getChildrenByPid } from '@/api/area.js';

export default {
  name: 'area-picker',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '选择地区'
    }
  },
  data() {
    return {
      // 存储省市区数据
      provinces: [],
      cities: [],
      districts: [],
      
      // 选中的索引
      provinceIndex: 0,
      cityIndex: 0,
      districtIndex: 0,
      
      // 已选择的值
      selectedProvince: null,
      selectedCity: null,
      selectedDistrict: null,
      
      // 数据加载标志
      loading: false,
      
      // 防抖计时器
      loadTimer: null,
      
      // 错误重试计数
      retryCount: 0,
      maxRetries: 3,
      
      // 滚动位置
      provinceScrollTop: 0,
      cityScrollTop: 0,
      districtScrollTop: 0,
      
      // 项目高度
      itemHeight: 80
    };
  },
  watch: {
    show(val) {
      if (val) {
        // 当组件显示时，强制加载完整的三级数据
        console.log('地区选择器显示，立即初始化数据');
        this.initAreaData().catch(err => {
          console.error('显示时初始化数据失败:', err);
        });
      }
    }
  },
  mounted() {
    console.log('地区选择器组件已挂载');
    // 组件挂载后预加载省级数据
    if (this.provinces.length === 0) {
      // 使用 Promise 捕获可能的错误
      this.preloadProvinceData().catch(err => {
        console.error('挂载时预加载数据失败:', err);
      });
    }
  },
  methods: {
    // 预加载省级数据
    async preloadProvinceData() {
      try {
        console.log('预加载省级数据');
        const res = await getChildrenByPid(0);
        if (res && res.code === 1 && Array.isArray(res.data)) {
          this.provinces = res.data;
          console.log(`预加载完成，获取到${this.provinces.length}个省份`);
        } else {
          console.warn('预加载省份数据格式不正确:', res);
        }
      } catch (error) {
        console.error('预加载省级数据失败:', error);
      }
    },
    async initAreaData() {
      try {
        uni.showLoading({
          title: '加载地区数据...',
          mask: true
        });
        
        console.log('开始初始化省市区数据');
        this.loading = true;
        
        if (this.provinces.length === 0) {
          const provinceRes = await getChildrenByPid(0);
          console.log('获取省份数据结果:', provinceRes);
          
          if (provinceRes.code === 1 && Array.isArray(provinceRes.data) && provinceRes.data.length > 0) {
            this.provinces = provinceRes.data;
          } else {
            console.warn('没有获取到省份数据或数据格式不正确');
            uni.hideLoading();
            return;
          }
        }
        
        if (this.provinces.length > 0) {
          this.provinceIndex = 0;
          this.selectedProvince = this.provinces[0];
          
          const cityRes = await getChildrenByPid(this.selectedProvince.id);
          console.log('获取城市数据结果:', cityRes);
          
          if (cityRes.code === 1 && Array.isArray(cityRes.data) && cityRes.data.length > 0) {
            this.cities = cityRes.data;
            this.cityIndex = 0;
            this.selectedCity = this.cities[0];
            
            const districtRes = await getChildrenByPid(this.selectedCity.id);
            console.log('获取区县数据结果:', districtRes);
            
            if (districtRes.code === 1 && Array.isArray(districtRes.data) && districtRes.data.length > 0) {
              this.districts = districtRes.data;
              this.districtIndex = 0;
              this.selectedDistrict = this.districts[0];
            } else {
              console.warn('没有获取到区县数据或数据格式不正确');
              this.districts = [];
              this.selectedDistrict = null;
            }
          } else {
            console.warn('没有获取到城市数据或数据格式不正确');
            this.cities = [];
            this.selectedCity = null;
            this.districts = [];
            this.selectedDistrict = null;
          }
        }
        
        console.log('省市区数据初始化完成:', {
          provincesCount: this.provinces.length,
          citiesCount: this.cities.length,
          districtsCount: this.districts.length
        });
      } catch (error) {
        console.error('初始化省市区数据失败:', error);
      } finally {
        this.loading = false;
        uni.hideLoading();
      }
    },
    
    // 防抖函数
    debounceLoad(fn, ...args) {
      if (this.loadTimer) {
        clearTimeout(this.loadTimer);
      }
      
      return new Promise((resolve) => {
        this.loadTimer = setTimeout(async () => {
          try {
            const result = await fn.apply(this, args);
            resolve(result);
          } catch (e) {
            console.error('执行加载函数异常:', e);
            resolve(null);
          }
        }, 100);
      });
    },
    
    async loadProvinces() {
      if (this.loading) {
        console.log('正在加载中，跳过此次请求');
        return;
      }
      
      try {
        this.loading = true;
        this.retryCount = 0;
        uni.showLoading({ title: '加载中...' });
        
        console.log('发起获取省份请求');
        const res = await getChildrenByPid(0);
        console.log('省份数据响应:', res);
        
        if (res.code === 1 && Array.isArray(res.data)) {
          this.provinces = res.data;
          
          if (this.provinces.length > 0) {
            console.log(`成功获取${this.provinces.length}个省份数据`);
            this.provinceIndex = 0;
            this.selectedProvince = this.provinces[0];
            
            console.log('选中省份:', this.selectedProvince.name);
            await this.debounceLoad(this.loadCities, this.selectedProvince.id);
          } else {
            console.warn('获取到的省份数据为空');
          }
        } else {
          uni.showToast({
            title: res.msg || '获取省份数据失败',
            icon: 'none'
          });
        }
      } catch (e) {
        console.error('加载省份数据失败:', e);
        
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          console.log(`省份数据加载失败，第${this.retryCount}次重试`);
          setTimeout(() => {
            this.loading = false;
            this.loadProvinces();
          }, 1000);
          return;
        }
        
        uni.showToast({
          title: '加载省份数据失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
        uni.hideLoading();
      }
    },
    
    async loadCities(pid) {
      if (!pid) {
        console.error('加载城市数据失败: 无效的父级ID');
        return;
      }
      
      if (this.loading) {
        console.log('正在加载中，跳过加载城市请求');
        return;
      }
      
      try {
        this.loading = true;
        this.retryCount = 0;
        
        console.log('发起获取城市请求, 父级ID:', pid);
        const res = await getChildrenByPid(pid);
        console.log('城市数据响应:', res);
        
        if (res.code === 1 && Array.isArray(res.data)) {
          this.cities = res.data;
          this.districts = [];
          
          if (this.cities.length > 0) {
            console.log(`成功获取${this.cities.length}个城市数据`);
            this.cityIndex = 0;
            this.selectedCity = this.cities[0];
            
            console.log('选中城市:', this.selectedCity.name);
            await this.debounceLoad(this.loadDistricts, this.selectedCity.id);
          } else {
            this.selectedCity = null;
            this.selectedDistrict = null;
            console.log('该省份下没有城市数据');
          }
        } else {
          this.cities = [];
          this.districts = [];
          this.selectedCity = null;
          this.selectedDistrict = null;
          console.error('获取城市数据失败:', res.msg || '未知错误');
        }
      } catch (e) {
        console.error('加载城市数据失败:', e);
        
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          console.log(`城市数据加载失败，第${this.retryCount}次重试`);
          setTimeout(() => {
            this.loading = false;
            this.loadCities(pid);
          }, 1000);
          return;
        }
        
        this.cities = [];
        this.districts = [];
        this.selectedCity = null;
        this.selectedDistrict = null;
      } finally {
        this.loading = false;
      }
    },
    
    async loadDistricts(pid) {
      if (!pid) {
        console.error('加载区县数据失败: 无效的父级ID');
        return;
      }
      
      if (this.loading) {
        console.log('正在加载中，跳过加载区县请求');
        return;
      }
      
      try {
        this.loading = true;
        this.retryCount = 0;
        
        console.log('发起获取区县请求, 父级ID:', pid);
        const res = await getChildrenByPid(pid);
        console.log('区县数据响应:', res);
        
        if (res.code === 1 && Array.isArray(res.data)) {
          this.districts = res.data;
          
          if (this.districts.length > 0) {
            console.log(`成功获取${this.districts.length}个区县数据`);
            this.districtIndex = 0;
            this.selectedDistrict = this.districts[0];
            console.log('选中区县:', this.selectedDistrict.name);
          } else {
            this.selectedDistrict = null;
            console.log('该城市下没有区县数据');
          }
        } else {
          this.districts = [];
          this.selectedDistrict = null;
          console.error('获取区县数据失败:', res.msg || '未知错误');
        }
      } catch (e) {
        console.error('加载区县数据失败:', e);
        
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          console.log(`区县数据加载失败，第${this.retryCount}次重试`);
          setTimeout(() => {
            this.loading = false;
            this.loadDistricts(pid);
          }, 1000);
          return;
        }
        
        this.districts = [];
        this.selectedDistrict = null;
      } finally {
        this.loading = false;
      }
    },
    
    scrollToIndex(type, index) {
      const scrollTop = index * this.itemHeight;
      
      switch(type) {
        case 'province':
          this.provinceScrollTop = scrollTop;
          break;
        case 'city':
          this.cityScrollTop = scrollTop;
          break;
        case 'district':
          this.districtScrollTop = scrollTop;
          break;
      }
    },
    
    async selectProvince(index) {
      if (index === this.provinceIndex) return;
      
      this.provinceIndex = index;
      this.selectedProvince = this.provinces[index];
      console.log('手动选择省份:', this.selectedProvince.name);
      
      this.scrollToIndex('province', index);
      
      this.cityIndex = 0;
      this.districtIndex = 0;
      this.cityScrollTop = 0;
      this.districtScrollTop = 0;
      this.cities = [];
      this.districts = [];
      
      try {
        this.loading = true;
        
        const cityRes = await getChildrenByPid(this.selectedProvince.id);
        console.log('选择省份后获取城市数据结果:', cityRes);
        
        if (cityRes.code === 1 && Array.isArray(cityRes.data) && cityRes.data.length > 0) {
          this.cities = cityRes.data;
          this.cityIndex = 0;
          this.selectedCity = this.cities[0];
          
          const districtRes = await getChildrenByPid(this.selectedCity.id);
          console.log('选择省份后获取区县数据结果:', districtRes);
          
          if (districtRes.code === 1 && Array.isArray(districtRes.data) && districtRes.data.length > 0) {
            this.districts = districtRes.data;
            this.districtIndex = 0;
            this.selectedDistrict = this.districts[0];
          } else {
            this.districts = [];
            this.selectedDistrict = null;
          }
        } else {
          this.cities = [];
          this.selectedCity = null;
          this.districts = [];
          this.selectedDistrict = null;
        }
      } catch (error) {
        console.error('选择省份加载子级数据失败:', error);
        this.cities = [];
        this.selectedCity = null;
        this.districts = [];
        this.selectedDistrict = null;
      } finally {
        this.loading = false;
      }
    },
    
    async selectCity(index) {
      if (index === this.cityIndex) return;
      
      this.cityIndex = index;
      this.selectedCity = this.cities[index];
      console.log('手动选择城市:', this.selectedCity.name);
      
      this.scrollToIndex('city', index);
      
      this.districtIndex = 0;
      this.districtScrollTop = 0;
      this.districts = [];
      
      try {
        this.loading = true;
        
        const districtRes = await getChildrenByPid(this.selectedCity.id);
        console.log('选择城市后获取区县数据结果:', districtRes);
        
        if (districtRes.code === 1 && Array.isArray(districtRes.data) && districtRes.data.length > 0) {
          this.districts = districtRes.data;
          this.districtIndex = 0;
          this.selectedDistrict = this.districts[0];
        } else {
          this.districts = [];
          this.selectedDistrict = null;
        }
      } catch (error) {
        console.error('选择城市加载区县数据失败:', error);
        this.districts = [];
        this.selectedDistrict = null;
      } finally {
        this.loading = false;
      }
    },
    
    selectDistrict(index) {
      if (index === this.districtIndex) return;
      
      this.districtIndex = index;
      this.selectedDistrict = this.districts[index];
      console.log('手动选择区县:', this.selectedDistrict.name);
      
      this.scrollToIndex('district', index);
    },
    
    onConfirm() {
      const result = {
        province: this.selectedProvince,
        city: this.selectedCity,
        district: this.selectedDistrict
      };
      
      this.$emit('confirm', result);
      this.onClose();
    },
    
    onCancel() {
      this.$emit('cancel');
      this.onClose();
    },
    
    onClose() {
      this.$emit('update:show', false);
    },
    
    // 重置选择器
    async reset() {
      this.provinceIndex = 0;
      this.cityIndex = 0;
      this.districtIndex = 0;
      
      if (this.provinces.length > 0) {
        this.selectedProvince = this.provinces[0];
        try {
          await this.loadCities(this.selectedProvince.id);
        } catch (error) {
          console.error('重置时加载城市数据失败:', error);
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.area-picker {
  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 90rpx;
    padding: 0 30rpx;
    border-bottom: 1px solid #f5f5f5;
    
    .title {
      font-size: 32rpx;
      color: #333;
      font-weight: 500;
    }
    
    .cancel-btn, .confirm-btn {
      font-size: 28rpx;
      padding: 20rpx 0;
    }
    
    .cancel-btn {
      color: #999;
    }
    
    .confirm-btn {
      color: #8cd548;
    }
  }
  
  &-body {
    display: flex;
    height: 500rpx;
    
    .area-column {
      flex: 1;
      height: 100%;
      
      .area-scroll {
        height: 100%;
        
        .area-item {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 80rpx;
          font-size: 28rpx;
          color: #666;
          
          &.active {
            color: #8cd548;
            font-weight: 500;
          }
        }
        
        .area-loading, .area-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 80rpx;
          
          text {
            font-size: 26rpx;
            color: #999;
          }
        }
      }
    }
  }
}
</style> 