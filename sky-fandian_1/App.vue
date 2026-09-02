<script>
  export default {
    onLaunch: function () {
      console.log('App Launch - 良子饭店 v1.0');
    },
    onShow: function () {
      console.log('App Show');
    },
    onHide: function () {
      console.log('App Hide');
    }
  };
</script>

<style lang="scss">
    /* 引入uView基础样式 */
    @import 'uview-ui/index.scss';
    /* 良子饭店中式雅致主题 */
    @import './styles/theme.scss';
    
    /************************************************************
  ** 请将全局样式拷贝到项目的全局 CSS 文件或者当前页面的顶部 **
  ** 否则页面将无法正常显示                                  **
  ************************************************************/

  html {
    font-size: 16px;
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
      'Droid Sans', 'Helvetica Neue', 'Microsoft Yahei', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  view,
  image,
  text {
    box-sizing: border-box;
    flex-shrink: 0;
  }

  #app {
    width: 100vw;
    height: 100vh;
  }

  .wp_-flex-row {
    display: flex;
    flex-direction: row;
  }

  .wp_-flex-col {
    display: flex;
    flex-direction: column;
  }

  .wp_-justify-start {
    justify-content: flex-start;
  }

  .wp_-justify-end {
    justify-content: flex-end;
  }

  .wp_-justify-center {
    justify-content: center;
  }

  .wp_-justify-between {
    justify-content: space-between;
  }

  .wp_-justify-around {
    justify-content: space-around;
  }

  .wp_-justify-evenly {
    justify-content: space-evenly;
  }

  .wp_-items-start {
    align-items: flex-start;
  }

  .wp_-items-end {
    align-items: flex-end;
  }

  .wp_-items-center {
    align-items: center;
  }

  .wp_-items-baseline {
    align-items: baseline;
  }

  .wp_-items-stretch {
    align-items: stretch;
  }

  .wp_-self-start {
    align-self: flex-start;
  }

  .wp_-self-end {
    align-self: flex-end;
  }

  .wp_-self-center {
    align-self: center;
  }

  .wp_-self-baseline {
    align-self: baseline;
  }

  .wp_-self-stretch {
    align-self: stretch;
  }

  .wp_-flex-1 {
    flex: 1 1 0%;
  }

  .wp_-flex-auto {
    flex: 1 1 auto;
  }

  .wp_-grow {
    flex-grow: 1;
  }

  .wp_-grow-0 {
    flex-grow: 0;
  }

  .wp_-shrink {
    flex-shrink: 1;
  }

  .wp_-shrink-0 {
    flex-shrink: 0;
  }

  .wp_-relative {
    position: relative;
  }

  .wp_-ml-2 {
    margin-left: 4rpx;
  }

  .wp_-mt-2 {
    margin-top: 4rpx;
  }

  .wp_-ml-4 {
    margin-left: 8rpx;
  }

  .wp_-mt-4 {
    margin-top: 8rpx;
  }

  .wp_-ml-6 {
    margin-left: 12rpx;
  }

  .wp_-mt-6 {
    margin-top: 12rpx;
  }

  .wp_-ml-8 {
    margin-left: 16rpx;
  }

  .wp_-mt-8 {
    margin-top: 16rpx;
  }

  .wp_-ml-10 {
    margin-left: 20rpx;
  }

  .wp_-mt-10 {
    margin-top: 20rpx;
  }

  .wp_-ml-12 {
    margin-left: 24rpx;
  }

  .wp_-mt-12 {
    margin-top: 24rpx;
  }

  .wp_-ml-14 {
    margin-left: 28rpx;
  }

  .wp_-mt-14 {
    margin-top: 28rpx;
  }

  .wp_-ml-16 {
    margin-left: 32rpx;
  }

  .wp_-mt-16 {
    margin-top: 32rpx;
  }

  .wp_-ml-18 {
    margin-left: 36rpx;
  }

  .wp_-mt-18 {
    margin-top: 36rpx;
  }

  .wp_-ml-20 {
    margin-left: 40rpx;
  }

  .wp_-mt-20 {
    margin-top: 40rpx;
  }

  .wp_-ml-22 {
    margin-left: 44rpx;
  }

  .wp_-mt-22 {
    margin-top: 44rpx;
  }

  .wp_-ml-24 {
    margin-left: 48rpx;
  }

  .wp_-mt-24 {
    margin-top: 48rpx;
  }

  .wp_-ml-26 {
    margin-left: 52rpx;
  }

  .wp_-mt-26 {
    margin-top: 52rpx;
  }

  .wp_-ml-28 {
    margin-left: 56rpx;
  }

  .wp_-mt-28 {
    margin-top: 56rpx;
  }

  .wp_-ml-30 {
    margin-left: 60rpx;
  }

  .wp_-mt-30 {
    margin-top: 60rpx;
  }

  .wp_-ml-32 {
    margin-left: 64rpx;
  }

  .wp_-mt-32 {
    margin-top: 64rpx;
  }

  .wp_-ml-34 {
    margin-left: 68rpx;
  }

  .wp_-mt-34 {
    margin-top: 68rpx;
  }

  .wp_-ml-36 {
    margin-left: 72rpx;
  }

  .wp_-mt-36 {
    margin-top: 72rpx;
  }

  .wp_-ml-38 {
    margin-left: 76rpx;
  }

  .wp_-mt-38 {
    margin-top: 76rpx;
  }

  .wp_-ml-40 {
    margin-left: 80rpx;
  }

  .wp_-mt-40 {
    margin-top: 80rpx;
  }

  .wp_-ml-42 {
    margin-left: 84rpx;
  }

  .wp_-mt-42 {
    margin-top: 84rpx;
  }

  .wp_-ml-44 {
    margin-left: 88rpx;
  }

  .wp_-mt-44 {
    margin-top: 88rpx;
  }

  .wp_-ml-46 {
    margin-left: 92rpx;
  }

  .wp_-mt-46 {
    margin-top: 92rpx;
  }

  .wp_-ml-48 {
    margin-left: 96rpx;
  }

  .wp_-mt-48 {
    margin-top: 96rpx;
  }

  .wp_-ml-50 {
    margin-left: 100rpx;
  }

  .wp_-mt-50 {
    margin-top: 100rpx;
  }

  .wp_-ml-52 {
    margin-left: 104rpx;
  }

  .wp_-mt-52 {
    margin-top: 104rpx;
  }

  .wp_-ml-54 {
    margin-left: 108rpx;
  }

  .wp_-mt-54 {
    margin-top: 108rpx;
  }

  .wp_-ml-56 {
    margin-left: 112rpx;
  }

  .wp_-mt-56 {
    margin-top: 112rpx;
  }

  .wp_-ml-58 {
    margin-left: 116rpx;
  }

  .wp_-mt-58 {
    margin-top: 116rpx;
  }

  .wp_-ml-60 {
    margin-left: 120rpx;
  }

  .wp_-mt-60 {
    margin-top: 120rpx;
  }

  .wp_-ml-62 {
    margin-left: 124rpx;
  }

  .wp_-mt-62 {
    margin-top: 124rpx;
  }

  .wp_-ml-64 {
    margin-left: 128rpx;
  }

  .wp_-mt-64 {
    margin-top: 128rpx;
  }

  .wp_-ml-66 {
    margin-left: 132rpx;
  }

  .wp_-mt-66 {
    margin-top: 132rpx;
  }

  .wp_-ml-68 {
    margin-left: 136rpx;
  }

  .wp_-mt-68 {
    margin-top: 136rpx;
  }

  .wp_-ml-70 {
    margin-left: 140rpx;
  }

  .wp_-mt-70 {
    margin-top: 140rpx;
  }

  .wp_-ml-72 {
    margin-left: 144rpx;
  }

  .wp_-mt-72 {
    margin-top: 144rpx;
  }

  .wp_-ml-74 {
    margin-left: 148rpx;
  }

  .wp_-mt-74 {
    margin-top: 148rpx;
  }

  .wp_-ml-76 {
    margin-left: 152rpx;
  }

  .wp_-mt-76 {
    margin-top: 152rpx;
  }

  .wp_-ml-78 {
    margin-left: 156rpx;
  }

  .wp_-mt-78 {
    margin-top: 156rpx;
  }

  .wp_-ml-80 {
    margin-left: 160rpx;
  }

  .wp_-mt-80 {
    margin-top: 160rpx;
  }

  .wp_-ml-82 {
    margin-left: 164rpx;
  }

  .wp_-mt-82 {
    margin-top: 164rpx;
  }

  .wp_-ml-84 {
    margin-left: 168rpx;
  }

  .wp_-mt-84 {
    margin-top: 168rpx;
  }

  .wp_-ml-86 {
    margin-left: 172rpx;
  }

  .wp_-mt-86 {
    margin-top: 172rpx;
  }

  .wp_-ml-88 {
    margin-left: 176rpx;
  }

  .wp_-mt-88 {
    margin-top: 176rpx;
  }

  .wp_-ml-90 {
    margin-left: 180rpx;
  }

  .wp_-mt-90 {
    margin-top: 180rpx;
  }

  .wp_-ml-92 {
    margin-left: 184rpx;
  }

  .wp_-mt-92 {
    margin-top: 184rpx;
  }

  .wp_-ml-94 {
    margin-left: 188rpx;
  }

  .wp_-mt-94 {
    margin-top: 188rpx;
  }

  .wp_-ml-96 {
    margin-left: 192rpx;
  }

  .wp_-mt-96 {
    margin-top: 192rpx;
  }

  .wp_-ml-98 {
    margin-left: 196rpx;
  }

  .wp_-mt-98 {
    margin-top: 196rpx;
  }

  .wp_-ml-100 {
    margin-left: 200rpx;
  }

  .wp_-mt-100 {
    margin-top: 200rpx;
  }
</style>