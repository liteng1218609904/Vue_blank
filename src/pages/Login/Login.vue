<template>
  <section class="loginContainer">
    <div class="loginInner">
      <div class="login_header">
        <h2 class="login_logo">硅谷外卖</h2>
        <div class="login_header_title">
          <a href="javascript:;" :class="{on: !loginWay}" @click="loginWay = false">短信登录</a>
          <a href="javascript:;" :class="{on: loginWay}" @click="loginWay = true">密码登录</a>
        </div>
      </div>
      <div class="login_content">
        <form>
          <div :class="{on: !loginWay}">
            <section class="login_message">
              <input type="tel" maxlength="11" placeholder="手机号"  v-model="phone">  <!--:disabled=true不能操作的情况，就不执行button-->
              <button :disabled="!isRightPhone || computeTime>0" class="get_verification"
                      :class="{right_phone_number: isRightPhone}" @click.prevent="sendCode"> <!--不确定有还是没有-->
               {{computeTime > 0 ? `已发送(${computeTime}s)` : '获取验证码'}}
              </button>
            </section>
            <section class="login_verification">
              <input type="tel" maxlength="8" placeholder="验证码"  v-model="code" >
            </section>
            <section class="login_hint">
              温馨提示：未注册硅谷外卖帐号的手机号，登录时将自动注册，且代表已同意
              <a href="javascript:;">《用户服务协议》</a>
            </section>
          </div>
          <div  :class="{on: loginWay}">
            <section>
              <section class="login_message">
                <input type="tel" maxlength="11" placeholder="手机/邮箱/用户名" v-model="name">
              </section>
              <section class="login_verification">
                <input :type="isShowPwd?'text':'password'" maxlength="8" placeholder="密码"  v-model="pwd">
                <div class="switch_button" :class="isShowPwd?'on':'off'" @click="isShowPwd=!isShowPwd">  <!--有on的就需要动态加 :classs实现按钮切换切换-->
                  <div class="switch_circle" :class="{right: !isShowPwd}"></div>  <!--有显示密码有right证明小圆球在右侧，为类名确定-->
                  <span class="switch_text">
                    {{isShowPwd ? 'abc' : ''}}   <!--显示有文本abc,不显示没文本-->
                  </span>
                </div>
              </section>
              <section class="login_message">
                <input type="text" maxlength="11" placeholder="验证码" v-model="captcha">
                <img class="get_verification" src="http://localhost:4000/captcha" alt="captcha"
                     @click="updateCaptcha" ref="captcha">
              </section>
            </section>
          </div>
          <button class="login_submit"  @click.prevent="login">登录</button>
        </form>
        <a href="javascript:;" class="about_us">关于我们</a>
      </div>
      <a href="javascript:" class="go_back"  @click="$router.back()">
        <i class="iconfont icon-jiantou2"></i>
      </a>
    </div>
  </section>
