<template>
  <div>
    <div class="goods">
      <div class="menu-wrapper">
        <ul><!--current   currentIndex 当前分类的下标-->  <!--分类列表遍历显示-->
          <li class="menu-item " v-for="(good, index) in goods"
              :key="index" :class="{current: currentIndex===index}" @click="selectItem(index)">
            <span class="text bottom-border-1px">  <!--没有图片的让他消失-->
              <img class="icon" v-if="good.icon" :src="good.icon">
              {{good.name}}
            </span>  <!--currentIndex===index，是个bool值，只有一个li为true，另一个为false-->
          </li><!--index) in中哪个li的下标和当前分类的下标相等，就有current-->
        </ul>
      </div>
      <div class="foods-wrapper">
        <ul ref="foodsUl">
          <li class="food-list-hook" v-for="(good, index) in goods" :key="index">  <!--分类列表，进行遍历-->
            <h1 class="title">{{good.name}}</h1>
            <ul>
              <li class="food-item bottom-border-1px" v-for="(food, index) in good.foods" :key="index">
                <div class="icon">
                  <img width="57" height="57" :src="food.icon">
                </div>
                <div class="content">
                  <h2 class="name">{{food.name}}</h2>
                  <p class="desc">{{food.description}}</p>
                  <div class="extra">
                    <span class="count">月售{{food.sellCount}}份</span>
                    <span>好评率{{food.rating}}%</span></div>
                  <div class="price">
                    <span class="now">￥{{food.price}}</span>
                    <span class="old" v-if="food.oldPrice">￥{{food.oldPrice}}</span>
                  </div>
                  <div class="cartcontrol-wrapper">
                    CartControl组件
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
  import {mapState} from 'vuex'
  import BScroll from 'better-scroll'
/*currentIndex 跟右侧滑动的位置有关系，及滚动到某个分类的具体区间有关，一个分类到另一个分类改变*/
/*currentIndex为计算属性，scrollY，tops为data数据，滑动时要将数据保存起来*/

  export default {

    data () {
      return {
        scrollY: 0, // 右侧列表滑动的Y坐标 - - >滑动过程中确定(要有滑动的监视，绑定滑动scroll的监听)
        tops: [], // 右侧所有分类li的top值-->列表初始显示后就确定读取
      }
    },

    mounted () {
      // 利用calback+nextTick()实现在列表数据显示之后才执行
      this.$store.dispatch('getShopGoods', () => { // goods数据已经有了
        this.$nextTick(() => {  //dispatch第二个参数为数据，数据交给action,action接收个函数cb回调
          this._initScroll() //这里代表列表已经显示
          this._initTops()
        })
      })
    },

    computed: {
      ...mapState(['goods']),

      // 1.当前分类的下标:
      currentIndex () {
        const {scrollY, tops} = this
        // [0, 12, 15, 18]  最终在数组tops中找到对应的下标
        // scrollY>=top && scrollY<nextTop    [top, nextTop)

        const index = tops.findIndex((top, index) => scrollY>=top && scrollY<tops[index+1])
        //tops.findIndex((top, index) => 为true找一个匹配元素的下标//findIndex返回的结果为第一个返回true的那个元素的index
        // 只有当index变化时才滑动
        if(index!==BScroll.index) {
          BScroll.index = index
          this._scrollLeftList(index)
        }

        return index    //下标
      }
    },

    methods: {     // menu-wrapper父容器
      _initScroll() {
        // 左侧滚动对象
        this.leftScroll = new BScroll('.menu-wrapper', {
          click: true, //可点击效果
        })
        // 右侧滚动对象
        this.rightScroll = new BScroll('.foods-wrapper', {
          probeType: 1, // 只有当触摸滑动时非实时触发
          click: true, // 分发自定义点击事件
        })

        //（BScroll做的滚动，由实例对象scroll绑定监听）
        // 给右侧列表绑定scroll监听
        this.rightScroll.on('scroll', ({x, y}) => { //x轴的滚动坐标，为0
          console.log('scroll', x, y)
          this.scrollY = Math.abs(y)
        })
        // 给右侧列表绑定scrollEnd监听
        this.rightScroll.on('scrollEnd', ({x, y}) => {//结束的下标
          console.log('scrollEnd', x, y)
          this.scrollY = Math.abs(y)
        })
      },
      //加个 _代表不是时间回调函数，hook为钩子类名，就是根据钩子找到一类元素，类名用来定义样式，定义布局，也是个标识，为一类标签的标识，ref用来标识一个，相当于id,遍历li为多个，不可用ref,使用读取右侧列表分类li的高度，找到这个lifood-list-hook


      // 2.初始化tops数组(给top塞数据)
      _initTops () {
        // 根据所有分类li的高度统计生成一个tops
        const tops = []
        let top = 0
        tops.push(top)  //document.getElements在整个文件里找，比较慢，外围做id,为给父级做标识
        const lis = this.$refs.foodsUl.getElementsByClassName('food-list-hook') //找到所有li，为了获取li高度
        Array.from(lis).forEach(li => { //将伪数组生成真数组，遍历拿出某个li
          top += li.clientHeight  //得到li高度，值累加到top上
          tops.push(top)
        })
        // 更新tops状态数据
        this.tops = tops //数据跑到 tops: []里
        console.log(tops)
      },

      // 选择左侧某个分类项--> 右侧列表滑动到对应位置
      selectItem (index) {
        // 得到目标位置的top值
        const top = this.tops[index]

        // 立即更新scrollY值目标坐标值
        this.scrollY = top

        // 平滑滚动到对应位置
        this.rightScroll.scrollTo(0, -top, 300)
      },

      // 滑动左侧列表到指定下标分类处(尽量, 至少保证可见)
      _scrollLeftList (index) {
        if(this.leftScroll) {
          // 得到左侧当前分类的li
          const li = this.$refs.leftUl.children[index]
          // 滑动到li位
          this.leftScroll.scrollToElement(li, 200)
        }
      }
    }
  }
