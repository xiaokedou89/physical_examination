<template>
  <navbar></navbar>
  <div class="login-container">
    <el-card>
      <div class="left"></div>
      <div class="right">
        <h3>{{$t('login')}}</h3>
        <el-form ref="loginForm" :rules="rules" label-position="top" :model="form" autocomplete="on" label-width="80px">
          <el-form-item prop="username" :label="$t('account')">
            <el-input ref="username" v-model="form.username" autocomplete="on"></el-input>
          </el-form-item>
          <el-form-item prop="password" :label="$t('password')">
            <el-input ref="password" v-model="form.password" autocomplete="on" show-password></el-input>
          </el-form-item>
          <el-button :loading="loading" @click="handleLogin">{{$t('login')}}</el-button>
        </el-form>
      </div>
    </el-card>
  </div>
</template>
<script>
import navbar from '../components/nav/navbar.vue'
import * as rule from '@/utils/rules.js'
const rules = {
  username: rule.accountnameRule,
  password: rule.passwordRule
}

export default {
  name: 'login',
  components: { 
    navbar
  },
  created() {
    console.log(import.meta.env.VITE_BASE_API)
    const that = this
    window.addEventListener('keydown', that.keydownEnter, false)
  },
  mounted() {
    if (this.form.username === '') {
      this.$refs.username.focus()
    } else if (this.form.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    const that = this
    window.removeEventListener('keydown', that.keydownEnter, false)
  },
  watch: {
    $route: {
      handler(route) {
        if (route.redirectedFrom) {
          this.redirect = route.redirectedFrom.fullPath
          this.otherQuery = route.redirectedFrom.query
          this.otherParams = route.redirectedFrom.params
        }
      },
      immediate: true
    }
  },
  data() {
    return {
      // 验证规则
      rules,
      loading: false,
      // 要保存的路由
      redirect: undefined,
      // 保存的路由参数
      otherQuery: {},
      otherParams: {},
      // 表单绑定对象
      form: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    test() {
      this.$router.push({
        path: '/goods'
      })
    },
    // 绑定登录的回车事件
    keydownEnter(e) {
      if (e.code == 'Enter') {
        this.handleLogin()
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('login', this.form)
            .then(() => {
              this.$router.push({
                path: this.redirect || '/',
                query: this.otherQuery,
                params: this.otherParams
              })
              this.loading = false
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              this.loading = false
            })
        } else {
          this.$message({
            message: this.$t('validateFail'),
            type: 'error',
            duration: 1500
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100%;
  background: url('@/assets/images/container-bg.png') no-repeat;
  background-size: 110% 130%;
  background-position: center 0;
  padding-top: 8.333rem;
  .el-card {
    width: 52.0833rem;
    // height:500px;
    margin: 0 auto;
    .left {
      width: 57%;
      background: url('@/assets/images/login-bg.png') no-repeat;
      background-size: 100% 100%;
    }
    .right {
      width: 43%;
      padding: 2.6041rem 2.0833rem 5rem;
      h3 {
        width: 100%;
        height: 50px;
        line-height: 50px;
        color: #2b2b2b;
      }
      .el-form:deep label {
        color: #2b2b2b;
        font-size: 16px;
      }
      .el-form:deep .el-input__inner:focus {
        box-shadow: 0 0 0 1px #4943F7 inset;
      }
      .el-button {
        margin-top: 20px;
        background-color: #4943F7;
        width: 100%;
        color: #fff;
      }
    }
  }
  .el-card:deep .el-card__body {
    padding: 0;
    display: flex;
  }
}
</style>