</template>
<script>
  import {Toast, MessageBox} from 'mint-ui'
  import {reqSendCode, reqPwdLogin, reqMsgLogin} from '../../api'

  export default {
    data() {
      return {
        loginWay: true, // false:短信, true: 密码  loginWay登陆方式，两种可能用bool解决
        computeTime: 0, // 倒计时剩余的时间    /*利用它显示界面，0没有计时，显示获取验证码大于0时显示剩余多长时间*/
        phone: '', // 手机号
        code: '', // 短信验证码
        name: '', // 用户名
        pwd: '', // 密码
        captcha: '', // 图形验证码
        isShowPwd: false, // 是否显示密码
      }
    },
    computed: {  /*<!--isRightPhone的结果由phone决定，计算-->*/
      isRightPhone() {
        return /^1\d{10}$/.test(this.phone)  /*匹配手机号是否正确*/
      }
    },


    methods: {
      // 发送一次性短信验证码
      /*启动倒计时，初始30，每隔一秒钟减1，用循环定时器操作。没有输入正确手机号及正在计时时不记时*/
      async sendCode() {
        /*1. 实现倒计时功能*/
        this.computeTime = 30
        // 启循环定时器, 改变computedTime
        const interverId = setInterval(() => {
          this.computeTime--
          // 当计时达到最小值时, 清除定时器
          if (this.computeTime <= 0) {
            this.computeTime = 0   /*小于0让其等于0*/
            clearInterval(interverId)
          }
        }, 1000)


        /*2. 发送请求去发短信验证码*/
        const result = await reqSendCode(this.phone)  /*调用reqSendCode接口函数为异步，加async*/
        if(result.code===0) { // 成功
          Toast('验证码已发送')   //自动消失效果
        } else { // 失败
          // 停止计时
          this.computeTime = 0
          // alert('失败了')
          MessageBox.alert('验证码发送失败', '提示')
        }
      },

      // 更新显示一次性图形验证码
      updateCaptcha(event) { // 每次请求都不一样, 浏览器就会自动发请求获取新的图片
        this.$refs.captcha.src= 'http://localhost:4000/captcha?time=' + Date.now()
      },  //通过标识更新图片


      showAlert(msg) {
        MessageBox.alert(msg)
      },
      // 请求登陆
      async login () {
        //1. 前台表单验证  没有通过验证显示相应的提示
        const {phone, code, name, pwd, captcha} = this
        let result     //全局的，可以看得见
        if(this.loginWay) { // 2密码登陆
          if(!name) {
            this.showAlert('请输入用户名')
            return
          } else if(!pwd) {
            this.showAlert('请输入密码')
            return
          } else if(captcha.length!==4) {
            this.showAlert('请输入4位验证码')
            return
          }
          //4通过后, 提交登陆的请求
          result = await reqPwdLogin({name, pwd, captcha}) //参数形式与API一致
          // 更新验证码
          this.updateCaptcha()

        } else { // 3短信登陆
          if(!this.isRightPhone) { //值为false
            this.showAlert('请输入正确手机号')
            return
          } else if(!/^\d{6}$/.test(code)) {
            this.showAlert('请输入正确的验证码')
            return
          }
          // 5通过后, 提交登陆的请求
          result = await reqMsgLogin(phone, code)
        }

        // 停止计时(登陆成功失败都得计时)
        if(this.computeTime> 0 ) {
          this.computeTime = 0
        }

        // 6根据结果做不同的处理
        if(result.code===0) { // 登陆成功
          const user = result.data  //得到user信息
          // 1. 将user保存到state(后面可以读取，需要用)
          this.$store.dispatch('saveUser', user)   //跟新状态，action用来保存user
          // 2. 自动跳转到个人中心
          this.$router.replace('/profile') //replace就是不希望返回的
        } else { // 登陆失败
          this.showAlert(result.msg)  //msgAPI接口中显示用户名或密码不正确!"
        }
      }
    }


  }
</script>
<style lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixins.styl"

  .loginContainer
    width 100%
    height 100%
    background #fff
    .loginInner
      padding-top 60px
      width 80%
      margin 0 auto
      .login_header
        .login_logo
          font-size 40px
          font-weight bold
          color #02a774
          text-align center
        .login_header_title
          padding-top 40px
          text-align center
          >a
            color #333
            font-size 14px
            padding-bottom 4px
            &:first-child
              margin-right 40px
            &.on
              color #02a774
              font-weight 700
              border-bottom 2px solid #02a774
      .login_content
        >form
          >div
            display none
            &.on
              display block
            input
              width 100%
              height 100%
              padding-left 10px
              box-sizing border-box
              border 1px solid #ddd
              border-radius 4px
              outline 0
              font 400 14px Arial
              &:focus
                border 1px solid #02a774
            .login_message
              position relative
              margin-top 16px
              height 48px
              font-size 14px
              background #fff
              .get_verification
                position absolute
                top 50%
                right 10px
                transform translateY(-50%)
                border 0
                color #ccc
                font-size 14px
                background transparent
                &.right_phone_number    /*手机验证*/
                  color: black
            .login_verification
              position relative
              margin-top 16px
              height 48px
              font-size 14px
              background #fff
              .switch_button
                font-size 12px
                border 1px solid #ddd
                border-radius 8px
                transition background-color .3s,border-color .3s
                padding 0 6px
                width 30px
                height 16px
                line-height 16px
                color #fff
                position absolute
                top 50%
                right 10px
                transform translateY(-50%)
                &.off
                  background #fff
                  .switch_text
                    float right
                    color #ddd
                &.on
                  background #02a774
                >.switch_circle
                //transform translateX(27px)
                  position absolute
                  top -1px
                  left -1px
                  width 16px
                  height 16px
                  border 1px solid #ddd
                  border-radius 50%
                  background #fff
                  box-shadow 0 2px 4px 0 rgba(0,0,0,.1)
                  transition transform .3s
                  &.right
                    transform translateX(27px)
            .login_hint
              margin-top 12px
              color #999
              font-size 14px
              line-height 20px
              >a
                color #02a774
          .login_submit
            display block
            width 100%
            height 42px
            margin-top 30px
            border-radius 4px
            background #4cd96f
            color #fff
            text-align center
            font-size 16px
            line-height 42px
            border 0
        .about_us
          display block
          font-size 12px
          margin-top 20px
          text-align center
          color #999
      .go_back
        position absolute
        top 5px
        left 5px
        width 30px
        height 30px
        >.iconfont
          font-size 20px
          color #999
</style>



