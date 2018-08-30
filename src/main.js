
import Vue from 'vue'
import {Button} from 'mint-ui'
import App from './App.vue'
import router from './router'
import store from './store'

import HeaderTop from './components/HeaderTop/HeaderTop.vue'


import './mock/mockServer'

// 注册全局组件标签
Vue.component('HeaderTop', HeaderTop)
Vue.component(Button.name, Button)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router, // 配置路由器 -->所有组件都多了$router/$route
  store, // 配置vuex的store --> 所有组件对象都多了个$store属性
})
