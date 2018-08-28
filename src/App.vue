<template>
  <div id="app">
    <router-view/>  <!--其他的路由组件-->
    <FooterGuide v-show="$route.meta.showFooter"/>
  </div>
</template>
<script>
  import FooterGuide from './components/FooterGuide/FooterGuide.vue'

  export default {


   /* async mounted () {//验证接口请求函数可用不,真实不是直接调用接口请求函数，而是分发action
      const result = await reqAddress('41.20038,116.36867')
      console.log(result)  //上面引入 import {reqAddress} from './api'
    },*/

    mounted () {
      // 分发给action发ajax获取address数据
      this.$store.dispatch('getAddress')

    },

    components: {
      FooterGuide
    }
  }
</script>
<style lang="stylus" rel="stylesheet/stylus">
  #app
    width 100%
    height 100%
</style>