</script>
<style lang="stylus" rel="stylesheet/stylus">
  @import "../../../common/stylus/mixins.styl"

  .goods
    display: flex
    position: absolute
    top: 237px
    bottom: 46px
    width: 100%
    background: #fff;
    overflow: hidden
    .menu-wrapper
      flex: 0 0 80px
      width: 80px
      background: #f3f5f7
      .menu-item
        display: table
        height: 54px
        width: 56px
        padding: 0 12px
        line-height: 14px
        &.current
          position: relative
          z-index: 10
          margin-top: -1px
          background: #fff
          color: $green
          font-weight: 700
          .text
            border-none()
        .icon
          display: inline-block
          vertical-align: top
          width: 12px
          height: 12px
          margin-right: 2px
          background-size: 12px 12px
          background-repeat: no-repeat
        .text
          display: table-cell
          width: 56px
          vertical-align: middle
          bottom-border-1px(rgba(7, 17, 27, 0.1))
          font-size: 12px
    .foods-wrapper
      flex: 1
      .title
        padding-left: 14px
        height: 26px
        line-height: 26px
        border-left: 2px solid #d9dde1
        font-size: 12px
        color: rgb(147, 153, 159)
        background: #f3f5f7
      .food-item
        display: flex
        margin: 18px
        padding-bottom: 18px
        bottom-border-1px(rgba(7, 17, 27, 0.1))
        &:last-child
          border-none()
          margin-bottom: 0
        .icon
          flex: 0 0 57px
          margin-right: 10px
        .content
          flex: 1
          .name
            margin: 2px 0 8px 0
            height: 14px
            line-height: 14px
            font-size: 14px
            color: rgb(7, 17, 27)
          .desc, .extra
            line-height: 10px
            font-size: 10px
            color: rgb(147, 153, 159)
          .desc
            line-height: 12px
            margin-bottom: 8px
          .extra
            .count
              margin-right: 12px
          .price
            font-weight: 700
            line-height: 24px
            .now
              margin-right: 8px
              font-size: 14px
              color: rgb(240, 20, 20)
            .old
              text-decoration: line-through
              font-size: 10px
              color: rgb(147, 153, 159)
          .cartcontrol-wrapper
            position: absolute
            right: 0
            bottom: 12px
</style>
